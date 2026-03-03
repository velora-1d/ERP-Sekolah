import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  props: { params: Promise<{ type: string }> }
) {
  const params = await props.params;
  try {
    const { type } = params;

    if (type === "infaq") {
      // Rekap Tagihan Infaq / SPP
      const bills = await prisma.infaqBill.findMany({
        where: { deletedAt: null },
      });
      const payments = await prisma.infaqPayment.findMany({
        where: { deletedAt: null },
      });

      // Get students mapped
      const students = await prisma.student.findMany({
        select: { id: true, name: true }
      });
      const studentMap = students.reduce((acc, s) => {
        acc[s.id.toString()] = s.name;
        return acc;
      }, {} as Record<string, string>);

      const paymentMap = payments.reduce((acc, p) => {
        if (!acc[p.billId]) acc[p.billId] = 0;
        acc[p.billId] += p.amountPaid;
        return acc;
      }, {} as Record<string, number>);

      const result = bills.map((bill) => {
        const paid = paymentMap[bill.id.toString()] || 0;
        const amount = bill.nominal || 0;
        const remaining = amount - paid;
        return {
          id: bill.id,
          student_name: studentMap[bill.studentId] || "Anonim",
          month: bill.month + " " + bill.year,
          amount,
          paid,
          remaining: remaining > 0 ? remaining : 0,
          status: remaining <= 0 ? "paid" : "unpaid",
        };
      });

      return NextResponse.json(result);
    } 
    
    if (type === "pendaftaran") {
      // Rekap Pendaftaran PPDB
      const registrations = await prisma.ppdbRegistration.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'desc' }
      });
      return NextResponse.json(registrations);
    }

    if (type === "tabungan") {
      // Rekap Saldo Tabungan per Siswa
      // Cari student yang aktif
      const students = await prisma.student.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, classroomId: true }
      });

      // Minta data kelas
      const classrooms = await prisma.classroom.findMany({
        select: { id: true, name: true }
      });
      const classMap = classrooms.reduce((acc, c) => {
        acc[c.id.toString()] = c.name;
        return acc;
      }, {} as Record<string, string>);

      // Cari total saldo per siswa dari transaksi
      // Kita asumsikan pemasukan (in) menambah balance, penarikan (out) mengurangi.
      // Namun model tabungan biasanya menyimpan balance terakhir atau 
      // bisa kita hitung dari sum 'amount' jika type == deposit - withdrawal
      const savings = await prisma.studentSaving.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' } // Hitung rekap
      });

      const balanceMap = savings.reduce((acc, s) => {
        if (!acc[s.studentId]) acc[s.studentId] = 0;
        if (s.type === 'deposit') {
            acc[s.studentId] += s.amount;
        } else if (s.type === 'withdrawal') {
            acc[s.studentId] -= s.amount;
        }
        return acc;
      }, {} as Record<string, number>);

      const result = students.map((s) => ({
        student_id: s.id,
        student_name: s.name,
        classroom: classMap[s.classroomId] || "-",
        balance: balanceMap[s.id.toString()] || 0
      })).filter(s => s.balance !== 0); // Only show students with balances

      return NextResponse.json(result);
    }

    if (type === "aruskas") {
      // Laporan Arus Kas
      const transactions = await prisma.generalTransaction.findMany({
        where: { deletedAt: null },
        orderBy: { transactionDate: 'desc' }
      });

      // Fetch categories for name mapping
      const categories = await prisma.transactionCategory.findMany();
      const catMap = categories.reduce((acc, c) => {
        acc[c.id.toString()] = c.name;
        return acc;
      }, {} as Record<string, string>);

      let total_income = 0;
      let total_expense = 0;

      const formatted = transactions.map((t) => {
        if (t.type === "in") total_income += t.amount;
        if (t.type === "out") total_expense += t.amount;
        
        return {
          id: t.id,
          date: t.transactionDate || t.createdAt,
          description: t.description,
          category: catMap[t.transactionCategoryId] || "Umum",
          type: t.type === "in" ? "income" : "expense",
          amount: t.amount,
        };
      });

      return NextResponse.json({
        total_income,
        total_expense,
        transactions: formatted
      });
    }

    return NextResponse.json({ error: "Tipe laporan tidak dikenali" }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}
