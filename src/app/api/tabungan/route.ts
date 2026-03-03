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
        ...(classFilter && { classroomId: Number(classFilter) }),
      },
      include: {
        classroom: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    // Hitung saldo dari transaksi tabungan aktif
    const allSavings = await prisma.studentSaving.findMany({
      where: { deletedAt: null, status: "active" },
    });

    const balanceMap: Record<number, number> = {};
    allSavings.forEach(s => {
      if (s.studentId == null) return;
      if (!balanceMap[s.studentId]) balanceMap[s.studentId] = 0;
      if (s.type === "setor") {
        balanceMap[s.studentId] += s.amount;
      } else if (s.type === "tarik") {
        balanceMap[s.studentId] -= s.amount;
      }
    });

    const data = students.map(s => ({
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      classroom: s.classroom?.name || "-",
      balance: balanceMap[s.id] || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
