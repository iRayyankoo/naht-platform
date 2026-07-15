import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Defines the contract for Finance Audit logging.
 * This adapter allows passing a Prisma Transaction Client (tx) so that
 * audit logs are written atomically with the financial records.
 */
export interface FinanceAuditParams {
  actorUserId: string;
  impersonatorUserId?: string | null;
  action: string; // e.g. "JOURNAL_POSTED", "LEDGER_CREATED"
  entityType: string; // e.g. "FinanceJournalEntry", "FinanceLedger"
  entityId: string;
  correlationId: string;
  metadata?: Record<string, unknown>; // Limited safe metadata (no full journal lines or sensitive amounts unless masked)
}

export interface FinanceAuditWriter {
  log(tx: Prisma.TransactionClient, params: FinanceAuditParams): Promise<void>;
}
