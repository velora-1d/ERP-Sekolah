import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  webPosts, 
  webHeroes, 
  webFacilities, 
  webTeachers, 
  webAchievements, 
  webSettings 
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug;
  const resource = path[0];
  const subResource = path[1];

  try {
    // 1. POSTS
    if (resource === "posts") {
      if (subResource) {
        // Single Post by Slug
        const post = await db.query.webPosts.findFirst({
          where: and(eq(webPosts.slug, subResource), eq(webPosts.status, "published")),
        });
        if (!post) return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404 });
        return NextResponse.json({ success: true, data: post });
      } else {
        // All Published Posts
        const posts = await db.query.webPosts.findMany({
          where: eq(webPosts.status, "published"),
          orderBy: [desc(webPosts.publishedAt)],
        });
        return NextResponse.json({ success: true, data: posts });
      }
    }

    // 2. HEROES
    if (resource === "heroes") {
      const heroes = await db.query.webHeroes.findMany({
        where: eq(webHeroes.status, "aktif"),
        orderBy: [webHeroes.order],
      });
      return NextResponse.json({ success: true, data: heroes });
    }

    // 3. TEACHERS
    if (resource === "teachers") {
      const teachers = await db.query.webTeachers.findMany({
        where: eq(webTeachers.status, "aktif"),
        orderBy: [webTeachers.order],
      });
      return NextResponse.json({ success: true, data: teachers });
    }

    // 4. FACILITIES (Features)
    if (resource === "facilities" || resource === "features") {
      const facilities = await db.query.webFacilities.findMany({
        orderBy: [webFacilities.order],
      });
      return NextResponse.json({ success: true, data: facilities });
    }

    // 5. ACHIEVEMENTS
    if (resource === "achievements") {
      const achievements = await db.query.webAchievements.findMany({
        orderBy: [desc(webAchievements.year)],
      });
      return NextResponse.json({ success: true, data: achievements });
    }

    // 6. SETTINGS
    if (resource === "settings") {
      const settings = await db.query.webSettings.findMany();
      // Transform into object key-value
      const settingsObj = settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      return NextResponse.json({ success: true, data: settingsObj }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: false, message: "Resource not found" }, { status: 404, headers: corsHeaders });
  } catch (error: any) {
    console.error(`[API web/${resource}] Error:`, error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500, headers: corsHeaders });
  }
}
