
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

import { db } from "../src/db";
import { academicYears, generalTransactions, infaqBills, transactionCategories } from "../src/db/schema";
import { and, eq, isNull, gte, lte, sql } from "drizzle-orm";

async function check() {
  console.log("Checking Database Status (Production)...");

  // 1. Check Academic Years
  const activeYears = await db.select().from(academicYears).where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)));
  console.log("Active Academic Years:", activeYears.length);
  activeYears.forEach(y => console.log(` - ID: ${y.id}, Year: ${y.year}, Active: ${y.isActive}`));

  // 2. Check General Transactions count
  const txCount = await db.select({ count: sql`count(*)` }).from(generalTransactions).where(isNull(generalTransactions.deletedAt));
  console.log("Total General Transactions (not deleted):", txCount[0].count);

  // 3. Check Transactions in current month (May 2026)
  const now = new Date("2026-05-01T14:41:00");
  const dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  console.log(`Current Month Range: ${dateStart.toISOString()} to ${dateEnd.toISOString()}`);

  const monthTx = await db.select({ 
    type: generalTransactions.type,
    sum: sql`sum(${generalTransactions.amount})`,
    count: sql`count(*)`
  })
  .from(generalTransactions)
  .where(and(
    eq(generalTransactions.status, "valid"),
    isNull(generalTransactions.deletedAt),
    gte(generalTransactions.createdAt, dateStart),
    lte(generalTransactions.createdAt, dateEnd)
  ))
  .groupBy(generalTransactions.type);

  console.log("Transactions this month:", monthTx);

  // 4. Check if there are transactions in April 2026
  const aprilStart = new Date(2026, 3, 1);
  const aprilEnd = new Date(2026, 4, 0, 23, 59, 59);
  const aprilTx = await db.select({ 
    type: generalTransactions.type,
    sum: sql`sum(${generalTransactions.amount})`,
    count: sql`count(*)`
  })
  .from(generalTransactions)
  .where(and(
    eq(generalTransactions.status, "valid"),
    isNull(generalTransactions.deletedAt),
    gte(generalTransactions.createdAt, aprilStart),
    lte(generalTransactions.createdAt, aprilEnd)
  ))
  .groupBy(generalTransactions.type);
  
  console.log("Transactions last month (April):", aprilTx);

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
