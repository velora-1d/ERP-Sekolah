import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/reset
 * 
 * Reset (soft delete) tagihan infaq/SPP berdasarkan filter.
 * Input: { year, months?: string[], classroomId?: number, semester?: number }
 * 
 * Logic:
 *   1. Filter tagihan berdasarkan tahun + (bulan ATAU semester) + (kelas opsional)
 *   2. Soft delete semua tagihan + payment terkait
 *   3. Return jumlah yang di-reset
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { year, months, classroomId, semester } = body;

    if (!year) {
      return NextResponse.json(
        { success: false, message: "Tahun wajib diisi" },
        { status: 400 }
      );
    }

    // Tentukan bulan berdasarkan filter
    let targetMonths: string[] = [];

    if (months && Array.isArray(months) && months.length > 0) {
      // Filter per bulan spesifik
      targetMonths = months.map(String);
    } else if (semester) {
      // Filter per semester
      const sem = Number(semester);
      if (sem === 1) {
        targetMonths = ["7", "8", "9", "10", "11", "12"];
      } else if (sem === 2) {
        targetMonths = ["1", "2", "3", "4", "5", "6"];
      } else {
        return NextResponse.json(
          { success: false, message: "Semester harus 1 atau 2" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Pilih bulan atau semester yang akan di-reset" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      year: String(year),
      month: { in: targetMonths },
      deletedAt: null,
    };

    // Filter per kelas: cari studentId yang ada di kelas tersebut
    if (classroomId) {
      const studentsInClass = await prisma.student.findMany({
        where: { classroomId: Number(classroomId), deletedAt: null },
        select: { id: true },
      });
      where.studentId = { in: studentsInClass.map(s => s.id) };
    }

    // Hitung dulu sebelum reset
    const countBefore = await prisma.infaqBill.count({ where });

    if (countBefore === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada tagihan yang ditemukan untuk filter tersebut" },
        { status: 400 }
      );
    }

    // Eksekusi dalam transaction
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      // 1. Ambil semua bill ID yang akan di-reset
      const bills = await tx.infaqBill.findMany({
        where,
        select: { id: true },
      });
      const billIds = bills.map(b => b.id);

      // 2. Soft delete semua payment terkait
      await tx.infaqPayment.updateMany({
        where: { billId: { in: billIds }, deletedAt: null },
        data: { deletedAt: now },
      });

      // 3. Soft delete semua tagihan
      await tx.infaqBill.updateMany({
        where: { id: { in: billIds } },
        data: { deletedAt: now },
      });
    });

    const filterDesc = classroomId ? ` untuk kelas tersebut` : "";
    const monthDesc = semester
      ? `Semester ${semester}`
      : `bulan ${targetMonths.join(", ")}`;

    return NextResponse.json({
      success: true,
      message: `Berhasil reset ${countBefore} tagihan (${monthDesc}, ${year}${filterDesc})`,
      count: countBefore,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Reset infaq bills error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal reset tagihan" },
      { status: 500 }
    );
  }
}
