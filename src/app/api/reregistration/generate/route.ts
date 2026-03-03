import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Cari siswa aktif
    const activeStudents = await prisma.student.findMany({
      where: { status: "aktif", deletedAt: null },
      select: { id: true, name: true }
    });

    if (activeStudents.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada siswa aktif ditemukan" });
    }

    // Cari academic year yang aktif
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
    });
    
    const academicYearId = currentAcademicYear ? currentAcademicYear.id.toString() : "-";

    // Cari existing reregistrations
    const existing = await prisma.reRegistration.findMany({
      where: { academicYearId, deletedAt: null },
      select: { studentId: true }
    });

    const existingStudentIds = new Set(existing.map((e) => e.studentId));
    let count = 0;

    for (const student of activeStudents) {
      const sIdStr = student.id.toString();
      if (!existingStudentIds.has(sIdStr)) {
        await prisma.reRegistration.create({
          data: {
            studentId: sIdStr,
            academicYearId,
            status: "pending",
          }
        });
        count++;
      }
    }

    return NextResponse.json({ success: true, count, message: `Pendaftaran ulang untuk ${count} siswa berhasil digenerate.` });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal men-generate data daftar ulang" },
      { status: 500 }
    );
  }
}
