import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Basic implementation of wipe all transaction data.
    // Extremely dangerous operation: MUST BE USED WITH CAUTION

    await prisma.$transaction([
      prisma.payrollDetail.deleteMany({}),
      prisma.payroll.deleteMany({}),
      prisma.registrationPayment.deleteMany({}),
      prisma.reRegistration.deleteMany({}),
      prisma.ppdbRegistration.deleteMany({}),
      prisma.infaqPayment.deleteMany({}),
      prisma.infaqBill.deleteMany({}),
      prisma.studentSaving.deleteMany({}),
      prisma.generalTransaction.deleteMany({}),
      
      prisma.employeeSalary.deleteMany({}),
      prisma.inventory.deleteMany({}),
      prisma.salaryComponent.deleteMany({}),
      prisma.student.deleteMany({}),
      prisma.employee.deleteMany({}),

      prisma.transactionCategory.deleteMany({}),
      prisma.classroom.deleteMany({}),
      // Account users and settings are explicitly kept
    ]);

    return NextResponse.json({ success: true, message: "Semua data transaksi dan master telah dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus semua data" },
      { status: 500 }
    );
  }
}
