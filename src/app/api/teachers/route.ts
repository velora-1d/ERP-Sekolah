import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const teachers = await prisma.employee.findMany({
      where: {
        type: "guru",
        deletedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
