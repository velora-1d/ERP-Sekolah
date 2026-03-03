import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // KPI Data
    const donorsCount = await prisma.wakafDonor.count({ where: { deletedAt: null } });
    const purposesCount = await prisma.wakafPurpose.count({ where: { deletedAt: null } });

    // Transaksi Wakaf (GeneralTransaction yang punya wakafDonorId)
    // Berhubung tipenya string dan jika kosong default="", kita filter yg tidak kosong
    const wakafTxs = await prisma.generalTransaction.findMany({
      where: {
        deletedAt: null,
        wakafDonorId: { not: "" }
      },
      orderBy: { transactionDate: "desc" },
      take: 50 // Limit 50 data terbaru
    });

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // ex: "2023-10"

    let total = 0;
    let monthly = 0;

    // Ambil data detail relasi (manual di kode karena foreign key String manual)
    const donorIds = [...new Set(wakafTxs.map(tx => tx.wakafDonorId).filter(id => id))];
    const purposeIds = [...new Set(wakafTxs.map(tx => tx.wakafPurposeId).filter(id => id))];

    const donors = await prisma.wakafDonor.findMany({
      where: { id: { in: donorIds.map(id => parseInt(id)) } }
    });
    const donorMap = Object.fromEntries(donors.map(d => [d.id.toString(), d.name]));

    const purposes = await prisma.wakafPurpose.findMany({
      where: { id: { in: purposeIds.map(id => parseInt(id)) } }
    });
    const purposeMap = Object.fromEntries(purposes.map(p => [p.id.toString(), p.name]));

    const transactions = wakafTxs.map(tx => {
      total += tx.amount;
      if (tx.transactionDate?.startsWith(currentMonthPrefix)) {
        monthly += tx.amount;
      }

      return {
        id: tx.id,
        date: tx.transactionDate || tx.createdAt.toISOString(),
        amount: tx.amount,
        donor_name: donorMap[tx.wakafDonorId] || "-",
        purpose_name: purposeMap[tx.wakafPurposeId] || "-",
        status: "valid"
      };
    });

    const kpi = {
      total,
      monthly,
      donorCount: donorsCount,
      purposeCount: purposesCount
    };

    return NextResponse.json({ success: true, kpi, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
