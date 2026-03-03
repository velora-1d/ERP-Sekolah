import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/ppdb/[id]/approve — Terima pendaftar PPDB
 * Logic: update status → 'diterima' + buat RegistrationPayment items
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const reg = await tx.ppdbRegistration.findUnique({ where: { id: regId } });
      if (!reg) throw new Error("Pendaftar tidak ditemukan");
      if (reg.deletedAt) throw new Error("Data sudah dihapus");
      if (reg.status === "diterima") throw new Error("Pendaftar sudah diterima sebelumnya");
      if (reg.status === "ditolak") throw new Error("Pendaftar sudah ditolak. Reset dulu sebelum menerima.");

      // Update status
      await tx.ppdbRegistration.update({
        where: { id: regId },
        data: { status: "diterima" },
      });

      // Buat payment items (formulir, buku, seragam)
      const paymentTypes = [
        { type: "formulir", nominal: 0 },
        { type: "buku", nominal: 0 },
        { type: "seragam", nominal: 0 },
      ];

      await tx.registrationPayment.createMany({
        data: paymentTypes.map(pt => ({
          payableType: "ppdb",
          payableId: regId,
          paymentType: pt.type,
          nominal: pt.nominal,
          isPaid: false,
          unitId: user.unitId || "",
        })),
      });

      return { name: reg.name };
    });

    return NextResponse.json({
      success: true,
      message: `${result.name} berhasil diterima. Payment items telah dibuat.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal menerima pendaftar";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
