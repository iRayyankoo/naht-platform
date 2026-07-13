"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { TaskViewMode } from "@prisma/client";
import { z } from "zod";

const taskViewModeSchema = z.nativeEnum(TaskViewMode);

export async function getMyTaskViewPreference(): Promise<TaskViewMode> {
  const user = await getCurrentUser();
  if (!user) {
    return "KANBAN"; // Return KANBAN if user not authenticated
  }

  const preference = await prisma.userTaskPreference.findUnique({
    where: { userId: user.id }
  });

  if (!preference) {
    return "KANBAN";
  }

  return preference.defaultViewMode;
}

export async function updateMyTaskViewPreference(viewMode: TaskViewMode): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول لتحديث تفضيلات العرض" };
    }

    const validatedMode = taskViewModeSchema.parse(viewMode);

    await prisma.userTaskPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultViewMode: validatedMode,
      },
      update: {
        defaultViewMode: validatedMode,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating task view preference:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ تفضيل طريقة العرض" };
  }
}
