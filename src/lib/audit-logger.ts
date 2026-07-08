import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AuditEventInput {
  action: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  route?: string | null;
  method?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

/**
 * Logs an audit event to the database.
 * 
 * This function is designed to be fail-safe. It catches any errors during 
 * insertion and logs them to the console, ensuring that the primary business 
 * logic is not interrupted if logging fails.
 * 
 * It purposely does NOT use cookies(), headers(), or "server-only" imports 
 * to avoid Next.js Client/Server boundary conflicts when used inside Server Actions.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        route: input.route,
        method: input.method,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata === null ? Prisma.JsonNull : input.metadata,
      },
    });
  } catch (error) {
    // Fail-safe: log the error but do not throw, so the main operation doesn't crash
    console.error("[AuditLogger] Failed to log audit event:", error, "Input:", input);
  }
}
