"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---
const taskBaseSchema = z.object({
  title: z.string().min(3, "عنوان المهمة يجب أن يكون 3 أحرف على الأقل").max(190),
  description: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  requiresApproval: z.boolean().default(false),
  dueDate: z.date().nullable().optional(),
  relatedType: z.string().nullable().optional(),
  relatedId: z.string().nullable().optional(),
});

export async function createTask(data: z.infer<typeof taskBaseSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.create", { mode: "enforce", context: "Create Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لإنشاء مهمة");

  const validatedData = taskBaseSchema.parse(data);

  // If assigned, verify user is active
  if (validatedData.assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: validatedData.assignedToId } });
    if (!assignee || !assignee.isActive) {
      throw new Error("المستخدم المسند إليه غير صالح أو غير فعال");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Task
    const task = await tx.task.create({
      data: {
        ...validatedData,
        createdById: user.id,
        taskStatus: "TODO",
        approvalStatus: "NOT_REQUIRED",
        approvalRound: 0,
      },
    });

    // 2. Add creator as watcher
    await tx.taskWatcher.create({
      data: { taskId: task.id, userId: user.id },
    });

    // 3. Log Activity
    await tx.taskActivityLog.create({
      data: {
        taskId: task.id,
        actorId: user.id,
        eventType: "CREATED",
        metadata: { title: task.title, priority: task.priority },
      },
    });

    return task;
  });

  revalidatePath("/crm/tasks");
  return { success: true, taskId: result.id };
}

export async function updateTask(taskId: string, data: Partial<z.infer<typeof taskBaseSchema>>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("tasks.edit", { mode: "enforce", context: "Update Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لتعديل المهام");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("المهمة غير موجودة");
  if (task.taskStatus === "DONE" || task.taskStatus === "CANCELLED") throw new Error("لا يمكن تعديل مهمة مكتملة أو ملغاة");

  if (data.assignedToId && data.assignedToId !== task.assignedToId) {
    const hasAssignPerm = await requirePermission("tasks.assign", { mode: "enforce", context: "Assign Task" });
    if (!hasAssignPerm) throw new Error("ليس لديك صلاحية لتغيير إسناد المهمة");
    
    const assignee = await prisma.user.findUnique({ where: { id: data.assignedToId } });
    if (!assignee || !assignee.isActive) throw new Error("المستخدم المسند إليه غير صالح أو غير فعال");
  }

  // Strip restricted fields just in case
  const updateData = {
    title: data.title,
    description: data.description,
    priority: data.priority,
    dueDate: data.dueDate,
    assignedToId: data.assignedToId,
  };

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: updateData,
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "UPDATED",
        metadata: { updatedFields: Object.keys(updateData) },
      },
    });

    // Add new assignee to watchers if not already
    if (updateData.assignedToId && updateData.assignedToId !== task.assignedToId) {
      await tx.taskWatcher.upsert({
        where: { taskId_userId: { taskId, userId: updateData.assignedToId } },
        update: {},
        create: { taskId, userId: updateData.assignedToId },
      });
    }
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function startTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.edit", { mode: "enforce", context: "Start Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لتعديل المهام");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("المهمة غير موجودة");
  if (task.taskStatus !== "TODO") throw new Error("المهمة ليست في حالة انتظار البدء");

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { taskStatus: "IN_PROGRESS" },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "IN_PROGRESS",
        fromStatus: "TODO",
        toStatus: "IN_PROGRESS",
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}

export async function submitForApproval(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.edit", { mode: "enforce", context: "Submit for Approval" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية");

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("المهمة غير موجودة");
    if (!task.requiresApproval) throw new Error("المهمة لا تتطلب اعتماداً");
    if (task.taskStatus !== "IN_PROGRESS") throw new Error("يجب البدء في المهمة أولاً (IN_PROGRESS) قبل إرسالها للاعتماد");
    if (task.approvalStatus === "PENDING") throw new Error("المهمة مرسلة للاعتماد بالفعل");

    const newRound = task.approvalRound + 1;

    // Atomic update
    const updated = await tx.task.updateMany({
      where: {
        id: taskId,
        approvalStatus: task.approvalStatus, // Ensure nobody changed it
        approvalRound: task.approvalRound
      },
      data: {
        approvalStatus: "PENDING",
        approvalRound: newRound,
      },
    });

    if (updated.count === 0) throw new Error("تعذر إرسال المهمة (حدث تزامن)");

    await tx.taskApproval.create({
      data: {
        taskId,
        approvalRound: newRound,
        status: "PENDING",
        requestedById: user.id,
      },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: newRound > 1 ? "RESUBMITTED" : "SUBMITTED_FOR_APPROVAL",
        fromStatus: task.approvalStatus,
        toStatus: "PENDING",
        metadata: { approvalRound: newRound },
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}

export async function approveTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.approve", { mode: "enforce", context: "Approve Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية للاعتماد");

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("المهمة غير موجودة");
    if (task.approvalStatus !== "PENDING") throw new Error("المهمة ليست بانتظار الاعتماد");

    const updatedTask = await tx.task.updateMany({
      where: {
        id: taskId,
        approvalStatus: "PENDING",
        approvalRound: task.approvalRound
      },
      data: {
        approvalStatus: "APPROVED",
        taskStatus: "DONE",
        completedAt: new Date(),
      },
    });

    if (updatedTask.count === 0) throw new Error("تمت معالجة الطلب مسبقاً أو تغيرت حالة المهمة");

    await tx.taskApproval.updateMany({
      where: { taskId, approvalRound: task.approvalRound, status: "PENDING" },
      data: {
        status: "APPROVED",
        approverId: user.id,
        decidedAt: new Date(),
      },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "APPROVED",
        fromStatus: "PENDING",
        toStatus: "APPROVED",
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}

export async function rejectTask(taskId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.approve", { mode: "enforce", context: "Reject Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية للاعتماد");

  const cleanReason = reason.trim();
  if (cleanReason.length < 5) throw new Error("يجب كتابة سبب الرفض بوضوح");

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("المهمة غير موجودة");
    if (task.approvalStatus !== "PENDING") throw new Error("المهمة ليست بانتظار الاعتماد");

    const updatedTask = await tx.task.updateMany({
      where: {
        id: taskId,
        approvalStatus: "PENDING",
        approvalRound: task.approvalRound
      },
      data: {
        approvalStatus: "REJECTED",
        taskStatus: "IN_PROGRESS", // Return to work
      },
    });

    if (updatedTask.count === 0) throw new Error("تمت معالجة الطلب مسبقاً أو تغيرت حالة المهمة");

    await tx.taskApproval.updateMany({
      where: { taskId, approvalRound: task.approvalRound, status: "PENDING" },
      data: {
        status: "REJECTED",
        approverId: user.id,
        decidedAt: new Date(),
        decisionComment: cleanReason,
      },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "REJECTED",
        fromStatus: "PENDING",
        toStatus: "REJECTED",
        metadata: { reason: cleanReason },
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}

export async function completeTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.edit", { mode: "enforce", context: "Complete Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية");

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("المهمة غير موجودة");
    if (task.requiresApproval) throw new Error("هذه المهمة تتطلب اعتماداً، ولا يمكن إنهاؤها مباشرة");
    if (task.taskStatus === "DONE" || task.taskStatus === "CANCELLED") throw new Error("الحالة الحالية لا تسمح بالإكمال");

    await tx.task.update({
      where: { id: taskId },
      data: {
        taskStatus: "DONE",
        completedAt: new Date(),
      },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "COMPLETED",
        fromStatus: task.taskStatus,
        toStatus: "DONE",
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}

export async function cancelTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const hasPerm = await requirePermission("tasks.delete", { mode: "enforce", context: "Cancel Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لإلغاء المهمة");

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("المهمة غير موجودة");
    if (task.taskStatus === "DONE") throw new Error("لا يمكن إلغاء مهمة منتهية");
    if (task.taskStatus === "CANCELLED") return;

    await tx.task.update({
      where: { id: taskId },
      data: { taskStatus: "CANCELLED" },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "CANCELLED",
        fromStatus: task.taskStatus,
        toStatus: "CANCELLED",
      },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function addComment(taskId: string, commentText: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const clean = commentText.trim();
  if (!clean) throw new Error("التعليق فارغ");

  await prisma.$transaction(async (tx) => {
    await tx.taskComment.create({
      data: { taskId, userId: user.id, comment: clean },
    });

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "COMMENT_ADDED",
      },
    });

    // Auto-watch
    await tx.taskWatcher.upsert({
      where: { taskId_userId: { taskId, userId: user.id } },
      update: {},
      create: { taskId, userId: user.id },
    });
  });

  revalidatePath(`/crm/tasks/${taskId}`);
  return { success: true };
}
