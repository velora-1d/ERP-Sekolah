import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments, reRegistrations, students, academicYears } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Dapatkan Tahun Ajaran Aktif
    const activeYearRes = await db.select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);
    const activeYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;

    // 2. Query pembayaran hanya untuk siswa aktif dan tahun ajaran aktif
    const paymentsList = await db
      .select({
        paymentType: registrationPayments.paymentType,
        nominal: registrationPayments.nominal,
      })
      .from(registrationPayments)
      .innerJoin(reRegistrations, eq(registrationPayments.payableId, reRegistrations.id))
      .innerJoin(students, eq(reRegistrations.studentId, students.id))
      .where(
        and(
          eq(registrationPayments.payableType, "reregistration"),
          eq(registrationPayments.isPaid, true),
          isNull(registrationPayments.deletedAt),
          isNull(reRegistrations.deletedAt),
          isNull(students.deletedAt),
          eq(students.status, 'aktif'),
          activeYearId ? eq(reRegistrations.academicYearId, activeYearId) : undefined
        )
      );

    let total_fee = 0, count_fee = 0;
    let total_books = 0, count_books = 0;
    let total_uniform = 0, count_uniform = 0;

    paymentsList.forEach((p) => {
      if (p.paymentType === "fee") {
        total_fee += p.nominal;
        count_fee++;
      } else if (p.paymentType === "books") {
        total_books += p.nominal;
        count_books++;
      } else if (p.paymentType === "uniform") {
        total_uniform += p.nominal;
        count_uniform++;
      }
    });

    return NextResponse.json({
      total_fee,
      count_fee,
      total_books,
      count_books,
      total_uniform,
      count_uniform,
      grand_total: total_fee + total_books + total_uniform,
    });
  } catch (error) {
    console.error("Reregistration Stats GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik pembayaran" },
      { status: 500 }
    );
  }
}
