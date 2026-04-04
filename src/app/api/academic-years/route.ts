import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears } from "@/db/schema";
import { and, ilike, isNull, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const conditions = [isNull(academicYears.deletedAt)];
    if (q) {
      conditions.push(ilike(academicYears.year, `%${q}%`));
    }
    const whereClause = and(...conditions);

    const [list, totalRes] = await Promise.all([
      db.select()
        .from(academicYears)
        .where(whereClause)
        .orderBy(desc(academicYears.year))
        .limit(limit)
        .offset(skip),
      db.select({ count: sql`count(*)`.mapWith(Number) })
        .from(academicYears)
        .where(whereClause),
    ]);

    const total = totalRes[0].count;

    return NextResponse.json(
      { 
        success: true, 
        data: list,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.year) {
      return NextResponse.json({ success: false, message: "Tahun ajaran wajib diisi" }, { status: 400 });
    }

    // Jika isActive true, nonaktifkan tahun ajaran lain
    if (body.isActive) {
      await db.update(academicYears).set({ isActive: false });
    }

    const [newYear] = await db.insert(academicYears).values({
      year: body.year,
      isActive: body.isActive || false,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    }).returning();

    return NextResponse.json({ success: true, message: "Tahun ajaran berhasil ditambahkan", data: newYear });
  } catch (error) {
    console.error("POST Academic Year error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambah tahun ajaran" }, { status: 500 });
  }
}
