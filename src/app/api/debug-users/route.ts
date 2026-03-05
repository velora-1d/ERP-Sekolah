import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint debug untuk melihat daftar email user yang terdaftar.
 * HAPUS SETELAH SELESAI DEBUG!
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        status: true,
        role: true,
        deletedAt: true,
      }
    });
    
    return NextResponse.json({
      total: users.length,
      users: users,
      raw_db_url_masked: (process.env.POSTGRES_PRISMA_URL || "TIDAK SET").replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@")
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
