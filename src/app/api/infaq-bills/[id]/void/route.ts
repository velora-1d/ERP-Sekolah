import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/[id]/void
 * 
 * Void tagihan infaq — membatalkan tagihan.
 * Logic: ubah status → 'void' + soft-delete semua payment terkait.
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
      if (bill.status === "void") throw new Error("Tagihan sudah di-void sebelumnya");

      // Soft-delete semua payment terkait
      if (bill.payments.length > 0) {
        await tx.infaqPayment.updateMany({
          where: { billId: bill.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      }

      // Update status bill ke void
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: "void" },
      });

      return { voidedPayments: bill.payments.length };
    });

    return NextResponse.json({
      success: true,
      message: `Tagihan berhasil di-void. ${result.voidedPayments} pembayaran terkait juga dibatalkan.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal void tagihan";
    console.error("Void bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
