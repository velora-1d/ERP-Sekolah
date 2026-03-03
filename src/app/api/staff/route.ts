import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const staff = await prisma.employee.findMany({
      where: {
        type: "staf",
        deletedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
