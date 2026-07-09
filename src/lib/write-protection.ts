import "server-only";
import { getImpersonationRuntimeContext } from "./impersonation-runtime-context";
import { logAuditEvent } from "./audit-logger";
import { getCurrentUser } from "./auth-helpers";

export async function enforceWriteProtection(actionName: string) {
  const context = await getImpersonationRuntimeContext();
  if (context !== null) {
    console.warn(`[IMPERSONATION WRITE BLOCKED] action: ${actionName}, mode: ${context.mode}`);
    
    try {
      const actorUser = await getCurrentUser();
      if (actorUser) {
        await logAuditEvent({
          action: "IMPERSONATION_WRITE_BLOCKED" as any, 
          actorUserId: actorUser.id,
          metadata: { action: actionName, mode: context.mode }
        });
      }
    } catch (error) {
      // لا نكسر العملية إذا فشل التسجيل الأمني
    }

    throw new Error("Write actions are blocked during impersonation.");
  }
}
