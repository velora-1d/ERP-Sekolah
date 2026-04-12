import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import SchoolProfileClient from "./client";

export default async function SchoolProfilePage() {
  const settings = await db.select().from(schoolSettings);
  const profile: Record<string, string> = {};
  settings.forEach(s => { profile[s.key] = s.value; });

  return <SchoolProfileClient initialData={profile} />;
}
