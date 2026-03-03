import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const month = searchParams.get("month") || "";
  const status = searchParams.get("status") || "";

  try {
    const bills = await prisma.infaqBill.findMany({
      where: {
        deletedAt: null,
        ...(month && { month }),
        ...(status && { status }),
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100, // Limit for performance demo
    });

    const studentIds = bills.map(b => parseInt(b.studentId)).filter(id => !isNaN(id));
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
    });
    const academicYearIds = bills.map(b => parseInt(b.academicYearId)).filter(id => !isNaN(id));
    const academicYears = await prisma.academicYear.findMany({
      where: { id: { in: academicYearIds } },
    });

    const formattedBills = bills.map(b => {
      const student = students.find(s => s.id === parseInt(b.studentId));
      const year = academicYears.find(y => y.id === parseInt(b.academicYearId));
      
      // Filter by search term manually if search is provided
      if (search && student && !student.name.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }

      return {
        id: b.id,
        student_name: student?.name || "Unknown",
        nisn: student?.nisn || "-",
        classroom: student?.classroomId || "-",
        academic_year: year?.year || "-",
        month: b.month,
        nominal: b.nominal,
        status: b.status,
      };
    }).filter(Boolean); // Remove nulls from search filter

    return NextResponse.json({ success: true, data: formattedBills });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
