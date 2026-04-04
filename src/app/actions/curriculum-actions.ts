'use server';

import { db } from "@/db";
import { curriculums, gradeComponents, kkms } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CurriculumSchema = z.object({
  type: z.string().min(1),
  academicYearId: z.number(),
  semester: z.string().min(1),
  isLocked: z.boolean().optional(),
});

export async function createCurriculum(data: z.infer<typeof CurriculumSchema>) {
  try {
    const validated = CurriculumSchema.parse(data);
    
    // Check duplication
    const [existing] = await db
      .select()
      .from(curriculums)
      .where(
        and(
          eq(curriculums.type, validated.type),
          eq(curriculums.academicYearId, validated.academicYearId),
          eq(curriculums.semester, validated.semester)
        )
      )
      .limit(1);

    if (existing) return { success: false, error: "Kurikulum sudah ada untuk periode ini." };

    const [newCur] = await db.insert(curriculums).values(validated).returning();
    revalidatePath("/curriculum");
    return { success: true, data: newCur };
  } catch (error) {
    console.error("[CREATE_CURRICULUM_ERROR]", error);
    return { success: false, error: "Gagal membuat kurikulum" };
  }
}

export async function updateCurriculumInfo(id: number, type: string) {
  try {
    const [updated] = await db
      .update(curriculums)
      .set({ type, updatedAt: new Date() })
      .where(eq(curriculums.id, id))
      .returning();
    
    revalidatePath("/curriculum");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[UPDATE_CURRICULUM_ERROR]", error);
    return { success: false, error: "Gagal mengubah kurikulum" };
  }
}

export async function resetCurriculum(id: number) {
  try {
    // Transactional delete
    await db.transaction(async (tx) => {
      await tx.delete(kkms).where(eq(kkms.curriculumId, id));
      await tx.delete(gradeComponents).where(eq(gradeComponents.curriculumId, id));
      await tx.delete(curriculums).where(eq(curriculums.id, id));
    });

    revalidatePath("/curriculum");
    return { success: true };
  } catch (error) {
    console.error("[RESET_CURRICULUM_ERROR]", error);
    return { success: false, error: "Gagal reset kurikulum" };
  }
}

export async function deleteGradeComponent(id: number) {
  try {
    await db.delete(gradeComponents).where(eq(gradeComponents.id, id));
    revalidatePath("/curriculum");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_COMPONENT_ERROR]", error);
    return { success: false, error: "Gagal menghapus komponen" };
  }
}

export async function saveKkmValue(curriculumId: number, subjectId: number, value: number, deskripsi: string) {
  try {
    const [existing] = await db
      .select()
      .from(kkms)
      .where(and(eq(kkms.curriculumId, curriculumId), eq(kkms.subjectId, subjectId)))
      .limit(1);

    if (existing) {
      await db
        .update(kkms)
        .set({ nilaiKKM: value, deskripsiKKTP: deskripsi, updatedAt: new Date() })
        .where(eq(kkms.id, existing.id));
    } else {
      await db.insert(kkms).values({
        curriculumId,
        subjectId,
        nilaiKKM: value,
        deskripsiKKTP: deskripsi,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[SAVE_KKM_ERROR]", error);
    return { success: false, error: "Gagal menyimpan KKM" };
  }
}
