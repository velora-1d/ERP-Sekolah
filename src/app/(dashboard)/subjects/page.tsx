import { db } from "@/db";
import { subjects } from "@/db/schema";
import { isNull, asc, sql } from "drizzle-orm";
import SubjectsClient from "./client";

export default async function SubjectsPage() {
  const limit = 10;

  const [initialData, [{ total }]] = await Promise.all([
    db
      .select({
        id: subjects.id,
        name: subjects.name,
        code: subjects.code,
        type: subjects.type,
        tingkatKelas: subjects.tingkatKelas,
      })
      .from(subjects)
      .where(isNull(subjects.deletedAt))
      .orderBy(asc(subjects.name))
      .limit(limit)
      .offset(0),
    db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(subjects)
      .where(isNull(subjects.deletedAt)),
  ]);

  const initialResult = {
    data: initialData,
    pagination: {
      page: 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  return <SubjectsClient initialResult={initialResult} />;
}
