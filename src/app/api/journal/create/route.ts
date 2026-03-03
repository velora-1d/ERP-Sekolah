import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/journal
 * 
 * Catat transaksi baru ke jurnal umum.
 * Input: { type (in/out), amount, cashAccountId, categoryId, date, description }
 * Logic:
 *   1. Validasi input + cek kas account exists
 *   2. Jika pengeluaran → validasi saldo cukup
 *   3. Buat GeneralTransaction
 *   4. Update saldo CashAccount
 *   5. Semua dalam $transaction (ACID)
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { type, amount, cashAccountId, categoryId, date, description } = body;

    // Validasi input
    if (!type || !["in", "out"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Tipe transaksi harus 'in' atau 'out'" },
        { status: 400 }
      );
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah harus lebih dari 0" },
        { status: 400 }
      );
    }
    if (!cashAccountId) {
      return NextResponse.json(
        { success: false, message: "Akun kas wajib dipilih" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil akun kas dengan locking (serialized read)
      const cashAccount = await tx.cashAccount.findUnique({
        where: { id: Number(cashAccountId) },
      });

      if (!cashAccount || cashAccount.deletedAt) {
        throw new Error("Akun kas tidak ditemukan");
      }

      // 2. Validasi saldo untuk pengeluaran
      if (type === "out" && cashAccount.balance < Number(amount)) {
        throw new Error(
          `Saldo tidak cukup. Saldo: Rp ${cashAccount.balance.toLocaleString("id-ID")}, Dibutuhkan: Rp ${Number(amount).toLocaleString("id-ID")}`
        );
      }

      // 3. Buat transaksi
      const transaction = await tx.generalTransaction.create({
        data: {
          type,
          amount: Number(amount),
          cashAccountId: Number(cashAccountId),
          transactionCategoryId: categoryId ? Number(categoryId) : null,
          date: date || new Date().toISOString().split("T")[0],
          description: description || "",
          status: "valid",
          userId: user.userId,
          unitId: user.unitId || "",
        },
      });

      // 4. Update saldo kas
      const balanceChange = type === "in" ? Number(amount) : -Number(amount);
      await tx.cashAccount.update({
        where: { id: cashAccount.id },
        data: { balance: { increment: balanceChange } },
      });

      return {
        transaction,
        newBalance: cashAccount.balance + balanceChange,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${type === "in" ? "pemasukan" : "pengeluaran"} Rp ${Number(amount).toLocaleString("id-ID")} berhasil dicatat`,
      data: {
        id: result.transaction.id,
        newBalance: result.newBalance,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal mencatat transaksi";
    console.error("Journal POST error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
