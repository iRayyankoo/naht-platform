import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

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
    for (const ur of userRoles) {
      if (!ur.role.isActive) continue;
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.code);
      }
    }
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

// LOGGING MODE ONLY
export async function requirePermissionLogging(permissionCode: string, context: string) {
  const user = await getCurrentUser();
  if (!user) return true; // Auth middleware/helpers handle this

  // Anti-lockout
  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) return true;

    const hasPerm = await hasPermission(user.id, permissionCode);
    if (!hasPerm) {
      console.warn(`[RBAC LOG] Access Denied for User ${user.email} to ${context}. Missing permission: ${permissionCode}. Allowed via legacy ADMIN fallback.`);
    } else {
      console.info(`[RBAC LOG] Access Granted for User ${user.email} to ${context} via permission: ${permissionCode}.`);
    }
  } catch (err) {
    console.warn(`[RBAC LOG] Error checking permissions for user ${user.email}. Missing permission code: ${permissionCode}. Allowed via legacy ADMIN fallback.`, err);
  }
  
  // Always allow in logging mode (fallback to whatever requireRole did previously)
  return true;
}

export async function requireAnyPermissionLogging(permissionCodes: string[], context: string) {
  const user = await getCurrentUser();
  if (!user) return true;

  if (user.email === "nahtmkt@gmail.com") return true;

  try {
    const isSuper = await isSuperAdmin(user.id);
    if (isSuper) return true;

    const hasPerm = await hasAnyPermission(user.id, permissionCodes);
    if (!hasPerm) {
      console.warn(`[RBAC LOG] Access Denied for User ${user.email} to ${context}. Missing any of: ${permissionCodes.join(", ")}. Allowed via legacy ADMIN fallback.`);
    } else {
      console.info(`[RBAC LOG] Access Granted for User ${user.email} to ${context} via any of: ${permissionCodes.join(", ")}.`);
    }
  } catch (err) {
    console.warn(`[RBAC LOG] Error checking permissions for user ${user.email}. Missing any of: ${permissionCodes.join(", ")}. Allowed via legacy ADMIN fallback.`, err);
  }

  return true;
}
