import { db } from "@/db";
import { classrooms, cashAccounts } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import PpdbClient from "./client";

export default async function PpdbPage() {
  const [allClassrooms, allCashAccounts] = await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name, level: classrooms.level })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({ id: cashAccounts.id, name: cashAccounts.name, balance: cashAccounts.balance })
      .from(cashAccounts)
      .where(isNull(cashAccounts.deletedAt))
      .orderBy(asc(cashAccounts.name))
      .limit(50),
  ]);

  return (
    <PpdbClient
      initialClassrooms={allClassrooms}
      initialCashAccounts={allCashAccounts}
    />
  );
}
