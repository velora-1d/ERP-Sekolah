import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/dashboard/charts — Data untuk charts dashboard
 * - Cashflow 6 bulan terakhir
 * - Distribusi pemasukan/pengeluaran
 */
export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      months.push({ label, start: d, end });
    }

    // Cashflow per bulan
    const cashflowData = await Promise.all(
      months.map(async (m) => {
        const [incomeAgg, expenseAgg] = await Promise.all([
          prisma.generalTransaction.aggregate({
            where: { type: "in", status: "valid", deletedAt: null, createdAt: { gte: m.start, lte: m.end } },
            _sum: { amount: true },
          }),
          prisma.generalTransaction.aggregate({
            where: { type: "out", status: "valid", deletedAt: null, createdAt: { gte: m.start, lte: m.end } },
            _sum: { amount: true },
          }),
        ]);
        return {
          month: m.label,
          income: incomeAgg._sum.amount || 0,
          expense: expenseAgg._sum.amount || 0,
        };
      })
    );

    // Distribusi siswa per kelas
    const classDistribution = await prisma.classroom.findMany({
      where: { deletedAt: null },
      select: {
        name: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    });

    // SPP compliance bulan ini
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const [sppTotal, sppLunas] = await Promise.all([
      prisma.infaqBill.count({ where: { deletedAt: null, createdAt: { gte: startMonth, lte: endMonth } } }),
      prisma.infaqBill.count({ where: { status: "lunas", deletedAt: null, createdAt: { gte: startMonth, lte: endMonth } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cashflow: cashflowData,
        classDistribution: classDistribution.map((c) => ({
          name: c.name,
          students: c._count.students,
        })),
        sppCompliance: {
          total: sppTotal,
          lunas: sppLunas,
          rate: sppTotal > 0 ? Math.round((sppLunas / sppTotal) * 100) : 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat data chart" }, { status: 500 });
  }
}
