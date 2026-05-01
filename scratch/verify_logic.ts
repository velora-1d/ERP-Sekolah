import { db } from "../src/db";
import { academicYears, generalTransactions, transactionCategories } from "../src/db/schema";
import { and, eq, isNull, ilike, sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

async function verify() {
  console.log("--- Dashboard Logic Verification ---");
  
  // 1. Check Active Academic Year
  const activeYearRes = await db.select()
    .from(academicYears)
    .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
    .limit(1);
  
  const activeYear = activeYearRes[0];
  console.log("Active Year:", activeYear?.year);
  
  const yearParts = activeYear?.year.split('/') || [];
  const startYear = Number(yearParts[0]);
  const endYear = Number(yearParts[1]);
  console.log("Start Year:", startYear, "| End Year:", endYear);

  // 2. Check Wakaf (Cumulative)
  const wakafRes = await db.select({ sum: sql<number>`sum(${generalTransactions.amount})`.mapWith(Number) })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
    .where(and(
      eq(generalTransactions.type, "in"), 
      eq(generalTransactions.status, "valid"), 
      isNull(generalTransactions.deletedAt), 
      ilike(transactionCategories.name, "%wakaf%")
    ));
  
  console.log("Total Wakaf (All Time):", wakafRes[0]?.sum || 0);

  // 3. Test Year Detection for specific months
  const months = ["Januari", "Juli"];
  months.forEach(m => {
    const mIdx = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].indexOf(m);
    const mYear = (mIdx >= 0 && mIdx <= 5) ? endYear : startYear;
    console.log(`Month: ${m} -> Year detected: ${mYear}`);
  });

  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
