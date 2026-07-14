"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireScopedPermission, getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Input Validation Schemas
const assignMemberSchema = z.object({
  departmentId: z.string(),
  userId: z.string(),
  isPrimary: z.boolean().default(false),
  membershipRole: z.enum(["MEMBER", "OBSERVER"]).default("MEMBER"),
});

const transferMemberSchema = z.object({
  userId: z.string(),
  newDepartmentId: z.string(),
  membershipRole: z.enum(["MEMBER", "OBSERVER"]).default("MEMBER"),
});

const setPrimaryDepartmentSchema = z.object({
  userId: z.string(),
  departmentId: z.string(),
});

const updateRoleSchema = z.object({
  userId: z.string(),
  departmentId: z.string(),
  membershipRole: z.enum(["MEMBER", "OBSERVER"]),
});

const endMembershipSchema = z.object({
  userId: z.string(),
  departmentId: z.string(),
});

const assignManagerSchema = z.object({
  departmentId: z.string(),
  managerId: z.string(),
});

const removeManagerSchema = z.object({
  departmentId: z.string(),
});

// Helper for generic transaction retry
async function executeWithRetry<T>(
  actionName: string,
  fn: (tx: Prisma.TransactionClient, timestamp: Date) => Promise<T>,
  retries = 3
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const timestamp = new Date();
      return await prisma.$transaction(
        async (tx) => {
          return await fn(tx, timestamp);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < retries - 1) {
        attempt++;
        await new Promise(r => setTimeout(r, Math.random() * 50 * attempt));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`[${actionName}] Failed after ${retries} attempts due to write conflicts.`);
}

export async function getDepartmentsWithMembers() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.departments.view") || new Set();

  if (!isSuper && !scopes.has("COMPANY") && !scopes.has("DEPARTMENT")) {
    throw new Error("Access Denied");
  }

  const whereClause: Prisma.DepartmentWhereInput = {};
  if (!isSuper && !scopes.has("COMPANY") && scopes.has("DEPARTMENT")) {
    whereClause.members = {
      some: {
        userId: user.id,
        status: "ACTIVE",
        effectiveTo: null
      }
    };
  }

  return prisma.department.findMany({
    where: whereClause,
    include: {
      members: {
        where: { status: "ACTIVE", effectiveTo: null },
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });
}

export async function getUserDepartmentMemberships(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.members.view") || new Set();

  let allowed = isSuper || scopes.has("COMPANY");
  if (!allowed && scopes.has("SELF") && targetUserId === user.id) {
    allowed = true;
  }
  if (!allowed && scopes.has("DEPARTMENT")) {
    const shared = await prisma.departmentMember.findFirst({
      where: {
        status: "ACTIVE", effectiveTo: null,
        userId: targetUserId,
        department: {
          members: {
            some: { userId: user.id, status: "ACTIVE", effectiveTo: null }
          }
        }
      }
    });
    if (shared) allowed = true;
  }

  if (!allowed) throw new Error("Access Denied");

  return prisma.departmentMember.findMany({
    where: { userId: targetUserId, status: "ACTIVE", effectiveTo: null },
    include: { department: true },
    orderBy: { isPrimary: 'desc' }
  });
}

export async function assignDepartmentMember(data: z.infer<typeof assignMemberSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = assignMemberSchema.parse(data);

  if (validated.isPrimary && validated.membershipRole === "OBSERVER") {
    throw new Error("OBSERVER cannot be the primary department");
  }

  const hasAccess = await requireScopedPermission("org.members.assign", { targetDepartmentId: validated.departmentId }, { mode: "enforce", context: "assignDepartmentMember" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("assignDepartmentMember", async (tx, timestamp) => {
    const existing = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, departmentId: validated.departmentId, status: "ACTIVE", effectiveTo: null }
    });
    if (existing) throw new Error("User is already an active member of this department");

    if (validated.isPrimary) {
      const currentPrimary = await tx.departmentMember.findFirst({
        where: { userId: validated.userId, isPrimary: true, status: "ACTIVE", effectiveTo: null }
      });
      if (currentPrimary) {
        throw new Error("User already has a primary department. Use transfer instead.");
      }
    }

    const membership = await tx.departmentMember.create({
      data: {
        userId: validated.userId,
        departmentId: validated.departmentId,
        isPrimary: validated.isPrimary,
        membershipRole: validated.membershipRole,
        status: "ACTIVE",
        source: "MANUAL",
        effectiveFrom: timestamp
      }
    });

    if (validated.isPrimary) {
      await tx.user.update({
        where: { id: validated.userId },
        data: { departmentId: validated.departmentId }
      });
    }

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MEMBER_ASSIGNED",
        departmentId: validated.departmentId,
        targetUserId: validated.userId,
        newValues: { isPrimary: validated.isPrimary, role: validated.membershipRole } as Prisma.InputJsonValue,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return membership;
  });
}

export async function transferDepartmentMember(data: z.infer<typeof transferMemberSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = transferMemberSchema.parse(data);

  if (validated.membershipRole === "OBSERVER") {
    throw new Error("Cannot transfer primary to OBSERVER role");
  }

  const hasAccess = await requireScopedPermission("org.members.transfer", { targetUserId: validated.userId }, { mode: "enforce", context: "transferDepartmentMember" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("transferDepartmentMember", async (tx, timestamp) => {
    const currentPrimary = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, isPrimary: true, status: "ACTIVE", effectiveTo: null }
    });

    if (!currentPrimary) {
      throw new Error("User does not have an active primary department to transfer from.");
    }

    if (currentPrimary.departmentId === validated.newDepartmentId) {
      throw new Error("User is already in this department as primary.");
    }

    const updated = await tx.departmentMember.updateMany({
      where: { id: currentPrimary.id, status: "ACTIVE", effectiveTo: null },
      data: { status: "TRANSFERRED", effectiveTo: timestamp }
    });
    if (updated.count !== 1) throw new Error("Failed to safely close current primary membership.");

    const existingSecondary = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, departmentId: validated.newDepartmentId, status: "ACTIVE", effectiveTo: null }
    });
    if (existingSecondary) {
      await tx.departmentMember.updateMany({
        where: { id: existingSecondary.id, status: "ACTIVE", effectiveTo: null },
        data: { status: "TRANSFERRED", effectiveTo: timestamp }
      });
    }

    const newMembership = await tx.departmentMember.create({
      data: {
        userId: validated.userId,
        departmentId: validated.newDepartmentId,
        isPrimary: true,
        membershipRole: validated.membershipRole,
        status: "ACTIVE",
        source: "MANUAL",
        effectiveFrom: timestamp
      }
    });

    await tx.user.update({
      where: { id: validated.userId },
      data: { departmentId: validated.newDepartmentId }
    });

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MEMBER_TRANSFERRED",
        departmentId: validated.newDepartmentId,
        targetUserId: validated.userId,
        oldValues: { previousDepartmentId: currentPrimary.departmentId } as Prisma.InputJsonValue,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return newMembership;
  });
}

export async function setPrimaryDepartment(data: z.infer<typeof setPrimaryDepartmentSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = setPrimaryDepartmentSchema.parse(data);
  const hasAccess = await requireScopedPermission("org.members.transfer", { targetUserId: validated.userId }, { mode: "enforce", context: "setPrimaryDepartment" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("setPrimaryDepartment", async (tx, timestamp) => {
    const targetMembership = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, departmentId: validated.departmentId, status: "ACTIVE", effectiveTo: null }
    });

    if (!targetMembership) {
      throw new Error("User must be an active member of the target department first.");
    }
    if (targetMembership.isPrimary) {
      throw new Error("This is already the primary department.");
    }
    if (targetMembership.membershipRole === "OBSERVER") {
      throw new Error("OBSERVER cannot be made primary.");
    }

    const currentPrimary = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, isPrimary: true, status: "ACTIVE", effectiveTo: null }
    });

    if (currentPrimary) {
      const cleared = await tx.departmentMember.updateMany({
        where: { id: currentPrimary.id, status: "ACTIVE", effectiveTo: null },
        data: { isPrimary: false }
      });
      if (cleared.count !== 1) throw new Error("Failed to clear current primary.");
    }

    const updated = await tx.departmentMember.updateMany({
      where: { id: targetMembership.id, status: "ACTIVE", effectiveTo: null },
      data: { isPrimary: true }
    });
    if (updated.count !== 1) throw new Error("Failed to set new primary.");

    await tx.user.update({
      where: { id: validated.userId },
      data: { departmentId: validated.departmentId }
    });

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "PRIMARY_DEPARTMENT_CHANGED",
        departmentId: validated.departmentId,
        targetUserId: validated.userId,
        oldValues: currentPrimary ? { previousPrimaryDept: currentPrimary.departmentId } as Prisma.InputJsonValue : Prisma.DbNull,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return true;
  });
}

export async function endDepartmentMembership(data: z.infer<typeof endMembershipSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = endMembershipSchema.parse(data);
  const hasAccess = await requireScopedPermission("org.members.end", { targetUserId: validated.userId }, { mode: "enforce", context: "endDepartmentMembership" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("endDepartmentMembership", async (tx, timestamp) => {
    const dept = await tx.department.findUnique({ where: { id: validated.departmentId } });
    if (dept && dept.managerId === validated.userId) {
      throw new Error("Cannot end membership of the active department manager. Reassign manager first.");
    }

    const membership = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, departmentId: validated.departmentId, status: "ACTIVE", effectiveTo: null }
    });
    if (!membership) throw new Error("Membership not found or already inactive.");
    if (membership.isPrimary) {
      throw new Error("Cannot directly end a primary membership. Transfer the employee first.");
    }

    const updated = await tx.departmentMember.updateMany({
      where: { id: membership.id, status: "ACTIVE", effectiveTo: null },
      data: { status: "INACTIVE", effectiveTo: timestamp }
    });
    if (updated.count !== 1) throw new Error("Failed to end membership safely.");

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MEMBER_ENDED",
        departmentId: validated.departmentId,
        targetUserId: validated.userId,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return true;
  });
}

export async function updateDepartmentMembershipRole(data: z.infer<typeof updateRoleSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = updateRoleSchema.parse(data);
  const hasAccess = await requireScopedPermission("org.departments.manage", { targetUserId: validated.userId }, { mode: "enforce", context: "updateDepartmentMembershipRole" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("updateDepartmentMembershipRole", async (tx, timestamp) => {
    const membership = await tx.departmentMember.findFirst({
      where: { userId: validated.userId, departmentId: validated.departmentId, status: "ACTIVE", effectiveTo: null }
    });
    if (!membership) throw new Error("Membership not found.");
    if (membership.isPrimary && validated.membershipRole === "OBSERVER") {
      throw new Error("Primary membership cannot be downgraded to OBSERVER.");
    }

    const updated = await tx.departmentMember.updateMany({
      where: { id: membership.id, status: "ACTIVE", effectiveTo: null },
      data: { membershipRole: validated.membershipRole }
    });
    if (updated.count !== 1) throw new Error("Failed to update role safely.");

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MEMBER_ROLE_CHANGED",
        departmentId: validated.departmentId,
        targetUserId: validated.userId,
        oldValues: { role: membership.membershipRole } as Prisma.InputJsonValue,
        newValues: { role: validated.membershipRole } as Prisma.InputJsonValue,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return true;
  });
}

export async function assignDepartmentManager(data: z.infer<typeof assignManagerSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = assignManagerSchema.parse(data);
  const hasAccess = await requireScopedPermission("org.department_manager.assign", { targetDepartmentId: validated.departmentId }, { mode: "enforce", context: "assignDepartmentManager" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("assignDepartmentManager", async (tx, timestamp) => {
    const membership = await tx.departmentMember.findFirst({
      where: { userId: validated.managerId, departmentId: validated.departmentId, status: "ACTIVE", effectiveTo: null }
    });
    if (!membership || membership.membershipRole === "OBSERVER") {
      throw new Error("Manager must be an active MEMBER of the department.");
    }

    const dept = await tx.department.findUnique({ where: { id: validated.departmentId } });
    if (!dept) throw new Error("Department not found");

    if (dept.managerId === validated.managerId) {
      throw new Error("User is already the manager of this department.");
    }

    const updated = await tx.department.updateMany({
      where: { id: validated.departmentId },
      data: { managerId: validated.managerId }
    });
    if (updated.count !== 1) throw new Error("Failed to assign manager.");

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MANAGER_ASSIGNED",
        departmentId: validated.departmentId,
        targetUserId: validated.managerId,
        oldValues: { previousManagerId: dept.managerId } as Prisma.InputJsonValue,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return true;
  });
}

export async function removeDepartmentManager(data: z.infer<typeof removeManagerSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = removeManagerSchema.parse(data);
  const hasAccess = await requireScopedPermission("org.department_manager.assign", { targetDepartmentId: validated.departmentId }, { mode: "enforce", context: "removeDepartmentManager" });
  if (!hasAccess) throw new Error("Access Denied");

  return executeWithRetry("removeDepartmentManager", async (tx, timestamp) => {
    const dept = await tx.department.findUnique({ where: { id: validated.departmentId } });
    if (!dept) throw new Error("Department not found");
    if (!dept.managerId) throw new Error("Department does not have a manager currently.");

    const updated = await tx.department.updateMany({
      where: { id: validated.departmentId, managerId: dept.managerId },
      data: { managerId: null }
    });
    if (updated.count !== 1) throw new Error("Failed to remove manager safely.");

    await tx.organizationActivityLog.create({
      data: {
        actorId: user.id,
        action: "MANAGER_REMOVED",
        departmentId: validated.departmentId,
        oldValues: { previousManagerId: dept.managerId } as Prisma.InputJsonValue,
        createdAt: timestamp,
        reason: await isSuperAdmin(user.id) ? "isSuperAdminOverride: true" : undefined
      }
    });

    return true;
  });
}

const getDeptDetailsSchema = z.object({ departmentId: z.string().min(1) });
export async function getDepartmentDetails(departmentIdRaw: string) {
  const { departmentId } = getDeptDetailsSchema.parse({ departmentId: departmentIdRaw });
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.departments.view") || new Set();

  let allowed = isSuper || scopes.has("COMPANY");
  if (!allowed && scopes.has("DEPARTMENT")) {
    const deptCheck = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { managerId: true }
    });
    if (deptCheck?.managerId === user.id) allowed = true;
  }

  if (!allowed) throw new Error("Access Denied");

  const dept = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      members: {
        where: { status: "ACTIVE", effectiveTo: null },
        include: { user: { select: { id: true, name: true, email: true, status: true } } },
        orderBy: [{ isPrimary: 'desc' }, { effectiveFrom: 'desc' }]
      }
    }
  });

  if (!dept) return null;

  let manager = null;
  if (dept.managerId) {
    manager = await prisma.user.findUnique({
      where: { id: dept.managerId },
      select: { id: true, name: true, email: true }
    });
  }

  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    manager,
    members: dept.members.map(m => ({
      id: m.id,
      membershipRole: m.membershipRole,
      isPrimary: m.isPrimary,
      effectiveFrom: m.effectiveFrom,
      user: m.user
    }))
  };
}

const getHistorySchema = z.object({ targetUserId: z.string().min(1) });
export async function getUserMembershipHistory(targetUserIdRaw: string) {
  const { targetUserId } = getHistorySchema.parse({ targetUserId: targetUserIdRaw });
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.members.view") || new Set();

  let allowed = isSuper || scopes.has("COMPANY");
  if (!allowed && scopes.has("SELF") && targetUserId === user.id) allowed = true;
  if (!allowed && scopes.has("DEPARTMENT")) {
    const shared = await prisma.departmentMember.findFirst({
      where: {
        status: "ACTIVE", effectiveTo: null,
        userId: targetUserId,
        department: { managerId: user.id }
      }
    });
    if (shared) allowed = true;
  }

  if (!allowed) throw new Error("Access Denied");

  const history = await prisma.departmentMember.findMany({
    where: { userId: targetUserId },
    include: { department: { select: { id: true, name: true } } },
    orderBy: { effectiveFrom: 'desc' }
  });

  return history.map(h => ({
    id: h.id,
    departmentId: h.departmentId,
    departmentName: h.department.name,
    membershipRole: h.membershipRole,
    isPrimary: h.isPrimary,
    status: h.status,
    effectiveFrom: h.effectiveFrom,
    effectiveTo: h.effectiveTo
  }));
}

const assignableUsersSchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).default("")
});
export async function getAssignableUsers(departmentIdRaw: string, pageRaw = 1, limitRaw = 10, searchRaw = "") {
  const { departmentId, page, limit, search } = assignableUsersSchema.parse({
    departmentId: departmentIdRaw,
    page: pageRaw,
    limit: limitRaw,
    search: searchRaw
  });

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.members.view") || new Set();

  const allowed = isSuper || scopes.has("COMPANY");
  // Request 1: "أزل فرع DEPARTMENT من getAssignableUsers... متاحاً فقط لـ SUPER_ADMIN أو COMPANY"
  if (!allowed) throw new Error("Access Denied: Only COMPANY or SUPER_ADMIN can assign candidates.");

  const skip = (page - 1) * limit;

  // Base query: Only completely active accounts
  const whereClause: Prisma.UserWhereInput = {
    isActive: true,
    status: "ACTIVE",
    departmentMembers: {
      none: { departmentId, status: "ACTIVE", effectiveTo: null } // Exclude current active members of THIS department
    }
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      // Returning email to disambiguate similar names, as requested by documentation
      select: { id: true, name: true, jobTitle: true, email: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
  ]);

  return { total, users, pages: Math.ceil(total / limit) };
}

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).default("")
});

export async function getOrganizationOverview() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const orgViewScopes = scopedPerms.get("org.departments.view") || new Set();
  const membersViewScopes = scopedPerms.get("org.members.view") || new Set();

  const isCompany = isSuper || orgViewScopes.has("COMPANY") || membersViewScopes.has("COMPANY");
  const isDepartment = !isCompany && (orgViewScopes.has("DEPARTMENT") || membersViewScopes.has("DEPARTMENT"));

  if (!isCompany && !isDepartment) {
    return {
      totalDepartments: 0,
      activeMembers: 0,
      unassignedMembers: 0,
      departmentsWithoutManager: 0
    };
  }

  let totalDepartments = 0;
  let activeMembers = 0;
  let unassignedMembers = 0;
  let departmentsWithoutManager = 0;

  if (isCompany) {
    totalDepartments = await prisma.department.count();
    activeMembers = await prisma.departmentMember.count({
      where: { status: "ACTIVE", effectiveTo: null }
    });
    const allActiveUsers = await prisma.user.count({
      where: { isActive: true, status: "ACTIVE" }
    });
    const usersWithDepts = await prisma.user.count({
      where: {
        isActive: true, status: "ACTIVE",
        departmentMembers: { some: { status: "ACTIVE", effectiveTo: null } }
      }
    });
    unassignedMembers = allActiveUsers - usersWithDepts;
    departmentsWithoutManager = await prisma.department.count({
      where: { managerId: null }
    });
  } else {
    // DEPARTMENT scope
    const myDepts = await prisma.department.findMany({
      where: { managerId: user.id },
      select: { id: true }
    });
    const deptIds = myDepts.map(d => d.id);
    totalDepartments = deptIds.length;

    if (totalDepartments > 0) {
      activeMembers = await prisma.departmentMember.count({
        where: { departmentId: { in: deptIds }, status: "ACTIVE", effectiveTo: null }
      });
    }
  }

  return { totalDepartments, activeMembers, unassignedMembers, departmentsWithoutManager };
}

export async function getOrganizationDepartments(pageRaw = 1, limitRaw = 10, searchRaw = "") {
  const { page, limit, search } = paginationSchema.parse({ page: pageRaw, limit: limitRaw, search: searchRaw });
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.departments.view") || new Set();

  const isCompany = isSuper || scopes.has("COMPANY");
  const isDepartment = !isCompany && scopes.has("DEPARTMENT");

  if (!isCompany && !isDepartment) throw new Error("Access Denied");

  const skip = (page - 1) * limit;
  const whereClause: Prisma.DepartmentWhereInput = {};

  if (isDepartment) {
    whereClause.managerId = user.id;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } }
    ];
  }

  const [total, departmentsRaw] = await Promise.all([
    prisma.department.count({ where: whereClause }),
    prisma.department.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: { where: { status: "ACTIVE", effectiveTo: null } } }
        }
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
  ]);

  const managerIds = departmentsRaw.map(d => d.managerId).filter(Boolean) as string[];
  const managers = await prisma.user.findMany({
    where: { id: { in: managerIds } },
    select: { id: true, name: true }
  });
  const managerMap = new Map(managers.map(m => [m.id, m]));

  return {
    total,
    pages: Math.ceil(total / limit),
    departments: departmentsRaw.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      manager: d.managerId ? managerMap.get(d.managerId) || null : null,
      membersCount: d._count.members
    }))
  };
}

export async function getOrganizationMembers(pageRaw = 1, limitRaw = 10, searchRaw = "") {
  const { page, limit, search } = paginationSchema.parse({ page: pageRaw, limit: limitRaw, search: searchRaw });
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const scopes = scopedPerms.get("org.members.view") || new Set();

  const isCompany = isSuper || scopes.has("COMPANY");
  const isDepartment = !isCompany && scopes.has("DEPARTMENT");

  if (!isCompany && !isDepartment) throw new Error("Access Denied");

  const skip = (page - 1) * limit;
  const whereClause: Prisma.UserWhereInput = {
    isActive: true,
    status: "ACTIVE"
  };

  if (isDepartment) {
    const myDepts = await prisma.department.findMany({
      where: { managerId: user.id },
      select: { id: true }
    });
    const deptIds = myDepts.map(d => d.id);
    if (deptIds.length === 0) return { total: 0, pages: 0, members: [] };

    whereClause.departmentMembers = {
      some: { departmentId: { in: deptIds }, status: "ACTIVE", effectiveTo: null }
    };
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        departmentMembers: {
          where: { status: "ACTIVE", effectiveTo: null },
          include: { department: { select: { id: true, name: true } } },
          orderBy: { isPrimary: 'desc' }
        }
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
  ]);

  return {
    total,
    pages: Math.ceil(total / limit),
    members: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      memberships: u.departmentMembers.map(m => ({
        id: m.id,
        departmentId: m.departmentId,
        departmentName: m.department.name,
        isPrimary: m.isPrimary,
        role: m.membershipRole
      }))
    }))
  };
}