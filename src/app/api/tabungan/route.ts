import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("classId") || "";

  try {
    // Ambil data siswa aktif
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        status: "aktif",
        ...(classFilter && { classroomId: classFilter }),
      },
      orderBy: { name: "asc" },
    });

    // Ambil data classroom untuk di-map nanti
    const classrooms = await prisma.classroom.findMany({
      where: { deletedAt: null }
    });
    const classMap = Object.fromEntries(classrooms.map(c => [c.id.toString(), c.name]));

    // Hitung saldo
    // Karena tidak ada relasi langsung di prisma schema antara Student dan StudentSaving,
    // kita ambil semua transaction savings yg belum dihapus.
    // Asumsi: amount di database jika tarik mungkin sudah diset -amount atau selalu positif dan tipe yg menentukan.
    const allSavings = await prisma.studentSaving.findMany({
      where: { deletedAt: null }
    });

    const balanceMap: Record<string, number> = {};
    allSavings.forEach(s => {
      const sId = s.studentId;
      if (!balanceMap[sId]) balanceMap[sId] = 0;
      if (s.type === "setor") {
        balanceMap[sId] += s.amount;
      } else if (s.type === "tarik") {
        balanceMap[sId] -= s.amount;
      }
    });

    const data = students.map(s => ({
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      classroom: classMap[s.classroomId] || "-",
      balance: balanceMap[s.id.toString()] || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
