'use server';

import { db } from "@/db";
import { 
  webPosts, webFacilities, 
  webAchievements, webSettings, webHeroes,
  webPrograms, webStats
} from "@/db/schema";
import { eq, desc, and, isNull, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- TYPES ---
export interface ProgramData {
  id?: number;
  title: string;
  description: string;
  iconName?: string;
  color?: string;
  order?: number;
  status?: string;
  unitId?: string;
}

export interface StatData {
  id?: number;
  label: string;
  value: number;
  suffix?: string;
  iconName?: string;
  color?: string;
  order?: number;
  status?: string;
  unitId?: string;
}
export interface PostData {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnailUrl?: string;
  category?: string;
  status?: string;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  unitId?: string;
}

export interface TeacherData {
  id?: number;
  name: string;
  position?: string;
  bio?: string;
  photoUrl?: string;
  order?: number;
  status?: string;
  unitId?: string;
}

export interface FacilityData {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  iconSvg?: string;
  order?: number;
  unitId?: string;
}

export interface AchievementData {
  id?: number;
  title: string;
  studentName?: string;
  competitionName?: string;
  level?: string;
  year: number;
  imageUrl?: string;
  unitId?: string;
}

export interface HeroData {
  id?: number;
  title: string;
  subtitle?: string;
  mediaType?: string;
  mediaUrl: string;
  ctaText?: string;
  ctaUrl?: string;
  order?: number;
  status?: string;
  unitId?: string;
}

// --- POSTS ---
export async function getPosts() {
  return await db.query.webPosts.findMany({
    orderBy: [desc(webPosts.createdAt)]
  });
}

export async function savePost(data: PostData) {
  const { id, ...values } = data;
  if (id) {
    await db.update(webPosts).set({ ...values, updatedAt: new Date() }).where(eq(webPosts.id, Number(id)));
  } else {
    await db.insert(webPosts).values({ ...values, status: values.status || 'published' });
  }
  revalidatePath("/admin/cms/posts");
  revalidatePath("/api/web/posts");
  return { success: true };
}

export async function deletePost(id: number) {
  await db.delete(webPosts).where(eq(webPosts.id, Number(id)));
  revalidatePath("/admin/cms/posts");
  return { success: true };
}

import { employees } from "@/db/schema";

// --- TEACHERS ---
export async function getTeachers() {
  return await db.query.employees.findMany({
    where: and(
      eq(employees.type, 'guru'),
      isNull(employees.deletedAt)
    ),
    orderBy: [asc(employees.order), asc(employees.name)]
  });
}

export async function saveTeacher(data: TeacherData) {
  const { id, ...values } = data;
  if (id) {
    // Mapping TeacherData to Employee schema
    await db.update(employees).set({ 
      name: values.name,
      position: values.position,
      status: values.status,
      photoUrl: values.photoUrl,
      bio: values.bio,
      order: values.order,
      updatedAt: new Date() 
    }).where(eq(employees.id, Number(id)));
  } else {
    await db.insert(employees).values({
      name: values.name,
      position: values.position,
      status: values.status || 'aktif',
      photoUrl: values.photoUrl,
      bio: values.bio,
      order: values.order || 1,
      type: 'guru'
    });
  }
  revalidatePath("/admin/cms/teachers");
}

export async function deleteTeacher(id: number) {
  await db.update(employees).set({ deletedAt: new Date() }).where(eq(employees.id, Number(id)));
  revalidatePath("/admin/cms/teachers");
}

// --- FACILITIES ---
export async function getFacilities() {
  console.log("Fetching facilities...");
  return await db.query.webFacilities.findMany({
    orderBy: [webFacilities.order]
  });
}

export async function saveFacility(data: FacilityData) {
  const { id, ...values } = data;
  if (id) {
    console.log("Updating facility ID:", id);
    await db.update(webFacilities).set({ ...values, updatedAt: new Date() }).where(eq(webFacilities.id, Number(id)));
  } else {
    console.log("Inserting new facility", values);
    await db.insert(webFacilities).values(values);
  }
  revalidatePath("/admin/cms/facilities");
}

export async function deleteFacility(id: number) {
  console.log("Deleting facility with ID:", id);
  const result = await db.delete(webFacilities).where(eq(webFacilities.id, Number(id))).returning();
  console.log("Delete result:", result);
  revalidatePath("/admin/cms/facilities");
}

// --- ACHIEVEMENTS ---
export async function getAchievements() {
  return await db.query.webAchievements.findMany({
    orderBy: [desc(webAchievements.year)]
  });
}

export async function saveAchievement(data: AchievementData) {
  const { id, ...values } = data;
  if (id) {
    await db.update(webAchievements).set({ ...values, updatedAt: new Date() }).where(eq(webAchievements.id, Number(id)));
  } else {
    await db.insert(webAchievements).values(values);
  }
  revalidatePath("/admin/cms/achievements");
}

export async function deleteAchievement(id: number) {
  await db.delete(webAchievements).where(eq(webAchievements.id, Number(id)));
  revalidatePath("/admin/cms/achievements");
}

// --- HEROES ---
export async function getHeroes() {
  return await db.query.webHeroes.findMany();
}

export async function saveHero(data: HeroData) {
  const { id, ...values } = data;
  if (id) {
    await db.update(webHeroes).set({ ...values, updatedAt: new Date() }).where(eq(webHeroes.id, Number(id)));
  } else {
    await db.insert(webHeroes).values(values);
  }
  revalidatePath("/admin/cms/heroes");
}

export async function deleteHero(id: number) {
  await db.delete(webHeroes).where(eq(webHeroes.id, Number(id)));
  revalidatePath("/admin/cms/heroes");
}

export async function saveSettings(settings: Record<string, string>, group: string = 'umum') {
  for (const [key, value] of Object.entries(settings)) {
    await db.insert(webSettings)
      .values({ key, value, group })
      .onConflictDoUpdate({ target: webSettings.key, set: { value, group } });
  }
  revalidatePath("/admin/cms/settings");
  revalidatePath("/api/web/settings");
  if (group === 'ppdb') revalidatePath("/api/web/ppdb/info");
  return { success: true };
}

// --- PROGRAMS ---
export async function getPrograms() {
  return await db.query.webPrograms.findMany({
    orderBy: [webPrograms.order]
  });
}

export async function saveProgram(data: ProgramData) {
  const { id, ...values } = data;
  if (id) {
    await db.update(webPrograms).set({ ...values, updatedAt: new Date() }).where(eq(webPrograms.id, Number(id)));
  } else {
    await db.insert(webPrograms).values(values);
  }
  revalidatePath("/admin/cms/programs");
  return { success: true, message: "Berhasil disimpan" };
}

export async function deleteProgram(id: number) {
  await db.delete(webPrograms).where(eq(webPrograms.id, Number(id)));
  revalidatePath("/admin/cms/programs");
  return { success: true, message: "Berhasil dihapus" };
}

// --- STATS ---
export async function getStats() {
  return await db.query.webStats.findMany({
    orderBy: [webStats.order]
  });
}

export async function saveStat(data: StatData) {
  const { id, ...values } = data;
  if (id) {
    await db.update(webStats).set({ ...values, updatedAt: new Date() }).where(eq(webStats.id, Number(id)));
  } else {
    await db.insert(webStats).values(values);
  }
  revalidatePath("/admin/cms/stats");
  return { success: true, message: "Berhasil disimpan" };
}

export async function deleteStat(id: number) {
  await db.delete(webStats).where(eq(webStats.id, Number(id)));
  revalidatePath("/admin/cms/stats");
  return { success: true, message: "Berhasil dihapus" };
}
