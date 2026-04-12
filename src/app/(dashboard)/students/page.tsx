import { db } from "@/db";
import { students, studentEnrollments, classrooms } from "@/db/schema";
import { and, eq, isNull, asc, sql } from "drizzle-orm";
import StudentsPage from "./client";

export default async function Page() {
  // Ambil halaman pertama data siswa aktif untuk initial render (page 1, no filter)
  const limit = 20;

  const [initialStudents, [{ total }]] = await Promise.all([
    db
      .select({
        id: students.id,
        name: students.name,
        nisn: students.nisn,
        gender: students.gender,
        category: students.category,
        status: students.status,
        classroom: {
          name: classrooms.name,
        },
      })
      .from(students)
      .leftJoin(
        studentEnrollments,
        and(eq(studentEnrollments.studentId, students.id), isNull(studentEnrollments.deletedAt))
      )
      .leftJoin(classrooms, eq(classrooms.id, studentEnrollments.classroomId))
      .where(isNull(students.deletedAt))
      .orderBy(asc(students.name))
      .limit(limit)
      .offset(0),
    db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(students)
      .where(isNull(students.deletedAt)),
  ]);

  const initialResult = {
    data: initialStudents,
    pagination: {
      page: 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  return <StudentsPage initialResult={initialResult} />;
}
