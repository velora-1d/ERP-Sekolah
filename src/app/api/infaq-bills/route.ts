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
        ...(month && { month: parseInt(month) }),
        ...(status && { status }),
        ...(search && {
          student: {
            name: { contains: search, mode: "insensitive" }
          }
        })
      },
      include: {
        student: {
          include: {
            classroom: true
          }
        },
        academicYear: true
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100, // Limit for performance demo
    });

    const formattedBills = bills.map(b => ({
      id: b.id,
      student_name: b.student?.name,
      nisn: b.student?.nisn,
      classroom: b.student?.classroom?.name,
      academic_year: b.academicYear?.name,
      month: b.month,
      nominal: b.nominal,
      status: b.status,
    }));

    return NextResponse.json({ success: true, data: formattedBills });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
