import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-payments
 * 
 * Bayar tagihan infaq/SPP.
 * Input: { billId, amountPaid, paymentDate, notes }
 * Logic: 
 *   1. Validasi bill exists + bukan void
 *   2. Buat InfaqPayment
 *   3. Hitung total paid → update status bill (lunas/sebagian)
 *   4. Semua dalam $transaction
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { billId, amountPaid, paymentDate, notes } = body;

    // Validasi input
    if (!billId) {
      return NextResponse.json(
        { success: false, message: "ID tagihan wajib diisi" },
        { status: 400 }
      );
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah pembayaran harus lebih dari 0" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil bill + pembayaran sebelumnya
      const bill = await tx.infaqBill.findUnique({
        where: { id: Number(billId) },
        include: { payments: { where: { deletedAt: null } } },
      });

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan sudah di-void, tidak bisa dibayar");
      if (bill.status === "lunas") throw new Error("Tagihan sudah lunas");

      // 2. Hitung total paid sebelumnya
      const totalPaidBefore = bill.payments.reduce(
        (sum, p) => sum + p.amountPaid, 0
      );
      const newTotalPaid = totalPaidBefore + Number(amountPaid);

      // 3. Buat payment record
      const payment = await tx.infaqPayment.create({
        data: {
          billId: bill.id,
          amountPaid: Number(amountPaid),
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
          receiverId: user.userId,
          notes: notes || "",
          unitId: user.unitId || "",
        },
      });

      // 4. Update status bill
      const newStatus = newTotalPaid >= bill.nominal ? "lunas" : "sebagian";
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      });

      return { payment, newStatus, newTotalPaid, nominal: bill.nominal };
    });

    return NextResponse.json({
      success: true,
      message: `Pembayaran Rp ${Number(amountPaid).toLocaleString("id-ID")} berhasil. Status: ${result.newStatus}`,
      data: {
        paymentId: result.payment.id,
        status: result.newStatus,
        totalPaid: result.newTotalPaid,
        nominal: result.nominal,
        remaining: Math.max(0, result.nominal - result.newTotalPaid),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal memproses pembayaran";
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 400 }
    );
  }
}
