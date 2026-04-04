import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, asc, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'guru' or 'staf'
  const search = searchParams.get("q") || "";

  try {
    const conditions = [isNull(employees.deletedAt)];
    if (type) {
      conditions.push(eq(employees.type, type));
    }
    if (search) {
      const searchCondition = or(
        ilike(employees.name, `%${search}%`),
        ilike(employees.nip, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const data = await db
      .select()
      .from(employees)
      .where(and(...conditions))
      .orderBy(asc(employees.name));

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Employees GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, message: "Nama pegawai wajib diisi" }, { status: 400 });
    }

    const [newEmployee] = await db.insert(employees).values({
      name: body.name,
      nip: body.nip || "",
      type: (body.type || "staf") as any,
      position: body.position || "",
      status: (body.status || "aktif") as any,
      phone: body.phone || "",
      address: body.address || "",
      joinDate: body.joinDate || null,
      baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
    }).returning();

    return NextResponse.json({ success: true, message: "Pegawai berhasil ditambahkan", data: newEmployee });
  } catch (error) {
    console.error("POST Employee error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambah pegawai" }, { status: 500 });
  }
}
