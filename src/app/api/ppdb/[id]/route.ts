import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/ppdb/[id] — Detail pendaftar PPDB
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const reg = await prisma.ppdbRegistration.findUnique({ where: { id: regId } });
    if (!reg || reg.deletedAt) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    // Ambil payment items terkait
    const payments = await prisma.registrationPayment.findMany({
      where: { payableType: "ppdb", payableId: regId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { ...reg, payments },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat detail" }, { status: 500 });
  }
}
