import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Cari siswa aktif
    const activeStudents = await prisma.student.findMany({
      where: { status: "aktif", deletedAt: null },
      select: { id: true, name: true },
    });

    if (activeStudents.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada siswa aktif ditemukan" });
    }

    // Cari academic year yang aktif
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
    });

    if (!currentAcademicYear) {
      return NextResponse.json(
        { error: "Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran terlebih dahulu." },
        { status: 400 }
      );
    }

    const academicYearId = currentAcademicYear.id;

    // Cari existing reregistrations
    const existing = await prisma.reRegistration.findMany({
      where: { academicYearId, deletedAt: null },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existing.map((e) => e.studentId));
    let count = 0;

    // Generate dalam transaction
    await prisma.$transaction(async (tx) => {
      for (const student of activeStudents) {
        if (!existingStudentIds.has(student.id)) {
          await tx.reRegistration.create({
            data: {
              studentId: student.id,
              academicYearId: academicYearId,
              status: "pending",
            },
          });
          count++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      count,
      message: `Pendaftaran ulang untuk ${count} siswa berhasil digenerate.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal men-generate data daftar ulang" },
      { status: 500 }
    );
  }
}
