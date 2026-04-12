import { db } from "@/db";
import { classrooms, curriculums, academicYears } from "@/db/schema";
import { isNull, asc, eq } from "drizzle-orm";
import ReportCardsClient from "./client";

export default async function ReportCardsPage() {
  const [allClassrooms, allCurriculums] = await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name, level: classrooms.level })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({
        id: curriculums.id,
        type: curriculums.type,
        semester: curriculums.semester,
        academicYearId: curriculums.academicYearId,
      })
      .from(curriculums)
      .orderBy(asc(curriculums.id))
      .limit(50),
  ]);

  return (
    <ReportCardsClient
      initialClassrooms={allClassrooms}
      initialCurriculums={allCurriculums}
    />
  );
}
