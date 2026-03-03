import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reregList = await prisma.reRegistration.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
    });

    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, classroomId: true, gender: true },
    });
    
    const classRooms = await prisma.classroom.findMany({
      select: { id: true, name: true }
    });
    const classMap = classRooms.reduce((acc, c) => {
      acc[c.id.toString()] = c.name;
      return acc;
    }, {} as Record<string, string>);

    const studentMap = students.reduce((acc, s) => {
      acc[s.id.toString()] = s;
      return acc;
    }, {} as Record<string, any>);

    const payments = await prisma.registrationPayment.findMany({
      where: { payableType: "reregistration", deletedAt: null },
    });

    const paymentMap = payments.reduce((acc, p) => {
      if (!acc[p.payableId]) acc[p.payableId] = {};
      acc[p.payableId][p.paymentType] = p.isPaid;
      return acc;
    }, {} as Record<string, Record<string, boolean>>);

    let confirmed = 0;
    let pending = 0;
    let not_registered = 0;

    const data = reregList.map((reg) => {
      if (reg.status === "confirmed") confirmed++;
      else if (reg.status === "not_registered") not_registered++;
      else pending++;

      const s = studentMap[reg.studentId] || {};
      const p = paymentMap[reg.id.toString()] || {};

      return {
        id: reg.id,
        student_name: s.name || "Anonim",
        classroom: classMap[s.classroomId] || "-",
        gender: s.gender || "L",
        status: reg.status,
        payment: {
          id: reg.id.toString(), // ID for toggling
          is_fee_paid: p["fee"] || false,
          is_books_paid: p["books"] || false,
          is_uniform_paid: p["uniform"] || false,
          is_books_received: p["books_received"] || false,
          is_uniform_received: p["uniform_received"] || false,
        },
      };
    });

    return NextResponse.json({
      data,
      total: data.length,
      confirmed,
      pending,
      not_registered,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data daftar ulang" },
      { status: 500 }
    );
  }
}
