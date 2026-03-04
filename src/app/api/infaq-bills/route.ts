import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const month = searchParams.get("month") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  try {
    // Build where clause — search sekarang di database, bukan di memori
    const where: any = { deletedAt: null };
    if (month) where.month = month;
    if (statusFilter) where.status = statusFilter;
    if (search) {
      where.student = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [bills, total] = await Promise.all([
      prisma.infaqBill.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, nisn: true, classroomId: true },
          },
          academicYear: {
            select: { id: true, year: true },
          },
          payments: {
            where: { deletedAt: null },
            select: { amountPaid: true },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.infaqBill.count({ where }),
    ]);

    // Map classroom names — hanya untuk halaman ini
    const classroomIds = bills
      .map(b => b.student?.classroomId)
      .filter((id): id is number => id != null);
    const classrooms = classroomIds.length > 0
      ? await prisma.classroom.findMany({
          where: { id: { in: [...new Set(classroomIds)] } },
          select: { id: true, name: true },
        })
      : [];
    const classMap = Object.fromEntries(classrooms.map(c => [c.id, c.name]));

    const formattedBills = bills.map(b => {
      const totalPaid = b.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        id: b.id,
        student_id: b.studentId,
        student_name: b.student?.name || "Unknown",
        nisn: b.student?.nisn || "-",
        classroom: b.student?.classroomId ? classMap[b.student.classroomId] || "-" : "-",
        academic_year: b.academicYear?.year || "-",
        month: b.month,
        year: b.year,
        nominal: b.nominal,
        total_paid: totalPaid,
        remaining: Math.max(0, b.nominal - totalPaid),
        status: b.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBills,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Infaq bills GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
