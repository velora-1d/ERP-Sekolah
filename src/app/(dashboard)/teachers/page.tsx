import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import TeachersClient from "./client";

export default async function TeachersPage() {
  const teachers = await db
    .select({
      id: employees.id,
      name: employees.name,
      nip: employees.nip,
      type: employees.type,
      position: employees.position,
      status: sql<'aktif' | 'nonaktif'>`${employees.status}`,
      phone: employees.phone,
      createdAt: employees.createdAt,
    })
    .from(employees)
    .where(and(eq(employees.type, "guru"), isNull(employees.deletedAt)))
    .orderBy(desc(employees.createdAt))
    .limit(500);

  // Parse tanggal agar aman dikirim ke Client Component (Date object tidak serializable)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedTeachers = teachers.map((t) => ({
    ...t,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : null,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <TeachersClient initialData={serializedTeachers as any} />;
}
