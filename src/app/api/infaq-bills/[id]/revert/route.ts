import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/[id]/revert
 * 
 * Revert tagihan dari 'lunas' kembali ke 'belum_lunas'.
 * Logic: koreksi salah input — hapus semua payment + reset status.
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const billId = Number(params.id);

    if (isNaN(billId)) {
      return NextResponse.json(
        { success: false, message: "ID tagihan tidak valid" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.infaqBill.findUnique({
        where: { id: billId },
        include: { payments: { where: { deletedAt: null } } },
      });

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan yang di-void tidak bisa di-revert");
      if (bill.status === "belum_lunas" && bill.payments.length === 0) {
        throw new Error("Tagihan belum pernah dibayar, tidak ada yang di-revert");
      }

      // Soft-delete semua payment
      if (bill.payments.length > 0) {
        await tx.infaqPayment.updateMany({
          where: { billId: bill.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      }

      // Reset status ke belum_lunas
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: "belum_lunas" },
      });

      const totalReverted = bill.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      return { revertedPayments: bill.payments.length, totalReverted };
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil revert ${result.revertedPayments} pembayaran (Rp ${result.totalReverted.toLocaleString("id-ID")}). Status kembali ke belum_lunas.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal revert tagihan";
    console.error("Revert bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
