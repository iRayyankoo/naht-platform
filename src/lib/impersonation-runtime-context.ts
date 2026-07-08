import "server-only";

import { cookies } from "next/headers";
import {
  IMPERSONATION_COOKIE_NAME,
  isImpersonationEnabled,
  verifyImpersonationCookieValue,
  ImpersonationMode,
} from "./impersonation-helpers";

export interface ExtendedImpersonationRuntimeContext {
  isActive: boolean;
  mode: ImpersonationMode;
  actorUserId: string;
  actorEmail?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  targetRoleKey?: string;
  issuedAt: number;
  expiresAt: number;
  expiresInSeconds: number;
  source: "cookie";
}

export async function getImpersonationRuntimeContext(): Promise<ExtendedImpersonationRuntimeContext | null> {
  // 1. Initial Flags & Safety Check
  if (!isImpersonationEnabled()) {
    return null;
  }

  if (process.env.VERCEL_ENV === "production") {
    return null;
  }

  // 2. Fetch Cookie safely
  const cookieStore = await cookies();
  const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE_NAME);

  if (!impersonationCookie || !impersonationCookie.value) {
    return null;
  }

  // 3. Verify Cookie
  const result = verifyImpersonationCookieValue(impersonationCookie.value);

  if (!result.valid) {
    if (result.reason === "expired") {
      console.warn("[IMPERSONATION CONTEXT] expired");
    } else {
      console.warn(`[IMPERSONATION CONTEXT] invalid_cookie: ${result.reason || "unknown"}`);
    }
    return null;
  }

  if (!result.payload) {
    return null;
  }

  const { payload } = result;

  // 4. Construct the runtime context
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = payload.expiresAt - now;
  
  return {
    isActive: true,
    mode: payload.mode,
    actorUserId: payload.actorUserId,
    targetRoleKey: payload.targetRoleKey,
    targetUserId: payload.targetUserId,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
    expiresInSeconds: expiresInSeconds > 0 ? expiresInSeconds : 0,
    source: "cookie",
  };
}
