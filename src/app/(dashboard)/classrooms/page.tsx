import { db } from "@/db";
import { classrooms, academicYears, employees } from "@/db/schema";
import { isNull, asc, sql } from "drizzle-orm";
import ClassroomsClient from "./client";

export default async function ClassroomsPage() {
  const limit = 10;

  // Ambil data paralel: kelas page-1, tahun ajaran, dan guru (untuk dropdown/form)
  const [initialClassrooms, [{ total }], allAcademicYears, allTeachers] = await Promise.all([
    db
      .select({
        id: classrooms.id,
        name: classrooms.name,
        level: classrooms.level,
        academicYearId: classrooms.academicYearId,
        waliKelasId: classrooms.waliKelasId,
        infaqNominal: classrooms.infaqNominal,
      })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.level), asc(classrooms.name))
      .limit(limit)
      .offset(0),
    db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt)),
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

  const initialResult = {
    data: initialClassrooms,
    pagination: { page: 1, limit, total, totalPages: Math.ceil(total / limit) },
  };

  return (
    <ClassroomsClient
      initialResult={initialResult}
      initialAcademicYears={allAcademicYears}
      initialTeachers={allTeachers}
    />
  );
}
