import { db } from "@/db";
import { academicYears, employees } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import ClassroomsClient from "./client";
import { getClassroomsList } from "@/lib/classrooms";

export default async function ClassroomsPage() {
  const limit = 10;

  // Ambil data paralel: kelas page-1, tahun ajaran, dan guru (untuk dropdown/form)
  const [initialResult, allAcademicYears, allTeachers] = await Promise.all([
    getClassroomsList({ page: 1, limit }),
    db
      .select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive })
      .from(academicYears)
      .where(isNull(academicYears.deletedAt))
      .orderBy(asc(academicYears.year))
      .limit(100),
    db
      .select({ id: employees.id, name: employees.name })
      .from(employees)
      .where(isNull(employees.deletedAt))
      .orderBy(asc(employees.name))
      .limit(100),
  ]);

  return (
    <ClassroomsClient
      initialResult={initialResult}
      initialAcademicYears={allAcademicYears}
      initialTeachers={allTeachers}
    />
  );
}
