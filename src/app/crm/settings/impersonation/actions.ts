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
import { logAuditEvent } from "@/lib/audit-logger";

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
  try {
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

    await logAuditEvent({
      action: "IMPERSONATION_START_ROLE",
      actorUserId: actorUser.id,
      metadata: { roleKey }
    });

    return { success: true };
  } catch (error: any) {
    let actorUserId: string | undefined;
    try {
      const actorUser = await getCurrentUser();
      actorUserId = actorUser?.id;
    } catch (e) {
      // ignore
    }

    await logAuditEvent({
      action: "IMPERSONATION_START_BLOCKED",
      actorUserId,
      metadata: { reason: error.message, roleKey }
    });

    throw error;
  }
}

export async function startUserImpersonationAction(userId: string) {
  try {
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

    // Sign and encode
    const signedCookieValue = await encodeSignedImpersonationPayload(payload);
    if (!signedCookieValue) {
      throw new Error("فشل توقيع بيانات التقمص.");
    }

    // Write cookie
    const cookieOptions = getImpersonationCookieOptions();
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE_NAME, signedCookieValue, cookieOptions);

    await logAuditEvent({
      action: "IMPERSONATION_START_USER",
      actorUserId: actorUser.id,
      targetUserId: targetUser.id
    });

    return { success: true };
  } catch (error: any) {
    let actorUserId: string | undefined;
    try {
      const actorUser = await getCurrentUser();
      actorUserId = actorUser?.id;
    } catch (e) {
      // ignore
    }

    await logAuditEvent({
      action: "IMPERSONATION_START_BLOCKED",
      actorUserId,
      metadata: { reason: error.message, targetUserId: userId }
    });

    throw error;
  }
}

export async function stopImpersonationAction() {
  try {
    const cookieStore = await cookies();
    const cookieOptions = getImpersonationCookieOptions();
    
    // Explicitly overwrite the cookie with maxAge: 0 to ensure deletion across all browsers
    cookieStore.set(IMPERSONATION_COOKIE_NAME, "", {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    // Legacy cleanup: Also delete the cookie from the old path "/crm"
    cookieStore.set(IMPERSONATION_COOKIE_NAME, "", {
      ...cookieOptions,
      path: "/crm",
      maxAge: 0,
      expires: new Date(0),
    });

    let actorUserId: string | undefined;
    try {
      const actorUser = await getCurrentUser();
      actorUserId = actorUser?.id;
    } catch (e) {
      // ignore
    }

    await logAuditEvent({
      action: "IMPERSONATION_STOP",
      actorUserId
    });

    return { success: true };
  } catch (error: any) {
    let actorUserId: string | undefined;
    try {
      const actorUser = await getCurrentUser();
      actorUserId = actorUser?.id;
    } catch (e) {
      // ignore
    }

    await logAuditEvent({
      action: "IMPERSONATION_STOP_FAILED",
      actorUserId,
      metadata: { reason: error.message }
    });

    throw error;
  }
}
