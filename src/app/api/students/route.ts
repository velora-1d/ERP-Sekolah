import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";

  try {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { nisn: { contains: search } },
            ]
          : undefined,
      },
      include: {
        classroom: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" },
    });

    const data = students.map((s: any) => ({
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      gender: s.gender,
      category: s.category,
      classroom: s.classroom?.name || null,
      status: s.status,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
