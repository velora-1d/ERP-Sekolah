import { NextResponse } from "next/server";
import { db } from "@/db";
import { cashAccounts, generalTransactions } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, isNull, asc, and, sql, ilike } from "drizzle-orm";

/**
 * GET — List semua akun kas (non-deleted)
 */
export async function GET() {
  try {
    const records = await db.select({
      id: cashAccounts.id,
      accountName: cashAccounts.name,
      bankName: cashAccounts.bankName,
      accountNumber: cashAccounts.accountNumber,
      balance: cashAccounts.balance,
      status: cashAccounts.status,
      transactionCount: sql<number>`count(${generalTransactions.id})`.mapWith(Number),
    })
    .from(cashAccounts)
    .leftJoin(generalTransactions, and(
      eq(cashAccounts.id, generalTransactions.cashAccountId),
      isNull(generalTransactions.deletedAt)
    ))
    .where(isNull(cashAccounts.deletedAt))
    .groupBy(cashAccounts.id)
    .orderBy(asc(cashAccounts.name));

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Cash accounts GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data akun kas" },
      { status: 500 }
    );
  }
}

/**
 * POST — Buat akun baru atau Restore yang terhapus
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { accountName, bankName, accountNumber, status } = body;

    if (!accountName || !accountName.trim()) {
      return NextResponse.json({ success: false, message: "Nama akun wajib diisi" }, { status: 400 });
    }

    // Cek duplikasi nama
    const [existing] = await db.select()
      .from(cashAccounts)
      .where(ilike(cashAccounts.name, accountName.trim()))
      .limit(1);

    if (existing) {
      if (!existing.deletedAt) {
        return NextResponse.json({ success: false, message: "Nama akun sudah digunakan" }, { status: 400 });
      }
      // Restore if deleted
      const [restored] = await db.update(cashAccounts)
        .set({
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          status: status || "active",
          deletedAt: null,
          updatedAt: new Date()
        })
        .where(eq(cashAccounts.id, existing.id))
        .returning();
      
      return NextResponse.json({ success: true, message: "Akun berhasil diaktifkan kembali.", data: restored });
    }

    const [account] = await db.insert(cashAccounts).values({
      name: accountName.trim(),
      bankName: bankName || null,
      accountNumber: accountNumber || null,
      status: status || "active",
      balance: 0,
      unitId: user.unitId || "",
    }).returning();

    return NextResponse.json({
      success: true,
      message: `Akun kas "${account.name}" berhasil dibuat`,
      data: account,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Cash accounts POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat akun kas" }, { status: 500 });
  }
}

/**
 * PUT — Update akun kas
 */
export async function PUT(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, accountName, bankName, accountNumber, status } = body;

    if (!id) return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });

    const [updated] = await db.update(cashAccounts)
      .set({
        name: accountName?.trim(),
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        status: status,
        updatedAt: new Date(),
      })
      .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Data akun kas berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Cash accounts PUT error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui akun kas" }, { status: 500 });
  }
}

/**
 * DELETE — Soft delete akun kas
 */
export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });

    const [deleted] = await db.update(cashAccounts)
      .set({ deletedAt: new Date() })
      .where(eq(cashAccounts.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Akun kas berhasil dihapus",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Cash accounts DELETE error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus akun kas" }, { status: 500 });
  }
}
