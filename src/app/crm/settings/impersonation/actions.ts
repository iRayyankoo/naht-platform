"use server";

import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isSuperAdmin } from "@/lib/rbac-helpers";
import { prisma } from "@/lib/prisma";
import {
  isImpersonationEnabled,
  createImpersonationPayload,
  encodeSignedImpersonationPayload,
  getImpersonationCookieOptions,
  IMPERSONATION_COOKIE_NAME
} from "@/lib/impersonation-helpers";

async function validateCommonStartConditions() {
  if (!isImpersonationEnabled()) {
    throw new Error("ميزة التقمص غير مفعلة حالياً في هذا النظام.");
  }

  if (process.env.VERCEL_ENV === "production") {
    throw new Error("لا يمكن تفعيل ميزة التقمص في بيئة الإنتاج.");
  }

  if (!process.env.IMPERSONATION_COOKIE_SECRET) {
    throw new Error("المفتاح السري للتقمص غير متوفر.");
  }

  const actorUser = await getCurrentUser();
  if (!actorUser) {
    throw new Error("يجب تسجيل الدخول لإجراء هذه العملية.");
  }

  const isSuper = await isSuperAdmin(actorUser.id);
  if (!isSuper) {
    throw new Error("لا تملك الصلاحيات الكافية (SUPER_ADMIN) لبدء التقمص.");
  }

  return { actorUser, secret: process.env.IMPERSONATION_COOKIE_SECRET };
}

export async function startRoleImpersonationAction(roleKey: string) {
  const { actorUser, secret } = await validateCommonStartConditions();

  if (!roleKey) {
    throw new Error("يجب تحديد الدور المطلوب.");
  }

  const role = await prisma.appRole.findUnique({
    where: { code: roleKey },
  });

  if (!role || !role.isActive) {
    throw new Error("الدور المحدد غير موجود أو غير نشط.");
  }

  // Create payload
  const payload = createImpersonationPayload(
    "ROLE",
    actorUser.id,
    undefined,
    role.code
  );

  // Sign and encode
  const signedCookieValue = await encodeSignedImpersonationPayload(payload);
  if (!signedCookieValue) {
    throw new Error("فشل توقيع بيانات التقمص.");
  }

  // Write cookie
  const cookieOptions = getImpersonationCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE_NAME, signedCookieValue, cookieOptions);

  return { success: true };
}

export async function startUserImpersonationAction(userId: string) {
  const { actorUser, secret } = await validateCommonStartConditions();

  if (!userId) {
    throw new Error("يجب تحديد المستخدم المطلوب.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new Error("المستخدم المحدد غير موجود.");
  }

  if (!targetUser.isActive) {
    throw new Error("لا يمكن تقمص حساب مستخدم غير نشط.");
  }

  const isTargetSuper = await isSuperAdmin(targetUser.id);
  if (isTargetSuper) {
    throw new Error("لا يمكن تقمص حساب يملك صلاحيات SUPER_ADMIN.");
  }

  // Create payload
  const payload = createImpersonationPayload(
    "USER",
    actorUser.id,
    targetUser.id,
    undefined
  );

  // Note: userLabel isn't part of createImpersonationPayload args, we might need to update the interface or just skip it if it's not supported by the function signature.
  // Actually, the original signature doesn't take userLabel. We will ignore it for now.

  // Sign and encode
  const signedCookieValue = await encodeSignedImpersonationPayload(payload);
  if (!signedCookieValue) {
    throw new Error("فشل توقيع بيانات التقمص.");
  }

  // Write cookie
  const cookieOptions = getImpersonationCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE_NAME, signedCookieValue, cookieOptions);

  return { success: true };
}

export async function stopImpersonationAction() {
  // Safe stop, doesn't throw if not enabled, just clears the cookie
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE_NAME);
  return { success: true };
}
