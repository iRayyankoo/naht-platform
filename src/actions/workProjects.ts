"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requirePermission, isSuperAdmin } from "@/lib/rbac-helpers";
import { canEditWorkProject, canTransferWorkProjectOwnership, canManageWorkProjectMembers, canCancelWorkProject } from "@/lib/logic-rules";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { WorkProjectStatus, WorkProjectMemberRole } from "@prisma/client";

// --- Validation Schemas ---
const workProjectSchema = z.object({
  name: z.string().min(3, "اسم المشروع يجب أن يكون 3 أحرف على الأقل").max(190),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(WorkProjectStatus).default("PLANNING"),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
});

export async function createWorkProject(data: z.infer<typeof workProjectSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.create", { mode: "enforce", context: "Create Work Project" });
  if (!hasPerm) throw new Error("ليس لديك صلاحية لإنشاء مشروع عمل");

  const validated = workProjectSchema.parse(data);

  if (validated.startDate && validated.endDate && validated.endDate < validated.startDate) {
    throw new Error("تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Work Project
    const project = await tx.workProject.create({
      data: {
        ...validated,
        ownerId: user.id,
      },
    });

    // 2. Add owner as OWNER member
    await tx.workProjectMember.create({
      data: {
        workProjectId: project.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    // 3. Log Activity
    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: project.id,
        actorId: user.id,
        eventType: "CREATED",
        metadata: { name: project.name, status: project.status },
      },
    });

    return project;
  });

  revalidatePath("/crm/tasks");
  return { success: true, workProjectId: result.id };
}

export async function updateWorkProject(projectId: string, data: Partial<z.infer<typeof workProjectSchema>>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: user.id } } },
  });
  if (!project) throw new Error("المشروع غير موجود");

  if (project.status === "CANCELLED") {
    throw new Error("لا يمكن تعديل مشروع ملغى");
  }

  const hasEditPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Update Work Project" });
  if (!hasEditPerm) throw new Error("ليس لديك الصلاحية النظامية لتعديل مشاريع العمل");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canEditWorkProject(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من تعديله");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  const startDate = data.startDate !== undefined ? data.startDate : project.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : project.endDate;
  if (startDate && endDate && endDate < startDate) {
    throw new Error("تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية");
  }

  const updateData = {
    name: data.name,
    description: data.description,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
  };

  await prisma.$transaction(async (tx) => {
    await tx.workProject.update({
      where: { id: projectId },
      data: updateData,
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "UPDATED",
        metadata: { updatedFields: Object.keys(updateData), isSuperAdminOverride: isOverride },
      },
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}

export async function transferWorkProjectOwnership(projectId: string, newOwnerId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) throw new Error("المشروع غير موجود");

  const hasPerm = await requirePermission("work_projects.transfer_ownership", { mode: "enforce", context: "Transfer Work Project Ownership" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لنقل الملكية");

  const isSuperAdminUser = await isSuperAdmin(user.id);

  if (!canTransferWorkProjectOwnership(isSuperAdminUser, project.ownerId || "", user.id)) {
    throw new Error("فقط المالك الحالي أو المشرف العام يمكنه نقل الملكية");
  }

  const isOverride = isSuperAdminUser && project.ownerId !== user.id;

  const newOwner = await prisma.user.findUnique({ where: { id: newOwnerId } });
  if (!newOwner || !newOwner.isActive) {
    throw new Error("المالك الجديد غير صالح أو غير فعال");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update project ownerId atomically
    const updated = await tx.workProject.updateMany({
      where: { id: projectId, ownerId: project.ownerId }, // Concurrency check
      data: { ownerId: newOwnerId },
    });

    if (updated.count === 0) {
      throw new Error("فشلت عملية النقل لتغير مالك المشروع أثناء العملية (تعارض تزامن)");
    }

    // 2. Make new owner an OWNER member
    await tx.workProjectMember.upsert({
      where: { workProjectId_userId: { workProjectId: projectId, userId: newOwnerId } },
      update: { role: "OWNER" },
      create: { workProjectId: projectId, userId: newOwnerId, role: "OWNER" },
    });

    // 3. Demote old owner to MANAGER if they were the owner
    // If SuperAdmin transferred it, and SuperAdmin is not owner, old owner gets demoted
    if (project.ownerId) {
      await tx.workProjectMember.updateMany({
        where: { workProjectId: projectId, userId: project.ownerId, role: "OWNER" },
        data: { role: "MANAGER" },
      });
    }

    // 4. Activity Log
    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "OWNERSHIP_TRANSFERRED",
        metadata: { from: project.ownerId, to: newOwnerId, isSuperAdminOverride: isOverride },
      },
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}

export async function removeWorkProjectMember(projectId: string, memberIdToRemove: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: user.id } } },
  });
  if (!project) throw new Error("المشروع غير موجود");

  if (project.ownerId === memberIdToRemove) {
    throw new Error("لا يمكن إزالة المالك من المشروع");
  }

  const hasPerm = await requirePermission("work_projects.manage_members", { mode: "enforce", context: "Manage Members" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لإدارة الأعضاء");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectMembers(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من إزالة الأعضاء");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  // Check open tasks
  const openTasksCount = await prisma.task.count({
    where: {
      workProjectId: projectId,
      assignedToId: memberIdToRemove,
      taskStatus: { notIn: ["DONE", "CANCELLED"] },
    }
  });

  if (openTasksCount > 0) {
    throw new Error("لا يمكن إزالة عضو مسند إليه مهام غير مكتملة");
  }

  // Check section manager
  const managedSectionsCount = await prisma.workProjectSection.count({
    where: {
      workProjectId: projectId,
      managerId: memberIdToRemove,
    }
  });

  if (managedSectionsCount > 0) {
    throw new Error("لا يمكن إزالة عضو وهو مدير لقسم، الرجاء تغيير مدير القسم أولاً");
  }

  // Check section membership
  const activeSectionMembershipsCount = await prisma.workProjectSectionMember.count({
    where: {
      userId: memberIdToRemove,
      section: {
        workProjectId: projectId,
      }
    }
  });

  if (activeSectionMembershipsCount > 0) {
    throw new Error("لا يمكن إزالة عضو من المشروع وهو ضمن أقسام (نشطة أو مؤرشفة)، الرجاء إزالته من الأقسام أولاً");
  }

  // Check designated approver on non-complete tasks
  const approverTasksCount = await prisma.task.count({
    where: {
      workProjectId: projectId,
      designatedApproverId: memberIdToRemove,
      taskStatus: { notIn: ["DONE", "CANCELLED"] },
    }
  });

  if (approverTasksCount > 0) {
    throw new Error("لا يمكن إزالة عضو تم تحديده كمعتمد لمهام غير مكتملة");
  }

  await prisma.$transaction(async (tx) => {
    await tx.workProjectMember.deleteMany({
      where: { workProjectId: projectId, userId: memberIdToRemove }
    });

    // Remove from watchers
    const projectTasks = await tx.task.findMany({ where: { workProjectId: projectId }, select: { id: true } });
    const taskIds = projectTasks.map(t => t.id);
    if (taskIds.length > 0) {
      await tx.taskWatcher.deleteMany({
        where: { taskId: { in: taskIds }, userId: memberIdToRemove }
      });
    }

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "MEMBER_REMOVED",
        metadata: { removedUserId: memberIdToRemove, isSuperAdminOverride: isOverride },
      },
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}

export async function getWorkProjects() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.view", { mode: "enforce", context: "View Work Projects" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لعرض مشاريع العمل");

  const isSuperAdminUser = await isSuperAdmin(user.id);

  if (isSuperAdminUser) {
    const projects = await prisma.workProject.findMany({
      include: {
        owner: true,
        members: { include: { user: true } },
        _count: {
          select: {
            sections: { where: { status: "ACTIVE" } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return projects.map(p => ({ ...p, activeSectionsCount: p._count.sections }));
  } else {
    const projects = await prisma.workProject.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        owner: true,
        members: { include: { user: true } },
        _count: {
          select: {
            sections: { where: { status: "ACTIVE" } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return projects.map(p => ({ ...p, activeSectionsCount: p._count.sections }));
  }
}

export async function getWorkProject(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.view", { mode: "enforce", context: "View Work Project" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لعرض المشروع");

  const project = await prisma.workProject.findUnique({
    where: { id },
    include: {
      owner: true,
      members: { include: { user: true } },
      _count: {
        select: {
          sections: { where: { status: "ACTIVE" } }
        }
      }
    }
  });
  if (!project) throw new Error("المشروع غير موجود");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const isMember = project.members.some(m => m.userId === user.id);

  if (!isSuperAdminUser && !isMember) {
    throw new Error("يجب أن تكون عضواً لعرض هذا المشروع");
  }
  return { ...project, activeSectionsCount: project._count.sections };
}

export async function addWorkProjectMember(projectId: string, newMemberId: string, role: WorkProjectMemberRole) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.manage_members", { mode: "enforce", context: "Add Member" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لإدارة الأعضاء");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: user.id } } }
  });
  if (!project) throw new Error("المشروع غير موجود");
  if (project.status === "CANCELLED") throw new Error("لا يمكن إضافة أعضاء لمشروع ملغى");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectMembers(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من إضافة الأعضاء");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  const targetUser = await prisma.user.findUnique({ where: { id: newMemberId } });
  if (!targetUser || !targetUser.isActive) throw new Error("المستخدم غير صالح أو غير فعال");

  if (role === "OWNER") {
    throw new Error("لا يمكن إضافة عضو كمالك مباشرة. استخدم نقل الملكية بدلاً من ذلك.");
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.workProjectMember.findUnique({ where: { workProjectId_userId: { workProjectId: projectId, userId: newMemberId } } });
    if (existing) throw new Error("المستخدم عضو بالفعل في هذا المشروع");

    await tx.workProjectMember.create({
      data: { workProjectId: projectId, userId: newMemberId, role }
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "MEMBER_ADDED",
        metadata: { addedUserId: newMemberId, role, isSuperAdminOverride: isOverride }
      }
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}

export async function updateWorkProjectMemberRole(projectId: string, memberId: string, newRole: WorkProjectMemberRole) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.manage_members", { mode: "enforce", context: "Update Member Role" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لإدارة الأعضاء");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: user.id } } }
  });
  if (!project) throw new Error("المشروع غير موجود");
  if (project.status === "CANCELLED") throw new Error("لا يمكن تعديل أدوار في مشروع ملغى");

  if (project.ownerId === memberId) throw new Error("لا يمكن تعديل دور المالك. استخدم نقل الملكية بدلاً من ذلك.");
  if (newRole === "OWNER") throw new Error("لا يمكن تعيين عضو كمالك مباشرة. استخدم نقل الملكية.");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectMembers(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من تعديل الأدوار");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  await prisma.$transaction(async (tx) => {
    const existing = await tx.workProjectMember.findUnique({ where: { workProjectId_userId: { workProjectId: projectId, userId: memberId } } });
    if (!existing) throw new Error("المستخدم ليس عضواً في هذا المشروع");
    if (existing.role === newRole) return;

    await tx.workProjectMember.update({
      where: { workProjectId_userId: { workProjectId: projectId, userId: memberId } },
      data: { role: newRole }
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "UPDATED",
        metadata: { updatedUserId: memberId, oldRole: existing.role, newRole, isSuperAdminOverride: isOverride }
      }
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}

export async function cancelWorkProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Cancel Work Project" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية لتعديل المشاريع");

  const project = await prisma.workProject.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: user.id } } }
  });
  if (!project) throw new Error("المشروع غير موجود");
  if (project.status === "CANCELLED") throw new Error("المشروع ملغى بالفعل");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canCancelWorkProject(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً للمشروع لإلغائه"); // Stricter rule for cancellation
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER";

  await prisma.$transaction(async (tx) => {
    await tx.workProject.update({
      where: { id: projectId },
      data: { status: "CANCELLED" }
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: projectId,
        actorId: user.id,
        eventType: "UPDATED",
        metadata: { statusChangedTo: "CANCELLED", isSuperAdminOverride: isOverride }
      }
    });
  });

  revalidatePath(`/crm/tasks`);
  return { success: true };
}
