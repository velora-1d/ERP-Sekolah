import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") || "";

  try {
    const transactions = await prisma.generalTransaction.findMany({
      where: {
        deletedAt: null,
        ...(typeFilter && { type: typeFilter })
      },
      orderBy: { transactionDate: "desc" },
    });

    const categories = await prisma.transactionCategory.findMany({
      where: { deletedAt: null }
    });
    const categoryMap = Object.fromEntries(categories.map(c => [c.id.toString(), c.name]));

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalIn = 0;
    let totalOut = 0;
    let thisMonthIn = 0;
    let thisMonthOut = 0;

    const entries = transactions.map(tx => {
      const isThisMonth = tx.transactionDate?.startsWith(currentMonthPrefix);
      if (tx.type === "in") {
        totalIn += tx.amount;
        if (isThisMonth) thisMonthIn += tx.amount;
      } else {
        totalOut += tx.amount;
        if (isThisMonth) thisMonthOut += tx.amount;
      }

      return {
        id: tx.id,
        date: tx.transactionDate || tx.createdAt.toISOString(),
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        category_name: categoryMap[tx.transactionCategoryId] || "-",
        status: "valid" // atau logic field status jika ada
      };
    }).slice(0, 100); // Batasi response API 100 data untuk perf di tampilan

    const kpi = {
      totalBalance: totalIn - totalOut,
      thisMonthIn,
      thisMonthOut
    };

    return NextResponse.json({ success: true, kpi, entries, categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
