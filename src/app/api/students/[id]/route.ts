import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms, infaqBills, studentSavings, studentEnrollments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth();
    const id = parseInt(params.id);

    const [student] = await db.select().from(students)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .limit(1);

    if (!student) return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });

    // Get classroom
    let classroom = null;
    if (student.classroomId) {
      const [cls] = await db.select().from(classrooms).where(eq(classrooms.id, student.classroomId)).limit(1);
      classroom = cls || null;
    }

    // Get bills
    const bills = await db.select().from(infaqBills)
      .where(and(eq(infaqBills.studentId, id), isNull(infaqBills.deletedAt)))
      .orderBy(desc(infaqBills.month))
      .limit(12);

    // Get savings
    const savings = await db.select().from(studentSavings)
      .where(and(eq(studentSavings.studentId, id), isNull(studentSavings.deletedAt), eq(studentSavings.status, "active" as any)))
      .orderBy(desc(studentSavings.createdAt))
      .limit(10);

    // Enrollments
    const enrollmentList = await db.select({
      id: studentEnrollments.id,
      classroomId: studentEnrollments.classroomId,
      academicYearId: studentEnrollments.academicYearId,
      classroomName: classrooms.name,
    })
    .from(studentEnrollments)
    .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
    .where(eq(studentEnrollments.studentId, id))
    .orderBy(desc(studentEnrollments.createdAt));

    // Hitung saldo tabungan
    const [{ totalSetor }] = await db.select({ totalSetor: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "setor" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));
    const [{ totalTarik }] = await db.select({ totalTarik: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "tarik" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

    const savingsBalance = totalSetor - totalTarik;
    const tunggakan = bills.filter(b => b.status === "belum_lunas").length;

    return NextResponse.json({
      success: true,
      data: { ...student, classroom, infaqBills: bills, savings, enrollments: enrollmentList, savingsBalance, tunggakanCount: tunggakan }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();

    const updateData: Partial<typeof students.$inferInsert> = {
      updatedAt: new Date(),
    };

    const keys = [
      "name", "nisn", "nis", "nik", "noKk", "gender", "religion", "category",
      "status", "birthPlace", "birthDate", "address", "phone", "classroomId",
      "familyStatus", "siblingCount", "childPosition", "village", "district",
      "residenceType", "transportation", "studentPhone", "height", "weight",
      "distanceToSchool", "travelTime", "fatherName", "fatherNik",
      "fatherBirthPlace", "fatherBirthDate", "fatherEducation",
      "fatherOccupation", "motherName", "motherNik", "motherBirthPlace",
      "motherBirthDate", "motherEducation", "motherOccupation", "parentIncome",
      "guardianName", "guardianNik", "guardianBirthPlace", "guardianBirthDate",
      "guardianEducation", "guardianOccupation", "guardianAddress",
      "guardianPhone", "infaqStatus", "infaqNominal"
    ];

    if (body.no_kk !== undefined && body.noKk === undefined) updateData.noKk = body.no_kk;
    if (body.place_of_birth !== undefined && body.birthPlace === undefined) updateData.birthPlace = body.place_of_birth;
    if (body.date_of_birth !== undefined && body.birthDate === undefined) updateData.birthDate = body.date_of_birth;
    if (body.parent_phone !== undefined && body.phone === undefined) updateData.phone = body.parent_phone;
    if (body.classroom !== undefined && body.classroomId === undefined) updateData.classroomId = body.classroom ? Number(body.classroom) : null;
    if (body.father_name !== undefined && body.fatherName === undefined) updateData.fatherName = body.father_name;
    if (body.mother_name !== undefined && body.motherName === undefined) updateData.motherName = body.mother_name;

    for (const key of keys) {
      if (body[key] !== undefined) {
        if (["siblingCount", "childPosition", "height", "weight", "travelTime"].includes(key)) {
           (updateData as any)[key] = body[key] ? Number(body[key]) : null;
        } else if (["classroomId", "infaqNominal"].includes(key)) {
           (updateData as any)[key] = body[key] ? Number(body[key]) : (key === "infaqNominal" ? 0 : null);
        } else {
           (updateData as any)[key] = body[key];
        }
      }
    }

    const [student] = await db.update(students).set(updateData).where(eq(students.id, parseInt(params.id))).returning();

    return NextResponse.json({ success: true, message: "Data siswa berhasil diupdate", data: student });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === '23505') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai" }, { status: 400 });
    }
    console.error("Error updating student:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db.update(students).set({ deletedAt: new Date() }).where(eq(students.id, parseInt(params.id)));
    return NextResponse.json({ success: true, message: "Data dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
