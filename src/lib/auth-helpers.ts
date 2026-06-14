import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!dbUser) return null;
  return dbUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/auth/login");
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/crm");
  }
  return user;
}

export function canAccess(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole);
}

// For Server Actions (Throws Error instead of Redirecting)
export async function actionRequireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    throw new Error("غير مصرح لك بإجراء هذه العملية أو الحساب معطل.");
  }
  return user;
}

export async function actionRequireRole(allowedRoles: string[]) {
  const user = await actionRequireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("عذراً، صلاحياتك لا تسمح بإجراء هذه العملية.");
  }
  return user;
}
