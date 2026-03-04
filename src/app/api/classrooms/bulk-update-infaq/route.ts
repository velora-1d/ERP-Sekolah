import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * PATCH /api/classrooms/bulk-update-infaq
 * 
 * Update nominal infaq/SPP standar untuk banyak kelas sekaligus.
 * Input: { classIds: number[], nominal: number }
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    // Pastikan user memiliki akses admin (sesuai role di schema)
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Anda bukan admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { classIds, nominal } = body;

    // 1. Validasi Input
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pilih minimal satu kelas." },
        { status: 400 }
      );
    }

    if (nominal === undefined || nominal < 0) {
      return NextResponse.json(
        { success: false, message: "Nominal tidak valid (minimal 0)." },
        { status: 400 }
      );
    }

    // 2. Eksekusi Update Masal
    const result = await prisma.classroom.updateMany({
      where: {
        id: { in: classIds.map(Number) },
        deletedAt: null, // Hanya kelas yang masih aktif
      },
      data: {
        infaqNominal: Number(nominal),
      },
    });

    // 3. Tambahkan Audit Log (opsional tapi disarankan sesuai schema Anda)
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "BULK_UPDATE_INFAQ_NOMINAL",
        modelType: "Classroom",
        modelId: classIds.join(","),
        newValues: JSON.stringify({ nominal, affectedRows: result.count }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui biaya SPP untuk ${result.count} kelas.`,
      count: result.count,
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Bulk update infaq nominal error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui biaya kelas secara masal." },
      { status: 500 }
    );
  }
}
