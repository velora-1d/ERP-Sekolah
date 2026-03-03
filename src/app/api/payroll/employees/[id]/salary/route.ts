import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/payroll/employees/[id]/salary
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const employeeId = params.id;
    
    // Ambil semua komponen gaji yang aktif
    const components = await prisma.salaryComponent.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' }
    });

    // Ambil setup gaji pegawai saat ini
    const employeeSalaries = await prisma.employeeSalary.findMany({
      where: { employeeId: employeeId }
    });

    // Map nilai rupiah/amount ke komponen
    const result = components.map(c => {
      const existing = employeeSalaries.find(es => es.componentId === String(c.id));
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        amount: existing ? existing.amount : c.defaultAmount
      };
    });

    return NextResponse.json({ components: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil detail gaji pegawai" },
      { status: 500 }
    );
  }
}

// PUT /api/payroll/employees/[id]/salary
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const employeeId = params.id;
    const body = await request.json(); 
    // format body array: [{ component_id: 1, amount: 100000 }, ...]

    await prisma.$transaction(async (tx) => {
      // Hapus yang lama
      await tx.employeeSalary.deleteMany({
        where: { employeeId: employeeId }
      });

      // Insert yang baru
      const dataToInsert = body.map((item: any) => ({
        employeeId: employeeId,
        componentId: String(item.component_id),
        amount: Number(item.amount) || 0
      }));

      if (dataToInsert.length > 0) {
        await tx.employeeSalary.createMany({
          data: dataToInsert
        });
      }
    });

    return NextResponse.json({ success: true, message: "Gaji diperbarui" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan detail gaji" },
      { status: 500 }
    );
  }
}
