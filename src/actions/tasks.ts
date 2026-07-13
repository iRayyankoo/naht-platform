"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requirePermission, isSuperAdmin } from "@/lib/rbac-helpers";
import { canApproveOrRejectTask, canAssignTaskToSelfAsApprover } from "@/lib/logic-rules";
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
  workProjectId: z.string().nullable().optional(),
  workProjectSectionId: z.string().nullable().optional(),
  designatedApproverId: z.string().nullable().optional(),
  plannedStartAt: z.date().nullable().optional(),
});

export async function createTask(data: z.infer<typeof taskBaseSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("tasks.create", { mode: "enforce", context: "Create Task" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لإنشاء مهمة");

  const validatedData = taskBaseSchema.parse(data);

  if (validatedData.plannedStartAt && validatedData.dueDate) {
    if (validatedData.plannedStartAt > validatedData.dueDate) {
      throw new Error("تاريخ البداية المخطط لا يمكن أن يكون بعد تاريخ الاستحقاق");
    }
  }

  // If assigned, verify user is active
  if (validatedData.assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: validatedData.assignedToId } });
    if (!assignee || !assignee.isActive) {
      throw new Error("المستخدم المسند إليه غير صالح أو غير فعال");
    }

    if (validatedData.workProjectId) {
      const isMember = await prisma.workProjectMember.findUnique({
        where: { workProjectId_userId: { workProjectId: validatedData.workProjectId, userId: validatedData.assignedToId } }
      });
      if (!isMember) {
        throw new Error("المستخدم المسند إليه يجب أن يكون عضواً في مشروع العمل");
      }
    }
  }

  if (validatedData.requiresApproval) {
    if (!validatedData.designatedApproverId) {
      throw new Error("يجب تحديد معتمد للمهمة إذا كانت تتطلب اعتماداً");
    }
    const approver = await prisma.user.findUnique({ where: { id: validatedData.designatedApproverId } });
    if (!approver || !approver.isActive) {
      throw new Error("المعتمد المحدد غير صالح أو غير فعال");
    }

    if (validatedData.workProjectId) {
      const isMember = await prisma.workProjectMember.findUnique({
        where: { workProjectId_userId: { workProjectId: validatedData.workProjectId, userId: validatedData.designatedApproverId } }
      });
      if (!isMember) {
        throw new Error("المعتمد المحدد يجب أن يكون عضواً في مشروع العمل");
      }
    }

    if (validatedData.assignedToId === validatedData.designatedApproverId) {
      const isSuperAdminUser = await isSuperAdmin(user.id);
      if (!canAssignTaskToSelfAsApprover(isSuperAdminUser, validatedData.assignedToId, validatedData.designatedApproverId)) {
        throw new Error("لا يمكن أن يكون منفذ المهمة هو نفسه المعتمد");
      }
    }
  } else {
    validatedData.designatedApproverId = null; // Clear if not required
  }

  if (validatedData.workProjectId) {
    // Check if project is cancelled or completed
    const project = await prisma.workProject.findUnique({ where: { id: validatedData.workProjectId } });
    if (!project) throw new Error("مشروع العمل غير موجود");
    if (project.status === "CANCELLED" || project.status === "COMPLETED") {
      throw new Error("لا يمكن إضافة مهام لمشروع ملغى أو مكتمل");
    }

    if (validatedData.workProjectSectionId) {
      const section = await prisma.workProjectSection.findUnique({ where: { id: validatedData.workProjectSectionId } });
      if (!section) throw new Error("القسم غير موجود");
      if (section.workProjectId !== validatedData.workProjectId) throw new Error("القسم لا ينتمي لهذا المشروع");
      if (section.status === "ARCHIVED") throw new Error("لا يمكن إضافة مهام لقسم مؤرشف");

      if (validatedData.assignedToId) {
        const isSectionMember = await prisma.workProjectSectionMember.findUnique({
          where: { sectionId_userId: { sectionId: validatedData.workProjectSectionId, userId: validatedData.assignedToId } }
        });
        if (!isSectionMember) throw new Error("المستخدم المسند إليه يجب أن يكون عضواً في القسم المختار");
      }
    }
  } else if (validatedData.workProjectSectionId) {
    throw new Error("لا يمكن اختيار قسم بدون مشروع عمل");
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

  const finalPlannedStartAt = data.plannedStartAt !== undefined ? data.plannedStartAt : task.plannedStartAt;
  const finalDueDate = data.dueDate !== undefined ? data.dueDate : task.dueDate;

  if (finalPlannedStartAt && finalDueDate) {
    if (finalPlannedStartAt > finalDueDate) {
      throw new Error("تاريخ البداية المخطط لا يمكن أن يكون بعد تاريخ الاستحقاق");
    }
  }

  if (data.assignedToId && data.assignedToId !== task.assignedToId) {
    const hasAssignPerm = await requirePermission("tasks.assign", { mode: "enforce", context: "Assign Task" });
    if (!hasAssignPerm) throw new Error("ليس لديك صلاحية لتغيير إسناد المهمة");

    const assignee = await prisma.user.findUnique({ where: { id: data.assignedToId } });
    if (!assignee || !assignee.isActive) throw new Error("المستخدم المسند إليه غير صالح أو غير فعال");
  }

  const updateData = {
    title: data.title,
    description: data.description,
    priority: data.priority,
    dueDate: data.dueDate,
    assignedToId: data.assignedToId,
    workProjectId: data.workProjectId,
    workProjectSectionId: data.workProjectSectionId,
    requiresApproval: data.requiresApproval,
    designatedApproverId: data.designatedApproverId,
    plannedStartAt: data.plannedStartAt !== undefined ? data.plannedStartAt : undefined,
  };

  // Validation for requiresApproval & designatedApproverId
  if (updateData.requiresApproval) {
    if (!updateData.designatedApproverId) {
      throw new Error("يجب تحديد معتمد للمهمة إذا كانت تتطلب اعتماداً");
    }
    const approver = await prisma.user.findUnique({ where: { id: updateData.designatedApproverId } });
    if (!approver || !approver.isActive) {
      throw new Error("المعتمد المحدد غير صالح أو غير فعال");
    }
    if (updateData.assignedToId === updateData.designatedApproverId || (task.assignedToId === updateData.designatedApproverId && !updateData.assignedToId)) {
       const isSuperAdminUser = await isSuperAdmin(user.id);
       const finalAssignee = updateData.assignedToId || task.assignedToId || "";
       if (!canAssignTaskToSelfAsApprover(isSuperAdminUser, finalAssignee, updateData.designatedApproverId)) {
         throw new Error("لا يمكن أن يكون منفذ المهمة هو نفسه المعتمد");
       }
    }
  } else if (updateData.requiresApproval === false) {
    updateData.designatedApproverId = null;
  }

  // Work Project validation
  const finalWorkProjectId = updateData.workProjectId !== undefined ? updateData.workProjectId : task.workProjectId;
  if (finalWorkProjectId) {
    const project = await prisma.workProject.findUnique({ where: { id: finalWorkProjectId } });
    if (!project) throw new Error("مشروع العمل غير موجود");
    if (project.status === "CANCELLED" || project.status === "COMPLETED") {
      throw new Error("لا يمكن نقل/إضافة مهمة لمشروع ملغى أو مكتمل");
    }

    // Check members
    const finalAssigneeId = updateData.assignedToId !== undefined ? updateData.assignedToId : task.assignedToId;
    if (finalAssigneeId) {
      const isMember = await prisma.workProjectMember.findUnique({
        where: { workProjectId_userId: { workProjectId: finalWorkProjectId, userId: finalAssigneeId } }
      });
      if (!isMember) throw new Error("المستخدم المسند إليه يجب أن يكون عضواً في المشروع الجديد");
    }

    const finalApproverId = updateData.designatedApproverId !== undefined ? updateData.designatedApproverId : task.designatedApproverId;
    if (finalApproverId && (updateData.requiresApproval || task.requiresApproval)) {
      const isMember = await prisma.workProjectMember.findUnique({
        where: { workProjectId_userId: { workProjectId: finalWorkProjectId, userId: finalApproverId } }
      });
      if (!isMember) throw new Error("المعتمد المحدد يجب أن يكون عضواً في المشروع الجديد");
    }

    let finalSectionId = updateData.workProjectSectionId !== undefined ? updateData.workProjectSectionId : task.workProjectSectionId;

    if (updateData.workProjectId !== undefined && updateData.workProjectId !== task.workProjectId) {
      if (updateData.workProjectSectionId === undefined) {
        finalSectionId = null; // Clear section if project changed and no new section provided
        updateData.workProjectSectionId = null;
      }
    }

    if (finalSectionId) {
      const section = await prisma.workProjectSection.findUnique({ where: { id: finalSectionId } });
      if (!section) throw new Error("القسم غير موجود");
      if (section.workProjectId !== finalWorkProjectId) throw new Error("القسم لا ينتمي لهذا المشروع");

      // Check ACTIVE only if section changed
      if (finalSectionId !== task.workProjectSectionId && section.status === "ARCHIVED") {
        throw new Error("لا يمكن إسناد المهمة لقسم مؤرشف");
      }

      if (finalAssigneeId) {
        const isSectionMember = await prisma.workProjectSectionMember.findUnique({
          where: { sectionId_userId: { sectionId: finalSectionId, userId: finalAssigneeId } }
        });
        if (!isSectionMember) throw new Error("المستخدم المسند إليه يجب أن يكون عضواً في القسم المختار");
      }
    }
  } else if (updateData.workProjectSectionId) {
    throw new Error("لا يمكن اختيار قسم بدون مشروع عمل");
  }

  if (task.approvalStatus === "PENDING") {
    if (updateData.workProjectId !== undefined && updateData.workProjectId !== task.workProjectId) {
      throw new Error("لا يمكن تغيير مشروع العمل لمهمة بانتظار الاعتماد");
    }
    if (updateData.assignedToId !== undefined && updateData.assignedToId !== task.assignedToId) {
      throw new Error("لا يمكن تغيير منفذ مهمة بانتظار الاعتماد");
    }
    if (updateData.designatedApproverId !== undefined && updateData.designatedApproverId !== task.designatedApproverId) {
      throw new Error("لا يمكن تغيير المعتمد المحدد لمهمة بانتظار الاعتماد");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: updateData,
    });

    const changes: Record<string, unknown> = {};
    if (updateData.workProjectId !== undefined && updateData.workProjectId !== task.workProjectId) {
      changes.workProjectId = { old: task.workProjectId, new: updateData.workProjectId };
    }
    if (updateData.workProjectSectionId !== undefined && updateData.workProjectSectionId !== task.workProjectSectionId) {
      changes.workProjectSectionId = { old: task.workProjectSectionId, new: updateData.workProjectSectionId };
    }
    if (updateData.assignedToId !== undefined && updateData.assignedToId !== task.assignedToId) {
      changes.assignedToId = { old: task.assignedToId, new: updateData.assignedToId };
    }
    if (updateData.designatedApproverId !== undefined && updateData.designatedApproverId !== task.designatedApproverId) {
      changes.designatedApproverId = { old: task.designatedApproverId, new: updateData.designatedApproverId };
    }
    if (updateData.plannedStartAt !== undefined && updateData.plannedStartAt?.getTime() !== task.plannedStartAt?.getTime()) {
      changes.plannedStartAt = { old: task.plannedStartAt, new: updateData.plannedStartAt };
    }

    await tx.taskActivityLog.create({
      data: {
        taskId,
        actorId: user.id,
        eventType: "UPDATED",
        metadata: { updatedFields: Object.keys(updateData), ...changes },
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
    if (!task.designatedApproverId) throw new Error("يجب تحديد معتمد للمهمة قبل إرسالها للاعتماد");
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

    // Only designated approver or SUPER_ADMIN can approve
    let isOverride = false;
    if (task.designatedApproverId && task.designatedApproverId !== user.id) {
       const isSuperAdminUser = await isSuperAdmin(user.id);
       if (!canApproveOrRejectTask(isSuperAdminUser, task.designatedApproverId, user.id)) {
         throw new Error("فقط المعتمد المحدد يمكنه الاعتماد");
       }
       isOverride = true;
    }

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
        metadata: {
          approverId: user.id,
          designatedApproverId: task.designatedApproverId,
          isSuperAdminOverride: isOverride,
        }
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

    let isOverride = false;
    if (task.designatedApproverId && task.designatedApproverId !== user.id) {
       const isSuperAdminUser = await isSuperAdmin(user.id);
       if (!canApproveOrRejectTask(isSuperAdminUser, task.designatedApproverId, user.id)) {
         throw new Error("فقط المعتمد المحدد يمكنه الرفض");
       }
       isOverride = true;
    }

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
        metadata: {
          reason: cleanReason,
          approverId: user.id,
          designatedApproverId: task.designatedApproverId,
          isSuperAdminOverride: isOverride,
        },
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
