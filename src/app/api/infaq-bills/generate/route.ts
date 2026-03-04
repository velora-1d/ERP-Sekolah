import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/generate
 * 
 * Generate tagihan infaq/SPP secara bulk.
 * 
 * Input:
 *   - period: "bulanan" | "semester" (default: "bulanan")
 *   - months: string[]         → wajib jika period = "bulanan"
 *   - semester: 1 | 2          → wajib jika period = "semester"
 *   - year: string             → wajib
 *   - classroomId?: number     → opsional (filter kelas)
 *   - academicYearId?: number  → opsional (filter tahun ajaran)
 * 
 * Logic:
 *   1. Resolve bulan berdasarkan period + semester/months
 *   2. Query siswa aktif sesuai filter
 *   3. Validasi nominal sudah diatur (>0) untuk siswa wajib bayar
 *   4. Cek duplikasi tagihan
 *   5. Buat InfaqBill per siswa per bulan (atomik via $transaction)
 */

const SEMESTER_1_MONTHS = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const SEMESTER_2_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { period, months, semester, year, classroomId, academicYearId } = body;

    // ================================================
    // 1. Resolve bulan berdasarkan period
    // ================================================
    const resolvedPeriod = period || "bulanan";
    let resolvedMonths: string[] = [];

    if (resolvedPeriod === "semester") {
      // Mode semester → resolve otomatis dari parameter "semester"
      const sem = Number(semester);
      if (sem === 1) {
        resolvedMonths = [...SEMESTER_1_MONTHS];
      } else if (sem === 2) {
        resolvedMonths = [...SEMESTER_2_MONTHS];
      } else {
        return NextResponse.json(
          { success: false, message: "Semester harus 1 atau 2" },
          { status: 400 }
        );
      }
    } else {
      // Mode bulanan → pakai array months dari input
      if (!months || !Array.isArray(months) || months.length === 0) {
        return NextResponse.json(
          { success: false, message: "Bulan wajib diisi (array, minimal 1)" },
          { status: 400 }
        );
      }
      resolvedMonths = months.map(String);
    }

    if (!year) {
      return NextResponse.json(
        { success: false, message: "Tahun wajib diisi" },
        { status: 400 }
      );
    }

    // ================================================
    // 2. Query siswa aktif (filter kelas / tahun ajaran)
    // ================================================
    const studentWhere: any = {
      deletedAt: null,
      status: "aktif",
    };
    if (classroomId) {
      studentWhere.classroomId = Number(classroomId);
    }
    if (academicYearId) {
      studentWhere.classroom = {
        academicYearId: Number(academicYearId)
      };
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        name: true,
        category: true,
        infaqNominal: true,
        infaqStatus: true,
        classroomId: true,
        classroom: { select: { infaqNominal: true, name: true } },
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada siswa aktif yang ditemukan" },
        { status: 400 }
      );
    }

    // ================================================
    // 3. Validasi STRICT — Nominal harus sudah diatur
    //    Tagihan TIDAK BOLEH dibuat jika nominal belum ditentukan.
    // ================================================
    const invalidStudents = students.filter(s => {
      const cat = (s.category || "reguler").toLowerCase();
      const status = (s.infaqStatus || "reguler").toLowerCase();

      // Siswa gratis tidak perlu validasi nominal
      if (cat !== "reguler" && status === "gratis") return false;

      // Untuk siswa potongan/subsidi → cek infaqNominal per siswa
      if (status === "potongan" || status === "subsidi") {
        return !s.infaqNominal || s.infaqNominal <= 0;
      }

      // Untuk siswa reguler / bayar penuh → cek nominal kelas
      return !s.classroom?.infaqNominal || s.classroom.infaqNominal <= 0;
    });

    if (invalidStudents.length > 0) {
      // Kumpulkan nama kelas yang bermasalah
      const kelasSet = new Set<string>();
      invalidStudents.forEach(s => {
        if (s.classroom?.name) kelasSet.add(s.classroom.name);
      });
      const kelasInfo = kelasSet.size > 0 ? ` (Kelas: ${[...kelasSet].join(", ")})` : "";

      return NextResponse.json({
        success: false,
        message: `Nominal SPP / Infaq belum diatur. Silakan atur nominal terlebih dahulu.${kelasInfo} Terdapat ${invalidStudents.length} siswa yang belum memiliki tarif.`,
        invalidCount: invalidStudents.length
      }, { status: 400 });
    }

    // ================================================
    // 4. Cek duplikasi — tagihan yang sudah ada
    // ================================================
    const existingBills = await prisma.infaqBill.findMany({
      where: {
        year: String(year),
        month: { in: resolvedMonths },
        deletedAt: null,
        studentId: { in: students.map(s => s.id) },
      },
      select: { studentId: true, month: true },
    });

    const existingSet = new Set(
      existingBills.map(b => `${b.studentId}-${b.month}`)
    );

    // ================================================
    // 5. Siapkan data tagihan baru (skip duplikasi)
    // ================================================
    const billsToCreate: {
      studentId: number;
      month: string;
      year: string;
      nominal: number;
      status: string;
      unitId: string;
      academicYearId: number | null;
    }[] = [];

    for (const student of students) {
      for (const month of resolvedMonths) {
        const key = `${student.id}-${String(month)}`;
        if (existingSet.has(key)) continue;

        // === Logic Kategori Siswa ===
        const kelasNominal = student.classroom?.infaqNominal || 0;
        let nominal = 0;
        let billStatus = "belum_lunas";

        const cat = (student.category || "reguler").toLowerCase();
        const status = (student.infaqStatus || "reguler").toLowerCase();

        if (cat === "reguler") {
          // Reguler: WAJIB bayar penuh → pakai nominal kelas
          nominal = kelasNominal;
        } else {
          // Kurang Mampu / Yatim Piatu → tergantung infaqStatus
          if (status === "gratis") {
            nominal = 0;
            billStatus = "lunas"; // Auto lunas
          } else if (status === "potongan" || status === "subsidi") {
            // Potongan: pakai nominal custom per siswa
            nominal = student.infaqNominal || 0;
          } else {
            // bayar_penuh / reguler → pakai nominal kelas
            nominal = kelasNominal;
          }
        }

        billsToCreate.push({
          studentId: student.id,
          month: String(month),
          year: String(year),
          nominal,
          status: billStatus,
          unitId: user.unitId || "",
          academicYearId: academicYearId ? Number(academicYearId) : null,
        });
      }
    }

    if (billsToCreate.length === 0) {
      return NextResponse.json(
        { success: false, message: "Semua tagihan untuk periode dan tahun tersebut sudah ada" },
        { status: 400 }
      );
    }

    // ================================================
    // 6. Buat tagihan dalam transaction (atomik)
    // ================================================
    const result = await prisma.$transaction(async (tx) => {
      return tx.infaqBill.createMany({
        data: billsToCreate,
      });
    });

    const periodeDesc = resolvedPeriod === "semester"
      ? `Semester ${semester}`
      : `${resolvedMonths.length} bulan`;

    return NextResponse.json({
      success: true,
      message: `Berhasil generate ${result.count} tagihan untuk ${students.length} siswa × ${periodeDesc}`,
      count: result.count,
      skipped: existingBills.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Generate infaq bills error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal generate tagihan" },
      { status: 500 }
    );
  }
}
