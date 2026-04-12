import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export const revalidate = 60; // Cache selama 60 detik di Vercel Edge
import { classrooms, academicYears, employees, students } from "@/db/schema";
import { eq, or, and, isNull, asc, ilike, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const conditions = [isNull(classrooms.deletedAt)];
    if (q) {
      conditions.push(or(
        ilike(classrooms.name, `%${q}%`)
      )!);
    }

    const whereClause = and(...conditions);

    const [classroomsData, [{ count }]] = await Promise.all([
      db.select({
        id: classrooms.id,
        level: classrooms.level,
        name: classrooms.name,
        academicYearId: classrooms.academicYearId,
        academicYear: academicYears.year,
        waliKelasId: classrooms.waliKelasId,
        waliKelas: employees.name,
        infaqNominal: classrooms.infaqNominal,
        student_count: sql<number>`count(distinct ${students.id})`.mapWith(Number),
      })
      .from(classrooms)
      .leftJoin(academicYears, eq(classrooms.academicYearId, academicYears.id))
      .leftJoin(employees, eq(classrooms.waliKelasId, employees.id))
      .leftJoin(students, and(
        eq(classrooms.id, students.classroomId),
        isNull(students.deletedAt)
      ))
      .where(whereClause)
      .groupBy(
        classrooms.id,
        classrooms.level,
        classrooms.name,
        classrooms.academicYearId,
        classrooms.waliKelasId,
        classrooms.infaqNominal,
        academicYears.year, 
        employees.name
      )
      .orderBy(asc(classrooms.name))
      .limit(limit)
      .offset(skip),
      
      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(whereClause)
    ]);

    const classroomsWithCount = classroomsData.map((cls) => ({
      id: cls.id,
      level: cls.level,
      name: cls.name,
      academicYearId: cls.academicYearId,
      academicYear: cls.academicYear || "-",
      waliKelasId: cls.waliKelasId,
      waliKelas: cls.waliKelas || "-",
      infaqNominal: cls.infaqNominal || 0,
      student_count: cls.student_count,
    }));

    return NextResponse.json(
      { 
        success: true, 
        data: classroomsWithCount,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error: unknown) {
    console.error("GET classrooms error:", error);
    const message = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, level, academicYearId, waliKelasId, infaqNominal } = body;
    
    if (!name) {
      return NextResponse.json({ success: false, message: "Nama kelas wajib diisi" }, { status: 400 });
    }

    // 1. Cek apakah ada record dengan nama yang sama (termasuk yang di-soft delete)
    const existing = await db.select()
      .from(classrooms)
      .where(ilike(classrooms.name, name))
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      
      // Jika record aktif sudah ada, kembalikan error duplikasi
      if (!record.deletedAt) {
        return NextResponse.json({ 
          success: false, 
          message: `Kelas dengan nama "${name}" sudah ada dan masih aktif.` 
        }, { status: 400 });
      }

      // Jika record terhapus ditemukan, lakukan Restore
      const [restored] = await db.update(classrooms)
        .set({
          level: level ? Number(level) : 1,
          academicYearId: (academicYearId && academicYearId !== "null") ? Number(academicYearId) : null,
          waliKelasId: (waliKelasId && waliKelasId !== "null") ? Number(waliKelasId) : null,
          infaqNominal: (infaqNominal && infaqNominal !== "null") ? Number(infaqNominal) : 0,
          deletedAt: null,
          updatedAt: new Date()
        })
        .where(eq(classrooms.id, record.id))
        .returning();

      return NextResponse.json({ 
        success: true, 
        message: "Kelas yang sebelumnya terhapus telah diaktifkan kembali.", 
        data: restored,
        isRestored: true 
      });
    }

    // 2. Jika tidak ada, insert baru
    const [newClassroom] = await db.insert(classrooms).values({
      name: name,
      level: level ? Number(level) : 1,
      academicYearId: (academicYearId && academicYearId !== "null") ? Number(academicYearId) : null,
      waliKelasId: (waliKelasId && waliKelasId !== "null") ? Number(waliKelasId) : null,
      infaqNominal: (infaqNominal && infaqNominal !== "null") ? Number(infaqNominal) : 0,
    }).returning();

    return NextResponse.json({ success: true, message: "Kelas berhasil ditambahkan", data: newClassroom });
  } catch (error: unknown) {
    console.error("POST Classroom error:", error);
    const message = error instanceof Error ? error.message : "Gagal menambah kelas";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
