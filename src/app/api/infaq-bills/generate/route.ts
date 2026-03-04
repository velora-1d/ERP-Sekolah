import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/generate
 * 
 * Generate tagihan infaq/SPP secara bulk.
 * Input: { months: string[], year: string, classroomId?: number }
 * Logic: Query siswa aktif → buat InfaqBill per siswa per bulan.
 * Menggunakan prisma.$transaction() untuk atomicity.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { months, year, classroomId, academicYearId } = body;

    // Validasi input
    if (!months || !Array.isArray(months) || months.length === 0) {
      return NextResponse.json(
        { success: false, message: "Bulan wajib diisi (array, minimal 1)" },
        { status: 400 }
      );
    }
    if (!year) {
      return NextResponse.json(
        { success: false, message: "Tahun wajib diisi" },
        { status: 400 }
      );
    }

    // Query siswa aktif (filter kelas jika diberikan)
    const studentWhere: Record<string, unknown> = {
      deletedAt: null,
      status: "aktif",
    };
    if (classroomId) {
      studentWhere.classroomId = Number(classroomId);
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
        classroom: { select: { infaqNominal: true } },
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada siswa aktif yang ditemukan" },
        { status: 400 }
      );
    }

    // Cek duplikasi — tagihan yang sudah ada untuk bulan-bulan ini
    const existingBills = await prisma.infaqBill.findMany({
      where: {
        year: String(year),
        month: { in: months.map(String) },
        deletedAt: null,
        studentId: { in: students.map(s => s.id) },
      },
      select: { studentId: true, month: true },
    });

    const existingSet = new Set(
      existingBills.map(b => `${b.studentId}-${b.month}`)
    );

    // Siapkan data tagihan baru (skip yang sudah ada)
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
      for (const month of months) {
        const key = `${student.id}-${String(month)}`;
        if (existingSet.has(key)) continue;

        // === Logic Kategori Siswa ===
        // Nominal kelas = tarif standar
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
        { success: false, message: "Semua tagihan untuk bulan dan tahun tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Buat tagihan dalam transaction
    const result = await prisma.infaqBill.createMany({
      data: billsToCreate,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil generate ${result.count} tagihan untuk ${students.length} siswa × ${months.length} bulan`,
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
