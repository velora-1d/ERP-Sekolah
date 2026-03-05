import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint sementara untuk debug koneksi database di Vercel.
 * HAPUS endpoint ini setelah selesai debugging!
 */
export async function GET() {
  try {
    // Cek env vars (jangan tampilkan password!)
    const dbUrl = process.env.DATABASE_URL || "TIDAK SET";
    const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

    // Cek koneksi database
    const studentCount = await prisma.student.count({ where: { deletedAt: null } });
    const enrollmentCount = await prisma.studentEnrollment.count({ where: { deletedAt: null } });
    const classroomCount = await prisma.classroom.count({ where: { deletedAt: null } });
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
      select: { id: true, year: true },
    });

    // Cek siswa aktif dengan enrollment
    const studentsWithEnrollment = await prisma.studentEnrollment.count({
      where: {
        deletedAt: null,
        academicYearId: academicYear?.id || undefined,
        student: { status: "aktif", deletedAt: null },
      },
    });

    return NextResponse.json({
      status: "OK - Database terhubung!",
      database_url: maskedUrl,
      data: {
        siswa_total: studentCount,
        enrollment_total: enrollmentCount,
        kelas_total: classroomCount,
        tahun_ajaran_aktif: academicYear || "TIDAK ADA",
        siswa_dengan_enrollment_aktif: studentsWithEnrollment,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "ERROR - Gagal koneksi database!",
      database_url: (process.env.DATABASE_URL || "TIDAK SET").replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@"),
      error: error.message,
      hint: "Pastikan DATABASE_URL di Vercel Environment Variables sudah benar dan password-nya sesuai.",
    }, { status: 500 });
  }
}
