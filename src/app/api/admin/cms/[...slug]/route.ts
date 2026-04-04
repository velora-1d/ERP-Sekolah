import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  webTeachers, webFacilities, 
  webAchievements, webHeroes 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const user = await getAuthUser();
  if (!["superadmin", "admin"].includes(user?.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const resource = slug[0];
  const body = await request.json();

  try {
    if (resource === "teachers") {
      await db.insert(webTeachers).values(body);
    } else if (resource === "facilities") {
      await db.insert(webFacilities).values(body);
    } else if (resource === "achievements") {
      await db.insert(webAchievements).values({ ...body, year: Number(body.year) });
    } else if (resource === "heroes") {
      await db.insert(webHeroes).values(body);
    }

    revalidatePath(`/admin/cms/${resource}`);
    revalidatePath(`/api/web/${resource}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[Admin CMS POST ${resource}] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const user = await getAuthUser();
  if (!["superadmin", "admin"].includes(user?.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const resource = slug[0];
  const { id, ...values } = await request.json();

  try {
    if (resource === "teachers") {
      await db.update(webTeachers).set(values).where(eq(webTeachers.id, id));
    } else if (resource === "facilities") {
      await db.update(webFacilities).set(values).where(eq(webFacilities.id, id));
    } else if (resource === "achievements") {
      await db.update(webAchievements).set({ ...values, year: Number(values.year) }).where(eq(webAchievements.id, id));
    } else if (resource === "heroes") {
      await db.update(webHeroes).set(values).where(eq(webHeroes.id, id));
    }

    revalidatePath(`/admin/cms/${resource}`);
    revalidatePath(`/api/web/${resource}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[Admin CMS PUT ${resource}] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const user = await getAuthUser();
  if (!["superadmin", "admin"].includes(user?.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const resource = slug[0];
  const idString = request.nextUrl.searchParams.get("id");
  const id = idString ? Number(idString) : null;

  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  try {
    if (resource === "teachers") {
      await db.delete(webTeachers).where(eq(webTeachers.id, id));
    } else if (resource === "facilities") {
      await db.delete(webFacilities).where(eq(webFacilities.id, id));
    } else if (resource === "achievements") {
      await db.delete(webAchievements).where(eq(webAchievements.id, id));
    } else if (resource === "heroes") {
      await db.delete(webHeroes).where(eq(webHeroes.id, id));
    }

    revalidatePath(`/admin/cms/${resource}`);
    revalidatePath(`/api/web/${resource}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[Admin CMS DELETE ${resource}] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
