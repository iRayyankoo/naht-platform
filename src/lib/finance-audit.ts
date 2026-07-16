import { PrismaClient, Prisma, FinanceActivityAction } from "@prisma/client";

/**
 * Defines the contract for Finance Audit logging.
 * This adapter allows passing a Prisma Transaction Client (tx) so that
 * audit logs are written atomically with the financial records.
 */
export interface FinanceAuditParams {
  actorId: string;
  impersonatorUserId?: string | null;
  action: FinanceActivityAction; 
  entityType: string; // e.g. "FinanceLedger", "FinanceAccount"
  entityId: string;
  correlationId: string;
  metadata?: Record<string, unknown>; // Limited safe metadata
}

export interface FinanceAuditWriter {
  log(tx: Prisma.TransactionClient, params: FinanceAuditParams): Promise<void>;
}

export class DefaultFinanceAuditWriter implements FinanceAuditWriter {
  async log(tx: Prisma.TransactionClient, params: FinanceAuditParams): Promise<void> {
    await tx.financeActivityLog.create({
      data: {
        actorId: params.actorId,
        
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        
        metadata: { ...(params.metadata || {}), correlationId: params.correlationId } as Prisma.InputJsonValue,
      },
    });
  }
}

export const auditWriter = new DefaultFinanceAuditWriter();
