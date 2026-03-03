import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/payroll
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const whereClause: any = { deletedAt: null };
    if (month) whereClause.month = month;
    if (year) whereClause.year = year;

    const payrolls = await prisma.payroll.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Ambil data pegawai untuk join nama manual karena ID nya string
    const employeeIds = [...new Set(payrolls.map((p) => Number(p.employeeId)))].filter(id => !isNaN(id));
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true },
    });

    const result = payrolls.map((p) => {
      const emp = employees.find((e) => e.id === Number(p.employeeId));
      return {
        id: p.id,
        code: `PAY-${p.year}${p.month.padStart(2, '0')}-${p.id.toString().padStart(4, '0')}`,
        employee_name: emp ? emp.name : "Unknown",
        total_earning: p.baseSalary + p.totalAllowance, // Base salary gabung allowance
        total_deduction: p.totalDeduction,
        net_salary: p.netSalary,
        status: p.status,
        created_at: p.createdAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data histori penggajian" },
      { status: 500 }
    );
  }
}

// POST /api/payroll/generate
// Body: { month: "1", year: "2025" }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const month = String(body.month || new Date().getMonth() + 1);
    const year = String(body.year || new Date().getFullYear());

    // 1. Ambil semua pegawai aktif
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, status: "aktif" },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada pegawai aktif untuk digenerate" },
        { status: 400 }
      );
    }

    // 2. Ambil semua komponen gaji dan setup gaji pegawai
    const allComponents = await prisma.salaryComponent.findMany({
      where: { deletedAt: null },
    });
    
    const employeeSalaries = await prisma.employeeSalary.findMany();

    // 3. Generate slip gaji per pegawai dalam transaction
    await prisma.$transaction(async (tx) => {
      for (const emp of employees) {
        // Cek apakah sudah digenerate bulan ini
        const existing = await tx.payroll.findFirst({
          where: {
            employeeId: String(emp.id),
            month: month,
            year: year,
            deletedAt: null,
          },
        });

        if (existing) continue; // Skip jika sudah ada

        // Hitung gaji
        let totalEarning = emp.baseSalary || 0;
        let totalDeduction = 0;
        const detailsData: any[] = [];

        // Masukkan base salary sebagai komponen detail jika > 0
        if (emp.baseSalary > 0) {
           detailsData.push({
             componentId: "base",
             componentName: "Gaji Pokok",
             type: "earning",
             amount: emp.baseSalary,
           });
        }

        // Ambil komponen spesifik dari employeeSalaries
        const empComps = employeeSalaries.filter(es => es.employeeId === String(emp.id));
        
        // Loop ke semua master komponen
        for (const comp of allComponents) {
           const setup = empComps.find(es => es.componentId === String(comp.id));
           const amount = setup ? setup.amount : comp.defaultAmount;

           if (amount > 0) {
             if (comp.type === "earning") {
               totalEarning += amount;
             } else {
               totalDeduction += amount;
             }
             
             detailsData.push({
               componentId: String(comp.id),
               componentName: comp.name,
               type: comp.type,
               amount: amount,
             });
           }
        }

        const netSalary = totalEarning - totalDeduction;

        // Create Payroll
        const newPayroll = await tx.payroll.create({
          data: {
            employeeId: String(emp.id),
            month: month,
            year: year,
            baseSalary: emp.baseSalary || 0,
            totalAllowance: totalEarning - (emp.baseSalary || 0),
            totalDeduction: totalDeduction,
            netSalary: netSalary,
            status: "draft",
          },
        });

        // Create Details
        if (detailsData.length > 0) {
          await tx.payrollDetail.createMany({
            data: detailsData.map(d => ({
              ...d,
              payrollId: String(newPayroll.id),
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Generate slip gaji bulanan selesai" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal men-generate penggajian" },
      { status: 500 }
    );
  }
}
