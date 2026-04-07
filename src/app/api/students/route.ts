import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentEnrollments, classrooms, academicYears } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, isNull, asc, sql } from "drizzle-orm";

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
      conditions.push(eq(studentEnrollments.classroomId, Number(reqClassroomId)));
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
        student: students,
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

    return NextResponse.json({
      success: true,
      data: resultStudents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Students error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = extractStudentData(body);

    if (!data.name) {
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

    // 2. Gunakan transaksi untuk insert siswa dan pendaftaran otomatis
    const student = await db.transaction(async (tx) => {
      const [newStudent] = await tx.insert(students).values(data).returning();

      await tx.insert(studentEnrollments).values({
        studentId: newStudent.id,
        classroomId: data.classroomId,
        academicYearId: targetYearId,
        enrollmentType: "baru",
      });

      return newStudent;
    });

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: student });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === '23505' || err.message?.includes('duplicate key')) {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai siswa lain" }, { status: 400 });
    }
    console.error("Error creating student:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
