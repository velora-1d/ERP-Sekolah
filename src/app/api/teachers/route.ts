import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  try {
    const teachers = await prisma.employee.findMany({
      where: {
        type: "guru",
        deletedAt: null,
        ...(status ? { status } : {}),
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { nip: { contains: search } },
              { position: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { name: "asc" },
    });

    const data = teachers.map((t: any) => ({
      id: t.id,
      name: t.name,
      nip: t.nip,
      position: t.position,
      status: t.status,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
