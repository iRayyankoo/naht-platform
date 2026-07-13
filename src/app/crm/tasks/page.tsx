import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { checkPermission, isSuperAdmin } from "@/lib/rbac-helpers";
import { TasksClientWrapper } from "./TasksClientWrapper";
import { TaskDTO, WorkProjectDTO, ClientPermissions, TaskStatus, TaskPriority, ApprovalStatus, WorkProjectStatus, WorkProjectMemberRole, UserDTO } from "./types";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
     return <div className="p-8 text-center">الرجاء تسجيل الدخول</div>;
  }

  // 1. Check Permissions
  const canViewTasks = await checkPermission("tasks.view", "View Tasks");
  const canViewProjects = await checkPermission("work_projects.view", "View Work Projects");

  if (!canViewTasks && !canViewProjects) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-red-600 mb-2">ليس لديك صلاحية لعرض المهام ومشاريع العمل</h3>
      </div>
    );
  }

  const [
    canCreateTasks,
    canEditTasks,
    canApproveTasks,
    canCreateWorkProjects,
    canEditWorkProjects,
    canDeleteTasks,
    canDeleteWorkProjects,
    isSuper
  ] = await Promise.all([
    checkPermission("tasks.create"),
    checkPermission("tasks.edit"),
    checkPermission("tasks.approve"),
    checkPermission("work_projects.create"),
    checkPermission("work_projects.edit"),
    checkPermission("tasks.delete"),
    checkPermission("work_projects.delete"),
    isSuperAdmin(user.id)
  ]);

  const permissions: ClientPermissions = {
    canViewTasks,
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canApproveTasks,
    canViewWorkProjects: canViewProjects,
    canCreateWorkProjects,
    canEditWorkProjects,
    canDeleteWorkProjects,
    isSuperAdmin: isSuper
  };

  // 2. Fetch Tasks Data
  const rawTasks = canViewTasks ? await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      designatedApprover: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      },
      activityLogs: {
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      },
      approvals: {
        include: { approver: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      },
      attachments: true
    }
  }) : [];

  function mapUser(u: { id: string, name?: string | null, image?: string | null } | null | undefined): UserDTO | null {
    if (!u) return null;
    return {
      id: u.id,
      name: u.name || "مستخدم غير معروف",
      image: u.image || undefined
    };
  }

  // Map Tasks to DTO
  const initialTasks: TaskDTO[] = rawTasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    taskStatus: t.taskStatus as TaskStatus,
    priority: t.priority as TaskPriority,
    dueDate: t.dueDate?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    workProjectId: t.workProjectId,
    assignedToId: t.assignedToId,
    assignedTo: mapUser(t.assignedTo),
    createdBy: mapUser(t.createdBy) as UserDTO,
    requiresApproval: t.requiresApproval,
    approvalStatus: t.approvalStatus as ApprovalStatus,
    approvalRound: t.approvalRound,
    designatedApproverId: t.designatedApproverId,
    designatedApprover: mapUser(t.designatedApprover),
    comments: t.comments.map(c => ({
      id: c.id,
      content: c.comment,
      createdAt: c.createdAt.toISOString(),
      author: mapUser(c.user) as UserDTO
    })),
    activityLogs: t.activityLogs.map(l => ({
      id: l.id,
      action: l.eventType,
      details: l.metadata ? JSON.stringify(l.metadata) : null,
      createdAt: l.createdAt.toISOString(),
      actor: mapUser(l.actor) as UserDTO
    })),
    approvals: t.approvals.map(a => ({
      id: a.id,
      approverId: a.approverId || "",
      status: a.status as ApprovalStatus,
      comment: a.decisionComment || null,
      createdAt: a.createdAt.toISOString(),
      round: a.approvalRound,
      approver: mapUser(a.approver) as UserDTO
    }))
  }));

  // 3. Fetch Work Projects Data
  const rawProjects = canViewProjects ? await prisma.workProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      _count: { select: { tasks: true } },
      tasks: {
        select: { taskStatus: true }
      }
    }
  }) : [];

  // Map Projects to DTO
  const initialProjects: WorkProjectDTO[] = rawProjects.map(p => {
    const totalTasks = p._count.tasks;
    const completedTasks = p.tasks.filter(t => t.taskStatus === 'DONE').length;
    const cancelledTasks = p.tasks.filter(t => t.taskStatus === 'CANCELLED').length;

    // Cancelled tasks do not count towards progress
    const validTasks = totalTasks - cancelledTasks;
    const progress = validTasks > 0 ? Math.round((completedTasks / validTasks) * 100) : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description || null,
      status: p.status as WorkProjectStatus,
      startDate: p.startDate?.toISOString() || null,
      endDate: p.endDate?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      members: p.members.map(m => ({
        id: m.id,
        role: m.role as WorkProjectMemberRole,
        user: mapUser(m.user) as UserDTO
      })),
      totalTasks,
      completedTasks,
      progress
    };
  });

  // Fetch all active users for dropdowns
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true }
  });

  return (
    <TasksClientWrapper
      initialTasks={initialTasks}
      initialProjects={initialProjects}
      permissions={permissions}
      users={allUsers.map(u => ({ id: u.id, name: u.name || "مستخدم غير معروف" }))}
    />
  );
}
