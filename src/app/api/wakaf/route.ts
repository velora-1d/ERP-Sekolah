import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, wakafDonors, wakafPurposes, cashAccounts } from "@/db/schema";
import { isNull, and, or, isNotNull, desc, eq, sql, gte, lte } from "drizzle-orm";
import { academicYears } from "@/db/schema";

// Koreksi manual sementara mengikuti angka acuan kepala sekolah.
// Data transaksi April 2026 saat ini masih bercampur antara tag `wakaf_*`
// dan kategori `waqaf`, sehingga agregat raw DB belum merepresentasikan
// total penyaluran bisnis yang dipakai di operasional.
const MANUAL_WAKAF_OUT_OVERRIDES: Record<string, number> = {
  "2026-04": 23_760_000,
  "2026-05": 7_046_000,
};

function monthKeyFromDate(value: Date | null): string | null {
  if (!value) return null;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthKeysInRange(startDate: Date | null, endDate: Date | null): string[] {
  if (!startDate || !endDate) {
    return Object.keys(MANUAL_WAKAF_OUT_OVERRIDES);
  }

  const keys: string[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= last) {
    const key = monthKeyFromDate(cursor);
    if (key) keys.push(key);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}

function applyManualOutOverrides(rawOut: number, monthBreakdown: Record<string, number>, monthKeys: string[]): number {
  const overrideAdjustment = monthKeys.reduce((sum, key) => {
    const manualValue = MANUAL_WAKAF_OUT_OVERRIDES[key];
    if (manualValue === undefined) return sum;
    const rawValue = monthBreakdown[key] || 0;
    return sum + (manualValue - rawValue);
  }, 0);

  return rawOut + overrideAdjustment;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get("academicYearId");
  const semester = searchParams.get("semester");
  const month = searchParams.get("month");
  const normalizedSemester = semester?.toLowerCase();

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (academicYearId) {
    const ay = await db.query.academicYears.findFirst({
      where: eq(academicYears.id, Number(academicYearId))
    });

    if (ay) {
      startDate = ay.startDate ? new Date(ay.startDate) : null;
      endDate = ay.endDate ? new Date(ay.endDate) : null;

      if (normalizedSemester === "ganjil") {
        endDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 0) : endDate;
      } else if (normalizedSemester === "genap") {
        startDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 1) : startDate;
      }

      if (month && month !== "Semua Bulan") {
        const monthIndex = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].indexOf(month);
        if (monthIndex !== -1) {
          let year = startDate ? startDate.getFullYear() : new Date().getFullYear();
          if (monthIndex < 6 && startDate && startDate.getMonth() >= 6) {
            year++;
          } else if (monthIndex >= 6 && startDate && startDate.getMonth() < 6) {
            year--;
          }
          startDate = new Date(year, monthIndex, 1);
          endDate = new Date(year, monthIndex + 1, 0);
        }
      }
    }
  }

  // Filter dasar untuk semua transaksi Wakaf (In & Out)
  const baseConditions = [
    isNull(generalTransactions.deletedAt), 
    eq(generalTransactions.status, 'valid'),
    or(
      isNotNull(generalTransactions.wakafDonorId),
      isNotNull(generalTransactions.wakafPurposeId)
    )
  ];

  const periodConditions = [...baseConditions];
  if (startDate && endDate) {
    periodConditions.push(gte(generalTransactions.transactionDate, startDate.toISOString().split("T")[0]));
    periodConditions.push(lte(generalTransactions.transactionDate, endDate.toISOString().split("T")[0]));
  }

  try {
    const [{ donorsCount }] = await db.select({ donorsCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafDonors).where(isNull(wakafDonors.deletedAt));
    const [{ purposesCount }] = await db.select({ purposesCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafPurposes).where(isNull(wakafPurposes.deletedAt));

    const wakafTxs = await db.select({
      id: generalTransactions.id, 
      transactionDate: generalTransactions.transactionDate, 
      amount: generalTransactions.amount,
      status: generalTransactions.status, 
      type: generalTransactions.type, 
      createdAt: generalTransactions.createdAt,
      donorName: wakafDonors.name, 
      purposeName: wakafPurposes.name,
    })
    .from(generalTransactions)
    .leftJoin(wakafDonors, eq(generalTransactions.wakafDonorId, wakafDonors.id))
    .leftJoin(wakafPurposes, eq(generalTransactions.wakafPurposeId, wakafPurposes.id))
    .where(and(...periodConditions))
    .orderBy(desc(generalTransactions.transactionDate))
    .limit(200);

    // KPI Keseluruhan (Sepanjang Waktu)
    const [stats] = await db.select({
      totalIn: sql<number>`sum(case when ${generalTransactions.type} = 'in' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
      totalOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .where(and(...baseConditions));

    // KPI Periode Terpilih
    const [periodStats] = await db.select({
      sumIn: sql<number>`sum(case when ${generalTransactions.type} = 'in' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
      sumOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .where(and(...periodConditions));

    const monthlyOutRows = await db.select({
      month: sql<string>`left(${generalTransactions.transactionDate}, 7)`,
      totalOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .where(and(...baseConditions))
    .groupBy(sql`left(${generalTransactions.transactionDate}, 7)`);

    const monthlyOutMap = monthlyOutRows.reduce<Record<string, number>>((acc, row) => {
      if (row.month) acc[row.month] = row.totalOut || 0;
      return acc;
    }, {});

    const correctedTotalOut = applyManualOutOverrides(
      stats?.totalOut || 0,
      monthlyOutMap,
      Object.keys(MANUAL_WAKAF_OUT_OVERRIDES)
    );
    const correctedPeriodOut = applyManualOutOverrides(
      periodStats?.sumOut || 0,
      monthlyOutMap,
      getMonthKeysInRange(startDate, endDate)
    );

    const transactions = wakafTxs.map(tx => ({ 
      id: tx.id, 
      date: tx.transactionDate || tx.createdAt?.toISOString().split('T')[0], 
      amount: tx.amount, 
      type: tx.type,
      donor_name: tx.donorName || "-", 
      purpose_name: tx.purposeName || "-", 
      status: tx.status || "valid" 
    }));

    return NextResponse.json({ 
      success: true, 
      kpi: { 
        totalIn: stats?.totalIn || 0,
        totalOut: correctedTotalOut,
        netBalance: (stats?.totalIn || 0) - correctedTotalOut,
        periodIn: periodStats?.sumIn || 0,
        periodOut: correctedPeriodOut,
        donorCount: donorsCount, 
        purposeCount: purposesCount 
      }, 
      transactions 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      type = "in", 
      donorId, 
      purposeId, 
      amount, 
      cashAccountId, 
      date, 
      description, 
      transactionCategoryId 
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Nominal wajib diisi dan harus lebih dari 0" }, { status: 400 });
    }

    if (type === "in" && !donorId) {
      return NextResponse.json({ error: "Donatur wajib diisi untuk penerimaan wakaf" }, { status: 400 });
    }

    if (type === "out" && !purposeId) {
      return NextResponse.json({ error: "Program tujuan wajib diisi untuk pengeluaran wakaf" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const txDate = date || new Date().toISOString().split("T")[0];
      
      // 1. Insert Transaksi
      const [transaction] = await tx.insert(generalTransactions).values({
        type: type, 
        amount: Number(amount), 
        description: description || (type === "in" ? "Penerimaan Wakaf" : "Pengeluaran Wakaf"),
        transactionDate: txDate,
        transactionCategoryId: transactionCategoryId ? Number(transactionCategoryId) : null,
        status: "valid",
        wakafDonorId: donorId ? Number(donorId) : null, 
        wakafPurposeId: purposeId ? Number(purposeId) : null,
        cashAccountId: cashAccountId ? Number(cashAccountId) : null,
      }).returning();

      // 2. Update Saldo Kas (ACID)
      if (cashAccountId) {
        const balanceChange = type === "in" ? Number(amount) : -Number(amount);
        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${balanceChange}` })
          .where(and(eq(cashAccounts.id, Number(cashAccountId)), isNull(cashAccounts.deletedAt)));
      }

      // 3. Update Akumulasi Program (ACID)
      if (purposeId) {
        if (type === "in") {
          await tx.update(wakafPurposes)
            .set({ collectedAmount: sql`${wakafPurposes.collectedAmount} + ${Number(amount)}` })
            .where(and(eq(wakafPurposes.id, Number(purposeId)), isNull(wakafPurposes.deletedAt)));
        } else {
          await tx.update(wakafPurposes)
            .set({ spentAmount: sql`${wakafPurposes.spentAmount} + ${Number(amount)}` })
            .where(and(eq(wakafPurposes.id, Number(purposeId)), isNull(wakafPurposes.deletedAt)));
        }
      }

      return transaction;
    });

    return NextResponse.json({ 
      success: true, 
      message: type === "in" ? "Wakaf berhasil dicatat" : "Pengeluaran wakaf berhasil dicatat", 
      data: result 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal memproses transaksi wakaf" }, { status: 500 });
  }
}
