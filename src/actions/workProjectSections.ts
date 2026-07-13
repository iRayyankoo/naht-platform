"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requirePermission, isSuperAdmin } from "@/lib/rbac-helpers";
import { canManageWorkProjectSections } from "@/lib/logic-rules";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase().normalize('NFKC');
}

const sectionSchema = z.object({
  name: z.string().min(2, "اسم القسم يجب أن يكون حرفين على الأقل").max(50),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "لون غير صحيح").optional().default("#3B82F6"),
  managerId: z.string().nullable().optional(),
});

export async function createWorkProjectSection(workProjectId: string, data: z.infer<typeof sectionSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Create Section" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية للتعديل على مشاريع العمل");

  const project = await prisma.workProject.findUnique({
    where: { id: workProjectId },
    include: { members: { where: { userId: user.id } } },
  });
  if (!project) throw new Error("المشروع غير موجود");
  if (project.status === "CANCELLED") throw new Error("لا يمكن إضافة أقسام لمشروع ملغى");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectSections(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من إنشاء الأقسام");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";
  const validated = sectionSchema.parse(data);
  const normalized = normalizeName(validated.name);

  // Manager must be a member
  if (validated.managerId) {
    const managerMembership = await prisma.workProjectMember.findUnique({
      where: { workProjectId_userId: { workProjectId, userId: validated.managerId } }
    });
    if (!managerMembership) throw new Error("مدير القسم يجب أن يكون عضواً في مشروع العمل أولاً");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Unique check
      const existing = await tx.workProjectSection.findUnique({
        where: { workProjectId_normalizedName: { workProjectId, normalizedName: normalized } }
      });
      if (existing) throw new Error("يوجد قسم بهذا الاسم مسبقاً في هذا المشروع");

      const section = await tx.workProjectSection.create({
        data: {
          workProjectId,
          name: validated.name.trim(),
          normalizedName: normalized,
          description: validated.description,
          color: validated.color,
          managerId: validated.managerId,
        }
      });

      if (validated.managerId) {
        await tx.workProjectSectionMember.create({
          data: { sectionId: section.id, userId: validated.managerId }
        });
      }

      await tx.workProjectActivityLog.create({
        data: {
          workProjectId,
          actorId: user.id,
          eventType: "SECTION_CREATED",
          metadata: { sectionId: section.id, sectionName: section.name, managerId: validated.managerId, isSuperAdminOverride: isOverride },
        }
      });

      revalidatePath("/crm/tasks");
      return section;
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      throw new Error("يوجد قسم بهذا الاسم مسبقاً في هذا المشروع");
    }
    throw error;
  }
}

export async function updateWorkProjectSection(sectionId: string, data: Partial<z.infer<typeof sectionSchema>>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const section = await prisma.workProjectSection.findUnique({
    where: { id: sectionId },
    include: { workProject: { include: { members: { where: { userId: user.id } } } } }
  });
  if (!section) throw new Error("القسم غير موجود");
  if (section.status === "ARCHIVED") throw new Error("لا يمكن تعديل قسم مؤرشف");

  const project = section.workProject;
  if (project.status === "CANCELLED") throw new Error("لا يمكن تعديل أقسام في مشروع ملغى");

  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Update Section" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية للتعديل على مشاريع العمل");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectSections(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لتتمكن من تعديل الأقسام");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";
  
  let normalized = section.normalizedName;
  if (data.name) {
    normalized = normalizeName(data.name);
  }

  // Manager must be a member
  if (data.managerId && data.managerId !== section.managerId) {
    const managerMembership = await prisma.workProjectMember.findUnique({
      where: { workProjectId_userId: { workProjectId: project.id, userId: data.managerId } }
    });
    if (!managerMembership) throw new Error("المدير الجديد يجب أن يكون عضواً في مشروع العمل أولاً");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (data.name && normalized !== section.normalizedName) {
        const existing = await tx.workProjectSection.findUnique({
          where: { workProjectId_normalizedName: { workProjectId: project.id, normalizedName: normalized } }
        });
        if (existing) throw new Error("يوجد قسم بهذا الاسم مسبقاً في هذا المشروع");
      }

      const updatedSection = await tx.workProjectSection.update({
        where: { id: sectionId },
        data: {
          name: data.name ? data.name.trim() : undefined,
          normalizedName: data.name ? normalized : undefined,
          description: data.description,
          color: data.color,
          managerId: data.managerId,
        }
      });

      if (data.managerId && data.managerId !== section.managerId) {
        await tx.workProjectSectionMember.upsert({
          where: { sectionId_userId: { sectionId, userId: data.managerId } },
          create: { sectionId, userId: data.managerId },
          update: {} // do nothing if already member
        });
      }

      await tx.workProjectActivityLog.create({
        data: {
          workProjectId: project.id,
          actorId: user.id,
          eventType: "SECTION_UPDATED",
          metadata: { sectionId, updatedFields: Object.keys(data), isSuperAdminOverride: isOverride },
        }
      });

      revalidatePath("/crm/tasks");
      return updatedSection;
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      throw new Error("يوجد قسم بهذا الاسم مسبقاً في هذا المشروع");
    }
    throw error;
  }
}

export async function archiveWorkProjectSection(sectionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const section = await prisma.workProjectSection.findUnique({
    where: { id: sectionId },
    include: { workProject: { include: { members: { where: { userId: user.id } } } } }
  });
  if (!section) throw new Error("القسم غير موجود");
  if (section.status === "ARCHIVED") return { success: true }; // Idempotent

  const project = section.workProject;
  
  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Archive Section" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectSections(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لأرشفة الأقسام");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  return await prisma.$transaction(async (tx) => {
    await tx.workProjectSection.update({
      where: { id: sectionId },
      data: { status: "ARCHIVED" }
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: project.id,
        actorId: user.id,
        eventType: "SECTION_ARCHIVED",
        metadata: { sectionId, sectionName: section.name, isSuperAdminOverride: isOverride },
      }
    });

    revalidatePath("/crm/tasks");
    return { success: true };
  });
}

export async function addWorkProjectSectionMember(sectionId: string, memberUserId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const section = await prisma.workProjectSection.findUnique({
    where: { id: sectionId },
    include: { workProject: { include: { members: { where: { userId: user.id } } } } }
  });
  if (!section) throw new Error("القسم غير موجود");
  if (section.status === "ARCHIVED") throw new Error("القسم مؤرشف");

  const project = section.workProject;
  
  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Add Section Member" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectSections(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لإضافة أعضاء للقسم");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  const targetMembership = await prisma.workProjectMember.findUnique({
    where: { workProjectId_userId: { workProjectId: project.id, userId: memberUserId } }
  });
  if (!targetMembership) throw new Error("العضو يجب أن يكون مسجلاً في مشروع العمل أولاً");

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.workProjectSectionMember.findUnique({
      where: { sectionId_userId: { sectionId, userId: memberUserId } }
    });

    if (!existing) {
      await tx.workProjectSectionMember.create({
        data: { sectionId, userId: memberUserId }
      });

      await tx.workProjectActivityLog.create({
        data: {
          workProjectId: project.id,
          actorId: user.id,
          eventType: "SECTION_MEMBER_ADDED",
          metadata: { sectionId, addedUserId: memberUserId, isSuperAdminOverride: isOverride },
        }
      });
    }

    revalidatePath("/crm/tasks");
    return { success: true };
  });
}

export async function removeWorkProjectSectionMember(sectionId: string, memberUserId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const section = await prisma.workProjectSection.findUnique({
    where: { id: sectionId },
    include: { workProject: { include: { members: { where: { userId: user.id } } } } }
  });
  if (!section) throw new Error("القسم غير موجود");
  if (section.status === "ARCHIVED") throw new Error("القسم مؤرشف");

  const project = section.workProject;
  
  const hasPerm = await requirePermission("work_projects.edit", { mode: "enforce", context: "Remove Section Member" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const userMemberRole = project.members[0]?.role;

  if (!canManageWorkProjectSections(isSuperAdminUser, userMemberRole)) {
    throw new Error("يجب أن تكون مالكاً أو مديراً للمشروع لإزالة أعضاء من القسم");
  }

  const isOverride = isSuperAdminUser && userMemberRole !== "OWNER" && userMemberRole !== "MANAGER";

  if (section.managerId === memberUserId) {
    throw new Error("لا يمكن إزالة مدير القسم من قائمة الأعضاء. يجب تغيير المدير أولاً.");
  }

  // Check open tasks in this section for the user
  const openTasksCount = await prisma.task.count({
    where: {
      workProjectSectionId: sectionId,
      assignedToId: memberUserId,
      taskStatus: { notIn: ["DONE", "CANCELLED"] },
    }
  });

  if (openTasksCount > 0) {
    throw new Error("لا يمكن إزالة عضو من القسم ومسند إليه مهام غير مكتملة في هذا القسم");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.workProjectSectionMember.delete({
      where: { sectionId_userId: { sectionId, userId: memberUserId } }
    });

    await tx.workProjectActivityLog.create({
      data: {
        workProjectId: project.id,
        actorId: user.id,
        eventType: "SECTION_MEMBER_REMOVED",
        metadata: { sectionId, removedUserId: memberUserId, isSuperAdminOverride: isOverride },
      }
    });

    revalidatePath("/crm/tasks");
    return { success: true };
  });
}
export async function getWorkProjectSections(workProjectId: string, includeArchived: boolean = false) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasPerm = await requirePermission("work_projects.view", { mode: "enforce", context: "View Sections" });
  if (!hasPerm) throw new Error("ليس لديك الصلاحية النظامية");

  const project = await prisma.workProject.findUnique({
    where: { id: workProjectId },
    include: { members: { where: { userId: user.id } } }
  });
  if (!project) throw new Error("المشروع غير موجود");

  const isSuperAdminUser = await isSuperAdmin(user.id);
  const isMember = project.members.some(m => m.userId === user.id);

  if (!isSuperAdminUser && !isMember) {
    throw new Error("يجب أن تكون عضواً في المشروع لعرض الأقسام");
  }

  const statusFilter = includeArchived ? undefined : "ACTIVE";

  const sections = await prisma.workProjectSection.findMany({
    where: {
      workProjectId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      manager: { select: { id: true, name: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      _count: {
        select: {
          tasks: true,
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Calculate task stats per section
  const sectionsWithStats = await Promise.all(sections.map(async (section) => {
    const taskStats = await prisma.task.groupBy({
      by: ['taskStatus'],
      where: { workProjectSectionId: section.id },
      _count: true,
    });

    let openTasks = 0;
    let completedTasks = 0;
    let cancelledTasks = 0;

    taskStats.forEach(stat => {
      if (stat.taskStatus === 'DONE') completedTasks += stat._count;
      else if (stat.taskStatus === 'CANCELLED') cancelledTasks += stat._count;
      else openTasks += stat._count;
    });

    const totalActive = openTasks + completedTasks;
    const progressPercentage = totalActive === 0 ? 0 : Math.round((completedTasks / totalActive) * 100);

    return {
      ...section,
      tasksCount: openTasks + completedTasks + cancelledTasks,
      completedTasksCount: completedTasks,
      cancelledTasksCount: cancelledTasks,
      progressPercentage
    };
  }));

  return sectionsWithStats;
}
