import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  try {
    const where: any = { deletedAt: null };
    if (typeFilter) where.type = typeFilter;

    const [transactions, totalCount] = await Promise.all([
      prisma.generalTransaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.generalTransaction.count({ where }),
    ]);

    const categories = await prisma.transactionCategory.findMany({
      where: { deletedAt: null },
    });

    // KPI: hitung dari SELURUH data (bukan cuma page ini)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const allTx = await prisma.generalTransaction.findMany({
      where: { deletedAt: null },
      select: { type: true, amount: true, date: true },
    });

    let totalIn = 0, totalOut = 0, thisMonthIn = 0, thisMonthOut = 0;
    allTx.forEach(tx => {
      const isThisMonth = tx.date?.startsWith(currentMonthPrefix);
      if (tx.type === "in") {
        totalIn += tx.amount;
        if (isThisMonth) thisMonthIn += tx.amount;
      } else {
        totalOut += tx.amount;
        if (isThisMonth) thisMonthOut += tx.amount;
      }
    });

    const entries = transactions.map(tx => ({
      id: tx.id,
      date: tx.date || tx.createdAt.toISOString(),
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      category_name: tx.category?.name || "-",
      status: tx.status || "valid",
    }));

    const kpi = { totalBalance: totalIn - totalOut, thisMonthIn, thisMonthOut };

    return NextResponse.json({
      success: true,
      kpi,
      entries,
      categories,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
