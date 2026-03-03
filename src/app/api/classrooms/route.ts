import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: { deletedAt: null },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });

    // Count students per classroom
    const classroomsWithCount = await Promise.all(
      classrooms.map(async (cls: any) => {
        const studentCount = await prisma.student.count({
          where: { classroomId: cls.id, deletedAt: null },
        });
        return {
          id: cls.id,
          name: cls.name,
          level: cls.level,
          wali_kelas: cls.wali_kelas,
          infaq_nominal: cls.infaq_nominal,
          student_count: studentCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: classroomsWithCount });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
