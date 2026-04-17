import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, transactionCategories } from "@/db/schema";
import { isNull, and, eq, desc, like, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

    try {
    const conditions = [
      isNull(generalTransactions.deletedAt),
      eq(generalTransactions.status, "valid")
    ];
    if (typeFilter) conditions.push(eq(generalTransactions.type, typeFilter));

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [transactions, [{ totalCount }], categories, [{ totalIn }], [{ totalOut }], [{ thisMonthIn }], [{ thisMonthOut }]] = await Promise.all([
      db.select({
        id: generalTransactions.id,
        transactionDate: generalTransactions.transactionDate,
        description: generalTransactions.description,
        type: generalTransactions.type,
        amount: generalTransactions.amount,
        status: generalTransactions.status,
        createdAt: generalTransactions.createdAt,
        categoryName: transactionCategories.name,
      })
      .from(generalTransactions)
      .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
      .where(and(...conditions))
      .orderBy(desc(generalTransactions.transactionDate))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ totalCount: sql<number>`count(*)`.mapWith(Number) })
        .from(generalTransactions).where(and(...conditions)),

      db.select().from(transactionCategories).where(isNull(transactionCategories.deletedAt)),

      db.select({ totalIn: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions).where(and(isNull(generalTransactions.deletedAt), eq(generalTransactions.status, "valid"), eq(generalTransactions.type, "in"))),

      db.select({ totalOut: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions).where(and(isNull(generalTransactions.deletedAt), eq(generalTransactions.status, "valid"), eq(generalTransactions.type, "out"))),

      db.select({ thisMonthIn: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions).where(and(isNull(generalTransactions.deletedAt), eq(generalTransactions.status, "valid"), eq(generalTransactions.type, "in"), like(generalTransactions.transactionDate, `${currentMonthPrefix}%`))),

      db.select({ thisMonthOut: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions).where(and(isNull(generalTransactions.deletedAt), eq(generalTransactions.status, "valid"), eq(generalTransactions.type, "out"), like(generalTransactions.transactionDate, `${currentMonthPrefix}%`))),
    ]);

    const entries = transactions.map(tx => ({
      id: tx.id,
      date: tx.transactionDate ? (typeof tx.transactionDate === 'string' ? tx.transactionDate : new Date(tx.transactionDate).toISOString()) : (tx.createdAt ? new Date(tx.createdAt).toISOString() : null),
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      category_name: tx.categoryName || "-",
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
    console.error("Journal GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
