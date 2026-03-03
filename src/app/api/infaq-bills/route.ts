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
    const where: any = { deletedAt: null };
    if (month) where.month = month;
    if (statusFilter) where.status = statusFilter;

    // Jika ada search, kita filter by student name di memori (karena relasi)
    let skip = (page - 1) * limit;

    const bills = await prisma.infaqBill.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, nisn: true, classroomId: true },
        },
        academicYear: {
          select: { id: true, year: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    // Map classroom names
    const classroomIds = bills
      .map(b => b.student?.classroomId)
      .filter((id): id is number => id != null);
    const classrooms = await prisma.classroom.findMany({
      where: { id: { in: [...new Set(classroomIds)] } },
    });
    const classMap = Object.fromEntries(classrooms.map(c => [c.id, c.name]));

    let formattedBills = bills.map(b => {
      const studentName = b.student?.name || "Unknown";
      if (search && !studentName.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }
      return {
        id: b.id,
        student_name: studentName,
        nisn: b.student?.nisn || "-",
        classroom: b.student?.classroomId ? classMap[b.student.classroomId] || "-" : "-",
        academic_year: b.academicYear?.year || "-",
        month: b.month,
        nominal: b.nominal,
        status: b.status,
      };
    }).filter(Boolean);

    const total = formattedBills.length;
    const paginated = formattedBills.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
