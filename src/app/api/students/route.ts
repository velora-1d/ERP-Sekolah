import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentEnrollments, classrooms, academicYears } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, isNull, asc, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

/**
 * Mengekstrak field Dapodik dari body request.
 * Menangani field lama (place_of_birth, father_name dll) DAN field baru (birthPlace, fatherName dll).
 */
function extractStudentData(body: Record<string, unknown>) {
  const b = body as Record<string, string | number | boolean | null | undefined>;
  return {
    name: b.name as string,
    nisn: (b.nisn || "") as string,
    nis: (b.nis || "") as string,
    nik: (b.nik || "") as string,
    noKk: (b.noKk || b.no_kk || "") as string,
    gender: (b.gender || "L") as string,
    religion: (b.religion || "Islam") as string,
    category: (b.category || "reguler") as string,
    status: (b.status || "aktif") as string,
    birthPlace: (b.birthPlace || b.place_of_birth || "") as string,
    birthDate: (b.birthDate || b.date_of_birth || "") as string,
    address: (b.address || "") as string,
    phone: (b.phone || b.parent_phone || "") as string,
    classroomId: (b.classroomId || b.classroom) ? Number(b.classroomId || b.classroom) : null,
    // A. Identitas (Dapodik)
    familyStatus: (b.familyStatus || "") as string,
    siblingCount: b.siblingCount ? Number(b.siblingCount) : null,
    childPosition: b.childPosition ? Number(b.childPosition) : null,
    village: (b.village || "") as string,
    district: (b.district || "") as string,
    residenceType: (b.residenceType || "") as string,
    transportation: (b.transportation || "") as string,
    previousSchool: (b.previousSchool || b.asalTk || "") as string,
    studentPhone: (b.studentPhone || "") as string,
    // B. Periodik
    height: b.height ? Number(b.height) : null,
    weight: b.weight ? Number(b.weight) : null,
    distanceToSchool: (b.distanceToSchool || "") as string,
    travelTime: b.travelTime ? Number(b.travelTime) : null,
    // C. Orang Tua
    fatherName: (b.fatherName || b.father_name || "") as string,
    fatherNik: (b.fatherNik || "") as string,
    fatherBirthPlace: (b.fatherBirthPlace || "") as string,
    fatherBirthDate: (b.fatherBirthDate || "") as string,
    fatherEducation: (b.fatherEducation || "") as string,
    fatherOccupation: (b.fatherOccupation || "") as string,
    motherName: (b.motherName || b.mother_name || "") as string,
    motherNik: (b.motherNik || "") as string,
    motherBirthPlace: (b.motherBirthPlace || "") as string,
    motherBirthDate: (b.motherBirthDate || "") as string,
    motherEducation: (b.motherEducation || "") as string,
    motherOccupation: (b.motherOccupation || "") as string,
    parentIncome: (b.parentIncome || "") as string,
    // D. Wali
    guardianName: (b.guardianName || "") as string,
    guardianNik: (b.guardianNik || "") as string,
    guardianBirthPlace: (b.guardianBirthPlace || "") as string,
    guardianBirthDate: (b.guardianBirthDate || "") as string,
    guardianEducation: (b.guardianEducation || "") as string,
    guardianOccupation: (b.guardianOccupation || "") as string,
    guardianAddress: (b.guardianAddress || "") as string,
    guardianPhone: (b.guardianPhone || "") as string,
    // E. Administrasi
    infaqStatus: (b.infaqStatus || "reguler") as string,
    infaqNominal: b.infaqNominal ? Number(b.infaqNominal) : 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const reqClassroomId = searchParams.get("classroomId") || searchParams.get("classroom") || "";
  const reqAcademicYearId = searchParams.get("academicYearId") || "";
  const gender = searchParams.get("gender") || "";
  const status = searchParams.get("status") || "aktif";
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");

  try {
    // 1. Tentukan Tahun Ajaran Target
    let targetAcademicYearId = reqAcademicYearId ? Number(reqAcademicYearId) : null;
    if (!targetAcademicYearId) {
      const activeYearRes = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;
    }

    // 2. Bangun Filter Enrollment (Sumber Utama Kebenaran Data per Tahun Ajaran)
    const conditions = [
      isNull(studentEnrollments.deletedAt),
      isNull(students.deletedAt)
    ];

    if (targetAcademicYearId) {
      conditions.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
    }

    if (reqClassroomId) {
      if (reqClassroomId === "none") {
        conditions.push(isNull(studentEnrollments.classroomId));
      } else {
        conditions.push(eq(studentEnrollments.classroomId, Number(reqClassroomId)));
      }
    }

    if (search) {
      const searchCondition = or(
        ilike(students.name, `%${search}%`),
        ilike(students.nisn, `%${search}%`),
        ilike(students.nis, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (gender) {
      conditions.push(eq(students.gender, gender));
    }

    if (status) {
      conditions.push(eq(students.status, status));
    }

    if (ageMin || ageMax) {
      if (ageMin) {
        const d = new Date();
        const maxDate = new Date(d.getFullYear() - Number(ageMin), d.getMonth(), d.getDate()).toISOString();
        conditions.push(lte(students.birthDate, maxDate));
      }
      if (ageMax) {
        const d = new Date();
        const minDate = new Date(d.getFullYear() - Number(ageMax) - 1, d.getMonth(), d.getDate() + 1).toISOString();
        conditions.push(gte(students.birthDate, minDate));
      }
    }

    const whereClause = and(...conditions);

    const [enrollmentsRes, totalRes] = await Promise.all([
      db.select({
        student: {
          id: students.id,
          name: students.name,
          nisn: students.nisn,
          nis: students.nis,
          nik: students.nik,
          gender: students.gender,
          category: students.category,
          status: students.status,
          birthPlace: students.birthPlace,
          birthDate: students.birthDate,
          phone: students.phone,
          address: students.address,
        },
        enrollmentId: studentEnrollments.id,
        enrollmentType: studentEnrollments.enrollmentType,
        classroom: {
          id: classrooms.id,
          name: classrooms.name
        },
        academicYear: {
          id: academicYears.id,
          year: academicYears.year
        }
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(studentEnrollments.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(whereClause)
    ]);

    // Transform agar format output tetap sama dengan yang diharapkan frontend (List of Students)
    const resultStudents = enrollmentsRes.map(e => ({
      ...e.student,
      classroom: e.classroom,
      enrollment: {
        id: e.enrollmentId,
        enrollmentType: e.enrollmentType,
        academicYear: e.academicYear
      }
    }));

    const total = totalRes[0].count;

    const response = NextResponse.json({
      success: true,
      data: resultStudents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });

    // Optimasi: Tambahkan cache header untuk mengurangi beban DB pada request repetitif
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=30, stale-while-revalidate=60'
    );

    return response;
  } catch (error: unknown) {
    console.error("GET Students error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = extractStudentData(body);

    if (!data.name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama siswa wajib diisi" }, { status: 400 });
    }

    // 1. Cari tahun ajaran aktif
    const activeYearRes = await db.select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);
    
    if (activeYearRes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran di menu Pengaturan terlebih dahulu." 
      }, { status: 400 });
    }

    const targetYearId = activeYearRes[0].id;

    // 2. Cek Duplikasi (termasuk yang di-soft delete)
    // Kita cek berdasarkan NISN atau NIK (karena ini unik di Dapodik)
    // Nama saja tidak cukup unik, tapi jika NISN & NIK kosong (jarang di Dapodik), kita cek Nama + Tgl Lahir
    const existing = await db.select()
      .from(students)
      .where(
        or(
          data.nisn ? eq(students.nisn, data.nisn.trim()) : undefined,
          data.nik ? eq(students.nik, data.nik.trim()) : undefined,
          and(
            ilike(students.name, data.name.trim()),
            data.birthDate ? eq(students.birthDate, data.birthDate) : undefined
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];

      // Jika masih aktif
      if (!record.deletedAt) {
        return NextResponse.json({ 
          success: false, 
          message: `Siswa dengan Nama/NISN/NIK tersebut sudah terdaftar dan masih aktif.` 
        }, { status: 400 });
      }

      // Jika terhapus, lakukan Restore
      const student = await db.transaction(async (tx) => {
        // A. Update data utama & hilangkan deletedAt
        const [restored] = await tx.update(students)
          .set({
            ...data,
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(students.id, record.id))
          .returning();

        // B. Cek pendaftaran di tahun ajaran aktif
        const existingEnrollment = await tx.select()
          .from(studentEnrollments)
          .where(and(
            eq(studentEnrollments.studentId, record.id),
            eq(studentEnrollments.academicYearId, targetYearId),
            isNull(studentEnrollments.deletedAt)
          ))
          .limit(1);
        
        if (existingEnrollment.length === 0) {
           await tx.insert(studentEnrollments).values({
            studentId: record.id,
            classroomId: data.classroomId,
            academicYearId: targetYearId,
            enrollmentType: "kembali", // Mark sebagai siswa yang kembali/restore
          });
        } else {
           // Jika sudah ada enrollment aktif (aneh tapi mungkin), update kelasnya
           await tx.update(studentEnrollments)
            .set({ classroomId: data.classroomId, updatedAt: new Date() })
            .where(eq(studentEnrollments.id, existingEnrollment[0].id));
        }

        return restored;
      });

      return NextResponse.json({ 
        success: true, 
        message: "Data siswa yang sebelumnya terhapus telah diaktifkan kembali dan didaftarkan pada tahun ajaran aktif.", 
        data: student,
        isRestored: true 
      });
    }

    // 3. Insert Baru (Gunakan transaksi)
    const newStudent = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(students).values(data).returning();

      await tx.insert(studentEnrollments).values({
        studentId: inserted.id,
        classroomId: data.classroomId,
        academicYearId: targetYearId,
        enrollmentType: "baru",
      });

      return inserted;
    });

    revalidateTag("students", "page");

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: newStudent });
  } catch (error: unknown) {
    console.error("Error creating student:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === '23505' || err.message?.includes('duplicate key')) {
      return NextResponse.json({ success: false, message: "NISN atau NIK sudah dipakai siswa lain" }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
