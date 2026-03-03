import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/dashboard/summary — Semua data dashboard KPI
 */
export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Hitung paralel
    const [
      siswaAktif,
      totalGuru,
      totalStaff,
      totalKelas,
      tunggakanCount,
      tunggakanSum,
      ppdbStats,
      pemasukanBulanIni,
      pengeluaranBulanIni,
      totalSaldoTabungan,
      totalSaldoKas,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "aktif", deletedAt: null } }),
      prisma.employee.count({ where: { deletedAt: null, position: { contains: "guru", mode: "insensitive" } } }),
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.classroom.count({ where: { deletedAt: null } }),
      prisma.infaqBill.count({ where: { status: "belum_lunas", deletedAt: null } }),
      prisma.infaqBill.aggregate({ where: { status: "belum_lunas", deletedAt: null }, _sum: { nominal: true } }),
      prisma.ppdbRegistration.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.generalTransaction.aggregate({
        where: { type: "in", status: "valid", deletedAt: null, createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.generalTransaction.aggregate({
        where: { type: "out", status: "valid", deletedAt: null, createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.studentSaving.aggregate({
        where: { deletedAt: null },
        _sum: { amount: true },
      }),
      prisma.cashAccount.aggregate({ where: { deletedAt: null }, _sum: { balance: true } }),
    ]);

    const ppdbMap: Record<string, number> = {};
    ppdbStats.forEach((p: any) => { ppdbMap[p.status] = p._count; });

    return NextResponse.json({
      success: true,
      data: {
        siswaAktif,
        totalGuru,
        totalStaff,
        totalKelas,
        tunggakan: { count: tunggakanCount, total: tunggakanSum._sum.nominal || 0 },
        ppdb: {
          total: Object.values(ppdbMap).reduce((s, c) => s + c, 0),
          menunggu: (ppdbMap["menunggu"] || 0) + (ppdbMap["pending"] || 0),
          diterima: ppdbMap["diterima"] || 0,
          ditolak: ppdbMap["ditolak"] || 0,
          converted: ppdbMap["converted"] || 0,
        },
        pemasukanBulanIni: pemasukanBulanIni._sum.amount || 0,
        pengeluaranBulanIni: pengeluaranBulanIni._sum.amount || 0,
        totalSaldoTabungan: totalSaldoTabungan._sum.amount || 0,
        totalSaldoKas: totalSaldoKas._sum.balance || 0,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat dashboard" }, { status: 500 });
  }
}
