import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * DELETE /api/journal/[id] — Soft delete + revert saldo kas (ACID)
 * Hanya entry dengan status 'valid' yang bisa dihapus.
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const txId = Number(params.id);

    if (isNaN(txId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.generalTransaction.findUnique({ where: { id: txId } });
      if (!entry) throw new Error("Transaksi tidak ditemukan");
      if (entry.deletedAt) throw new Error("Transaksi sudah dihapus");
      if (entry.status === "void") throw new Error("Transaksi void tidak bisa dihapus (sudah di-void)");

      // Soft delete + void
      await tx.generalTransaction.update({
        where: { id: txId },
        data: { status: "void", deletedAt: new Date() },
      });

      // Revert saldo kas
      if (entry.cashAccountId) {
        const revertAmount = entry.type === "in" ? -entry.amount : entry.amount;
        await tx.cashAccount.update({
          where: { id: entry.cashAccountId },
          data: { balance: { increment: revertAmount } },
        });
      }

      return { type: entry.type, amount: entry.amount };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${result.type === "in" ? "pemasukan" : "pengeluaran"} Rp ${result.amount.toLocaleString("id-ID")} berhasil dihapus.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal hapus transaksi";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
