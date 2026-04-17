import { NextResponse } from "next/server";
import { db } from "@/db";
import { reRegistrations, students, classrooms, registrationPayments, academicYears, studentEnrollments } from "@/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";

interface RegistrationPaymentRow {
  id: number;
  payableId: number;
  paymentType: string;
  isPaid: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reqAcademicYearId = searchParams.get("academicYearId");

    // 1. Tentukan Tahun Ajaran Target (Penting: Membuang sampah tahun lalu)
    let targetAcademicYearId = reqAcademicYearId ? Number(reqAcademicYearId) : null;
    if (!targetAcademicYearId) {
      const activeYearRes = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;
    }

    // 2. Query Daftar Ulang dengan Filter Ketat
    const reregList = await db
      .select({
        id: reRegistrations.id,
        status: reRegistrations.status,
        studentId: reRegistrations.studentId,
        student: {
          id: students.id,
          name: students.name,
          classroomId: studentEnrollments.classroomId,
          gender: students.gender,
        }
      })
      .from(reRegistrations)
      .innerJoin(students, eq(reRegistrations.studentId, students.id)) // Hilangkan orphaned records
      .leftJoin(
        studentEnrollments,
        and(
          eq(studentEnrollments.studentId, students.id),
          targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
          isNull(studentEnrollments.deletedAt)
        )
      )
      .where(
        and(
          isNull(reRegistrations.deletedAt),
          isNull(students.deletedAt), // Hilangkan siswa yang sudah dihapus
          eq(students.status, "aktif"), // Pilih hanya siswa aktif
          targetAcademicYearId ? eq(reRegistrations.academicYearId, targetAcademicYearId) : undefined
        )
      )
      .orderBy(desc(reRegistrations.id));

    // Map classrooms
    const classRoomsList = await db
      .select({ id: classrooms.id, name: classrooms.name })
      .from(classrooms);
    const classMap = Object.fromEntries(classRoomsList.map(c => [c.id, c.name]));

    // Map payments
    const reregIds = reregList.map(r => r.id);
    let payments: RegistrationPaymentRow[] = [];
    if (reregIds.length > 0) {
      payments = await db
        .select({
          id: registrationPayments.id,
          payableId: registrationPayments.payableId,
          paymentType: registrationPayments.paymentType,
          isPaid: registrationPayments.isPaid,
        })
        .from(registrationPayments)
        .where(
          and(
            eq(registrationPayments.payableType, "reregistration"),
            isNull(registrationPayments.deletedAt),
            inArray(registrationPayments.payableId, reregIds)
          )
        );
    }

    const paymentMap = payments.reduce((acc, p) => {
      const key = String(p.payableId);
      if (!acc[key]) acc[key] = {};
      acc[key][p.paymentType as string] = p.isPaid;
      return acc;
    }, {} as Record<string, Record<string, boolean>>);

    let confirmed = 0;
    let pending = 0;
    let not_registered = 0;

    const data = reregList.map((reg) => {
      if (reg.status === "confirmed") confirmed++;
      else if (reg.status === "not_registered") not_registered++;
      else pending++;

      const p = paymentMap[reg.id.toString()] || {};

      return {
        id: reg.id,
        student_name: reg.student?.name || "Anonim",
        classroom: reg.student?.classroomId ? classMap[reg.student.classroomId] || "-" : "-",
        gender: reg.student?.gender || "L",
        status: reg.status,
        payment: {
          id: reg.id.toString(),
          is_fee_paid: p["fee"] || false,
          is_books_paid: p["books"] || false,
          is_uniform_paid: p["uniform"] || false,
          is_books_received: p["books_received"] || false,
          is_uniform_received: p["uniform_received"] || false,
        },
      };
    });

    const response = NextResponse.json({
      data,
      total: data.length,
      confirmed,
      pending,
      not_registered,
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error("Reregistration GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data daftar ulang" },
      { status: 500 }
    );
  }
}
