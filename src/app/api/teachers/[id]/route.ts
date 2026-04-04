import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, parseInt(params.id)), isNull(employees.deletedAt)))
      .limit(1);

    if (!employee) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    
    const updateData: Partial<typeof employees.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.nip !== undefined) updateData.nip = body.nip;
    if (body.type !== undefined) updateData.type = body.type as any;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.status !== undefined) updateData.status = body.status as any;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.joinDate !== undefined) updateData.joinDate = body.joinDate;
    if (body.baseSalary !== undefined) updateData.baseSalary = Number(body.baseSalary);

    const [employee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: employee });
  } catch (error) {
    console.error("Employee PUT error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db
      .update(employees)
      .set({ deletedAt: new Date() })
      .where(eq(employees.id, parseInt(params.id)));

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
