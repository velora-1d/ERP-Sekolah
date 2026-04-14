import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendances, students } from "@/db/schema";
import { and, eq, gte, isNull, lte, asc, sql } from "drizzle-orm";

// GET: Rekapitulasi absensi siswa per periode per kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    if (!classroomId || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: "classroomId, startDate, dan endDate wajib diisi",
      }, { status: 400 });
    }

    const cId = parseInt(classroomId);

    // 1. Hitung total murid aktif di kelas ini (untuk pagination)
    const countRes = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(students)
      .where(and(eq(students.classroomId, cId), isNull(students.deletedAt)));
    
    const totalStudents = countRes[0].count;

    // 2. Ambil Rekap menggunakan SQL Aggregation (Grouping per Student)
    // Ini jauh lebih cepat daripada mengambil ribuah data lalu mem-filter di JS
    const recap = await db
      .select({
        id: students.id,
        nisn: students.nisn,
        name: students.name,
        hadir: sql<number>`count(case when ${attendances.status} = 'hadir' then 1 end)`.mapWith(Number),
        sakit: sql<number>`count(case when ${attendances.status} = 'sakit' then 1 end)`.mapWith(Number),
        izin: sql<number>`count(case when ${attendances.status} = 'izin' then 1 end)`.mapWith(Number),
        alpha: sql<number>`count(case when ${attendances.status} = 'alpha' then 1 end)`.mapWith(Number),
        total: sql<number>`count(${attendances.status})`.mapWith(Number),
      })
      .from(students)
      .leftJoin(
        attendances,
        and(
          eq(students.id, attendances.studentId),
          gte(attendances.date, startDate),
          lte(attendances.date, endDate),
          eq(attendances.classroomId, cId)
        )
      )
      .where(and(eq(students.classroomId, cId), isNull(students.deletedAt)))
      .groupBy(students.id)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset(offset);

    const formattedData = recap.map(r => ({
      id: r.id,
      nisn: r.nisn,
      name: r.name,
      stats: {
        hadir: r.hadir,
        sakit: r.sakit,
        izin: r.izin,
        alpha: r.alpha,
        total: r.total,
      }
    }));

    const response = NextResponse.json({
      success: true,
      data: formattedData,
      meta: { total: totalStudents, page, limit, totalPages: Math.ceil(totalStudents / limit) },
    });

    // Cache rekap selama 60 detik karena data histori jarang berubah mendadak
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
