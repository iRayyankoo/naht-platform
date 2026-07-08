import * as crypto from "crypto";

export const IMPERSONATION_COOKIE_NAME = "naht_impersonation";

export type ImpersonationMode = "ROLE" | "USER";

export interface ImpersonationCookiePayload {
  mode: ImpersonationMode;
  actorUserId: string;
  targetUserId?: string;
  targetRoleKey?: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export interface ImpersonationCookieResult {
  valid: boolean;
  reason?: string;
  payload?: ImpersonationCookiePayload;
}

export function isImpersonationEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.IMPERSONATION_ENABLED === "true";
}

export function getImpersonationCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/crm",
    maxAge: 60 * 60, // 1 hour
  };
}

export function createImpersonationPayload(
  mode: ImpersonationMode,
  actorUserId: string,
  targetUserId?: string,
  targetRoleKey?: string
): ImpersonationCookiePayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    mode,
    actorUserId,
    targetUserId,
    targetRoleKey,
    issuedAt: now,
    expiresAt: now + 60 * 60, // 1 hour validity
    nonce: crypto.randomBytes(16).toString("hex"),
  };
}

export function validateImpersonationPayloadShape(payload: any): ImpersonationCookieResult {
  if (!payload || typeof payload !== "object") {
    return { valid: false, reason: "invalid_shape" };
  }
  
  if (payload.mode !== "ROLE" && payload.mode !== "USER") {
    return { valid: false, reason: "invalid_mode" };
  }
  
  if (!payload.actorUserId || typeof payload.actorUserId !== "string") {
    return { valid: false, reason: "missing_actor_user_id" };
  }
  
  if (payload.mode === "USER" && (!payload.targetUserId || typeof payload.targetUserId !== "string")) {
    return { valid: false, reason: "missing_target_user_id" };
  }
  
  if (payload.mode === "ROLE" && (!payload.targetRoleKey || typeof payload.targetRoleKey !== "string")) {
    return { valid: false, reason: "missing_target_role_key" };
  }
  
  if (typeof payload.issuedAt !== "number" || typeof payload.expiresAt !== "number") {
    return { valid: false, reason: "invalid_timestamps" };
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (payload.expiresAt <= now) {
    return { valid: false, reason: "expired" };
  }
  
  if (!payload.nonce || typeof payload.nonce !== "string") {
    return { valid: false, reason: "missing_nonce" };
  }
  
  return { valid: true, payload: payload as ImpersonationCookiePayload };
}

export function encodeSignedImpersonationPayload(payload: ImpersonationCookiePayload): string | null {
  const secret = process.env.IMPERSONATION_COOKIE_SECRET;
  if (!secret) return null;
  
  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString("base64url");
  
  const signature = crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
  
  return `${payloadBase64}.${signature}`;
}

export function decodeSignedImpersonationPayload(cookieValue: string): string | null {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  return parts[0];
}

export function verifyImpersonationCookieValue(cookieValue: string): ImpersonationCookieResult {
  const secret = process.env.IMPERSONATION_COOKIE_SECRET;
  if (!secret) {
    return { valid: false, reason: "missing_secret" };
  }
  
  if (!cookieValue || typeof cookieValue !== "string") {
    return { valid: false, reason: "invalid_cookie_format" };
  }
  
  const parts = cookieValue.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed_cookie" };
  }
  
  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
  
  if (providedSignature !== expectedSignature) {
    return { valid: false, reason: "invalid_signature" };
  }
  
  let payloadObject;
  try {
    const payloadString = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    payloadObject = JSON.parse(payloadString);
  } catch (e) {
    return { valid: false, reason: "invalid_json" };
  }
  
  return validateImpersonationPayloadShape(payloadObject);
}

// Keeping these placeholders for now if used by other components
export interface ImpersonationState {
  isActive: boolean;
  type: "ROLE" | "USER" | null;
  targetId: string | null;
  targetName: string | null;
}

export async function getImpersonationState(): Promise<ImpersonationState> {
  return {
    isActive: false,
    type: null,
    targetId: null,
    targetName: null
  };
}
