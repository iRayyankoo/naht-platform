import { PrismaClient, FinanceJournalEntry, FinanceJournalLine, Prisma, FinanceJournalStatus } from "@prisma/client";
import { requireFinanceServicePermission } from "@/lib/finance-auth";
import { FinanceDomainError } from "@/lib/finance-errors";
import { auditWriter } from "@/lib/finance-audit";
import { FinanceActionContext } from "@/lib/finance-context";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";

const prisma = new PrismaClient();

export type CreateDraftInput = {
  ledgerId: string;
  fiscalPeriodId: string;
  entryDate: Date;
  currencyId: string;
  exchangeRate?: string | Prisma.Decimal;
  description: string;
  reference?: string;
  idempotencyKey?: string;
};

export type AddLineInput = {
  accountId: string;
  debitAmount: string | Prisma.Decimal;
  creditAmount: string | Prisma.Decimal;
  description?: string;
};

// Internal helper for SoD Check
function verifySoD(context: FinanceActionContext, createdById: string) {
  if (!context.actorId) throw new FinanceDomainError("F_VALIDATION_ERROR", "actorId is required");
  if (!context.correlationId) throw new FinanceDomainError("F_VALIDATION_ERROR", "correlationId is required");
  if (context.actorId === createdById || context.impersonatorId === createdById) {
    throw new FinanceDomainError("F_SOD_VIOLATION", "Creator cannot perform this action on their own journal (Impersonation checked)");
  }
}

// Internal helper for Context Check
function verifyContext(context: FinanceActionContext) {
  if (!context.actorId) throw new FinanceDomainError("F_VALIDATION_ERROR", "actorId is required");
  if (!context.correlationId) throw new FinanceDomainError("F_VALIDATION_ERROR", "correlationId is required");
}

function checkDbError(e: unknown): never {
  if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "55P03") {
    throw new FinanceDomainError("F_LOCK_TIMEOUT", "Timeout locking resource");
  }
  throw e;
}


async function verifyPeriodIsOpen(tx: Prisma.TransactionClient, periodId: string) {
  const periods = await tx.$queryRaw<{id: string, status: string}[]>`
    SELECT p.id, p.status
    FROM "FinanceFiscalPeriod" p
    WHERE p.id = ${periodId}
    FOR SHARE
  `;
  if (!periods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "No fiscal period found");
  if (periods[0].status !== "OPEN") throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Fiscal period is not open");
}

export class JournalService {
  static async createDraft(context: FinanceActionContext, input: CreateDraftInput): Promise<FinanceJournalEntry> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.create", context.actorId);

    return prisma.$transaction(async (tx) => {
      await verifyPeriodIsOpen(tx, input.fiscalPeriodId);

      if (input.idempotencyKey) {
        const existing = await tx.financeJournalEntry.findFirst({
          where: { ledgerId: input.ledgerId, idempotencyKey: input.idempotencyKey },
          select: { id: true },
        });
        if (existing) {
          throw new FinanceDomainError("F_IDEMPOTENCY_CONFLICT", "Duplicate idempotency key in ledger");
        }
      }

      const ledger = await tx.financeLedger.findUnique({
        where: { id: input.ledgerId },
        select: { id: true, isActive: true, settings: true },
      });
      if (!ledger) throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
      if (!ledger.isActive) throw new FinanceDomainError("F_LEDGER_INACTIVE", "Ledger is inactive");
      if (!ledger.settings) throw new FinanceDomainError("F_VALIDATION_ERROR", "Ledger settings not found");

      const currency = await tx.financeCurrency.findUnique({
        where: { id: input.currencyId },
      });
      if (!currency) throw new FinanceDomainError("F_VALIDATION_ERROR", "Currency not found");
      if (!currency.isActive) throw new FinanceDomainError("F_VALIDATION_ERROR", "Currency is inactive");

      const exchangeRate = new Prisma.Decimal(input.exchangeRate || 1);
      if (exchangeRate.lte(0)) throw new FinanceDomainError("F_VALIDATION_ERROR", "Exchange rate must be positive");

      if (currency.id === ledger.settings.baseCurrencyId && !exchangeRate.equals(1)) {
        throw new FinanceDomainError("F_VALIDATION_ERROR", "Base currency exchange rate must be exactly 1");
      }

      const journal = await tx.financeJournalEntry.create({
        data: {
          ledgerId: input.ledgerId,
          fiscalPeriodId: input.fiscalPeriodId,
          entryDate: input.entryDate,
          currencyId: input.currencyId,
          exchangeRate: exchangeRate,
          reference: input.reference,
          description: input.description,
          status: "DRAFT",
          createdById: context.actorId,
          idempotencyKey: input.idempotencyKey,
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_CREATED",
        entityType: "FinanceJournalEntry",
        entityId: journal.id,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { status: "DRAFT" },
      });

      return journal;
    });
  }

  static async updateDraft(context: FinanceActionContext, journalId: string, data: { description?: string; reference?: string; entryDate?: Date }): Promise<FinanceJournalEntry> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.create", context.actorId);

    return prisma.$transaction(async (tx) => {
      const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
      if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
      const journal = journals[0];

      await verifyPeriodIsOpen(tx, journal.fiscalPeriodId);

      if (journal.status !== "DRAFT") throw new FinanceDomainError("F_INVALID_STATE", "Only DRAFT journals can be updated");
      if (journal.createdById !== context.actorId) throw new FinanceDomainError("F_PERMISSION_DENIED", "Only the creator can modify the draft");

      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data,
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_UPDATED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { updatedFields: Object.keys(data) },
      });

      return updated;
    });
  }

  static async addLine(context: FinanceActionContext, journalId: string, input: AddLineInput): Promise<FinanceJournalLine> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.create", context.actorId);

    const debitAmount = new Prisma.Decimal(input.debitAmount);
    const creditAmount = new Prisma.Decimal(input.creditAmount);

    if (debitAmount.isNegative() || creditAmount.isNegative()) {
      throw new FinanceDomainError("F_VALIDATION_ERROR", "Amounts must be non-negative");
    }
    if (debitAmount.isZero() && creditAmount.isZero()) {
      throw new FinanceDomainError("F_VALIDATION_ERROR", "Line must have a debit or credit");
    }
    if (!debitAmount.isZero() && !creditAmount.isZero()) {
      throw new FinanceDomainError("F_VALIDATION_ERROR", "Line cannot have both debit and credit");
    }

    return prisma.$transaction(async (tx) => {
      const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
      if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
      const journal = journals[0];

      await verifyPeriodIsOpen(tx, journal.fiscalPeriodId);

      if (journal.status !== "DRAFT") throw new FinanceDomainError("F_INVALID_STATE", "Lines can only be added to DRAFT");
      if (journal.createdById !== context.actorId) throw new FinanceDomainError("F_PERMISSION_DENIED", "Only creator can add lines");

      const account = await tx.financeAccount.findUnique({
        where: { id: input.accountId },
        select: { ledgerId: true, isActive: true },
      });
      if (!account) throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
      if (account.ledgerId !== journal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Account belongs to a different ledger");
      if (!account.isActive) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_INACTIVE", "Account is inactive");

      const maxLine = await tx.financeJournalLine.aggregate({
        where: { journalEntryId: journalId },
        _max: { lineNumber: true },
      });
      const lineNumber = (maxLine._max.lineNumber || 0) + 1;

      const rate = journal.exchangeRate || new Prisma.Decimal(1);
      const debitDec = new Prisma.Decimal(debitAmount);
      const creditDec = new Prisma.Decimal(creditAmount);

      const baseDebitAmount = debitDec.mul(rate).toDP(4);
      const baseCreditAmount = creditDec.mul(rate).toDP(4);

      const line = await tx.financeJournalLine.create({
        data: {
          journalEntryId: journalId,
          lineNumber,
          accountId: input.accountId,
          debitAmount: debitDec,
          creditAmount: creditDec,
          baseDebitAmount,
          baseCreditAmount,
          description: input.description,
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_UPDATED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { addedLine: line.id },
      });

      return line;
    });
  }

  static async updateLine(context: FinanceActionContext, journalId: string, lineId: string, input: Partial<AddLineInput>): Promise<FinanceJournalLine> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.create", context.actorId);

    return prisma.$transaction(async (tx) => {
      const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
      if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
      const journal = journals[0];

      await verifyPeriodIsOpen(tx, journal.fiscalPeriodId);

      if (journal.status !== "DRAFT") throw new FinanceDomainError("F_INVALID_STATE", "Lines can only be updated in DRAFT");
      if (journal.createdById !== context.actorId) throw new FinanceDomainError("F_PERMISSION_DENIED", "Only creator can update lines");

      const existingLine = await tx.financeJournalLine.findFirst({
        where: { id: lineId, journalEntryId: journalId },
      });
      if (!existingLine) throw new FinanceDomainError("F_NOT_FOUND", "Line not found");

      let finalDebit = existingLine.debitAmount;
      let finalCredit = existingLine.creditAmount;

      if (input.debitAmount !== undefined) finalDebit = new Prisma.Decimal(input.debitAmount);
      if (input.creditAmount !== undefined) finalCredit = new Prisma.Decimal(input.creditAmount);

      if (finalDebit.isNegative() || finalCredit.isNegative()) throw new FinanceDomainError("F_VALIDATION_ERROR", "Amounts must be non-negative");
      if (finalDebit.isZero() && finalCredit.isZero()) throw new FinanceDomainError("F_VALIDATION_ERROR", "Line must have a debit or credit");
      if (!finalDebit.isZero() && !finalCredit.isZero()) throw new FinanceDomainError("F_VALIDATION_ERROR", "Line cannot have both debit and credit");

      if (input.accountId && input.accountId !== existingLine.accountId) {
        const account = await tx.financeAccount.findUnique({
          where: { id: input.accountId },
          select: { ledgerId: true, isActive: true },
        });
        if (!account) throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
        if (account.ledgerId !== journal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Account belongs to a different ledger");
        if (!account.isActive) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_INACTIVE", "Account is inactive");
      }

      const rate = journal.exchangeRate || new Prisma.Decimal(1);
      const baseDebitAmount = finalDebit.mul(rate).toDP(4);
      const baseCreditAmount = finalCredit.mul(rate).toDP(4);

      const updated = await tx.financeJournalLine.update({
        where: { id: lineId },
        data: {
          accountId: input.accountId,
          debitAmount: input.debitAmount !== undefined ? finalDebit : undefined,
          creditAmount: input.creditAmount !== undefined ? finalCredit : undefined,
          baseDebitAmount,
          baseCreditAmount,
          description: input.description,
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_UPDATED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { updatedLine: lineId },
      });

      return updated;
    });
  }

  static async removeLine(context: FinanceActionContext, journalId: string, lineId: string): Promise<void> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.create", context.actorId);

    return prisma.$transaction(async (tx) => {
      const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
      if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
      const journal = journals[0];

      await verifyPeriodIsOpen(tx, journal.fiscalPeriodId);

      if (journal.status !== "DRAFT") throw new FinanceDomainError("F_INVALID_STATE", "Lines can only be removed from DRAFT");
      if (journal.createdById !== context.actorId) throw new FinanceDomainError("F_PERMISSION_DENIED", "Only creator can remove lines");

      const line = await tx.financeJournalLine.findUnique({
        where: { id: lineId, journalEntryId: journalId },
      });
      if (!line) throw new FinanceDomainError("F_NOT_FOUND", "Line not found");

      await tx.financeJournalLine.delete({ where: { id: lineId } });

      await auditWriter.log(tx, {
        action: "JOURNAL_UPDATED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { removedLine: lineId },
      });
    });
  }

  static async submitForReview(context: FinanceActionContext, journalId: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.submit", context.actorId);

    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT set_config('lock_timeout', '2000ms', true)`;
      } catch (e: unknown) {
        throw new FinanceDomainError("F_SYSTEM_ERROR", "Failed to acquire lock timeout configuration");
      }

      const preJournal = await tx.financeJournalEntry.findUnique({ where: { id: journalId }, select: { ledgerId: true, entryDate: true, status: true } });
      if (!preJournal) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");

      try {
        const ledgers = await tx.$queryRaw<{id: string, isActive: boolean}[]>`SELECT id, "isActive" FROM "FinanceLedger" WHERE id = ${preJournal.ledgerId} FOR SHARE`;
        if (!ledgers.length || !ledgers[0].isActive) throw new FinanceDomainError("F_LEDGER_INACTIVE", "Ledger is inactive");
      } catch (e: unknown) {
        checkDbError(e);
      }

      let journal;
      try {
        const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
        journal = journals[0];
        if (journal.ledgerId !== preJournal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Ledger mismatch");
        if (journal.status !== "DRAFT") throw new FinanceDomainError("F_INVALID_STATE", "Only DRAFT can be submitted");
        if (journal.createdById !== context.actorId) throw new FinanceDomainError("F_PERMISSION_DENIED", "Only creator can submit");
      } catch (e: unknown) {
        checkDbError(e);
      }

      try {
        const periods = await tx.$queryRaw<{id: string, status: string}[]>`
          SELECT p.id, p.status
          FROM "FinanceFiscalPeriod" p
          WHERE p.id = ${journal.fiscalPeriodId}
          FOR SHARE
        `;
        if (!periods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "No fiscal period found for date");
        if (periods[0].status !== "OPEN") throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Fiscal period is not open");
      } catch (e: unknown) {
        checkDbError(e);
      }

      const lines = await tx.financeJournalLine.findMany({ where: { journalEntryId: journalId } });
      if (lines.length < 2) throw new FinanceDomainError("F_JOURNAL_NOT_ENOUGH_LINES", "Journal requires at least 2 lines");

      let totalDebit = new Prisma.Decimal(0);
      let totalCredit = new Prisma.Decimal(0);
      let totalBaseDebit = new Prisma.Decimal(0);
      let totalBaseCredit = new Prisma.Decimal(0);

      const rate = journal.exchangeRate || new Prisma.Decimal(1);
      const accountIds = lines.map(l => l.accountId);

      if (accountIds.length > 0) {
        const uniqueAccounts = [...new Set(accountIds)].sort();
        try {
          const accounts = await tx.$queryRaw<{id: string, isActive: boolean, isPostingAllowed: boolean, ledgerId: string}[]>`
            SELECT id, "isActive", "isPostingAllowed", "ledgerId"
            FROM "FinanceAccount"
            WHERE id IN (${Prisma.join(uniqueAccounts)})
            ORDER BY id ASC
            FOR SHARE
          `;
          const accountMap = new Map(accounts.map(a => [a.id, a]));

          for (const line of lines) {
            const acc = accountMap.get(line.accountId);
            if (!acc) throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
            if (acc.ledgerId !== journal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Account in different ledger");
            if (!acc.isActive) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_INACTIVE", "Account is inactive");
            if (!acc.isPostingAllowed) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_NOT_POSTING", "Account does not allow posting");
          if (acc.ledgerId !== journal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Account ledger does not match journal ledger");

            totalDebit = totalDebit.plus(line.debitAmount);
            totalCredit = totalCredit.plus(line.creditAmount);

            const expectedBaseDebit = new Prisma.Decimal(line.debitAmount).mul(rate).toDP(4);
            const expectedBaseCredit = new Prisma.Decimal(line.creditAmount).mul(rate).toDP(4);

            if (!new Prisma.Decimal(line.baseDebitAmount).equals(expectedBaseDebit) || !new Prisma.Decimal(line.baseCreditAmount).equals(expectedBaseCredit)) {
               throw new FinanceDomainError("F_BASE_CURRENCY_IMBALANCE", "Line base amounts mismatch calculated rate");
            }

            totalBaseDebit = totalBaseDebit.plus(expectedBaseDebit);
            totalBaseCredit = totalBaseCredit.plus(expectedBaseCredit);
          }
        } catch (e: unknown) {
          checkDbError(e);
        }
      }

      if (!totalDebit.equals(totalCredit)) throw new FinanceDomainError("F_JOURNAL_UNBALANCED", "Journal is not balanced");
      if (!totalBaseDebit.equals(totalBaseCredit)) throw new FinanceDomainError("F_BASE_CURRENCY_IMBALANCE", "Journal base currency is unbalanced due to rounding differences");

      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data: {
          status: "PENDING_REVIEW",
          reviewedById: null,
          reviewedAt: null,
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_SUBMITTED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { from: "DRAFT", to: "PENDING_REVIEW" },
      });

      return updated;
    });
  }

  static async returnForModification(context: FinanceActionContext, journalId: string, reason: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.review", context.actorId);
    const trimmedReason = reason.trim();
    if (!trimmedReason || trimmedReason.length < 5) throw new FinanceDomainError("F_VALIDATION_ERROR", "Valid reason required");

    return prisma.$transaction(async (tx) => {
      try {
          await tx.$executeRaw`SELECT set_config('lock_timeout', '2000ms', true)`;
          await tx.$executeRaw`SELECT set_config('statement_timeout', '2000ms', true)`;
        } catch (e: unknown) {
          throw new FinanceDomainError("F_SYSTEM_ERROR", "Failed to set timeouts");
        }

      let journal;
      try {
        const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
        if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
        journal = journals[0];
      } catch (e: unknown) {
        checkDbError(e);
      }

      await verifyPeriodIsOpen(tx, journal!.fiscalPeriodId);

      if (journal!.status !== "PENDING_REVIEW") throw new FinanceDomainError("F_INVALID_STATE", "Only PENDING_REVIEW can be returned");
      verifySoD(context, journal!.createdById);

      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data: {
          status: "DRAFT",
          reviewedById: context.actorId,
          reviewedAt: new Date(),
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_REVIEWED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { outcome: "RETURNED_FOR_MODIFICATION", reason: trimmedReason.substring(0, 200) },
      });

      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  static async reviewJournal(context: FinanceActionContext, journalId: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.review", context.actorId);

    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT set_config('lock_timeout', '2000ms', true)`;
      } catch (e) {
        throw new FinanceDomainError("F_SYSTEM_ERROR", "Failed to acquire lock timeout configuration");
      }

      const preJournal = await tx.financeJournalEntry.findUnique({ where: { id: journalId }, select: { ledgerId: true, entryDate: true } });
      if (!preJournal) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");

      try {
        const ledgers = await tx.$queryRaw<{id: string, isActive: boolean}[]>`SELECT id, "isActive" FROM "FinanceLedger" WHERE id = ${preJournal.ledgerId} FOR SHARE`;
        if (!ledgers.length || !ledgers[0].isActive) throw new FinanceDomainError("F_LEDGER_INACTIVE", "Ledger is inactive");
      } catch (e: unknown) {
        checkDbError(e);
      }

      let journal;
      try {
        const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
        journal = journals[0];
        if (journal.status !== "PENDING_REVIEW") throw new FinanceDomainError("F_INVALID_STATE", "Only PENDING_REVIEW can be reviewed");
        verifySoD(context, journal.createdById);
      } catch (e: unknown) {
        checkDbError(e);
      }

      try {
        const periods = await tx.$queryRaw<{id: string, status: string}[]>`
          SELECT p.id, p.status
          FROM "FinanceFiscalPeriod" p
          WHERE p.id = ${journal.fiscalPeriodId}
          FOR SHARE
        `;
        if (!periods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "No fiscal period found");
        if (periods[0].status !== "OPEN") throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Fiscal period is not open");
      } catch (e: unknown) {
        checkDbError(e);
      }

      // We do not change the status, it remains PENDING_REVIEW until approved
      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data: {
          reviewedById: context.actorId,
          reviewedAt: new Date(),
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_REVIEWED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { outcome: "REVIEWED" },
      });

      return updated;
    }, { isolationLevel: "Serializable" });
  }

  static async approveJournal(context: FinanceActionContext, journalId: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.approve", context.actorId);

    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT set_config('lock_timeout', '2000ms', true)`;
      } catch (e) {
        throw new FinanceDomainError("F_SYSTEM_ERROR", "Failed to acquire lock timeout configuration");
      }

      const preJournal = await tx.financeJournalEntry.findUnique({ where: { id: journalId }, select: { ledgerId: true, entryDate: true } });
      if (!preJournal) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");

      try {
        const ledgers = await tx.$queryRaw<{id: string, isActive: boolean}[]>`SELECT id, "isActive" FROM "FinanceLedger" WHERE id = ${preJournal.ledgerId} FOR SHARE`;
        if (!ledgers.length || !ledgers[0].isActive) throw new FinanceDomainError("F_LEDGER_INACTIVE", "Ledger is inactive");
      } catch (e: unknown) {
        checkDbError(e);
      }

      let journal;
      try {
        const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
        journal = journals[0];
        if (journal.status !== "PENDING_REVIEW") throw new FinanceDomainError("F_INVALID_STATE", "Only PENDING_REVIEW can be approved");
        if (!journal.reviewedById || !journal.reviewedAt) throw new FinanceDomainError("F_INVALID_STATE", "Journal must be reviewed before approval");
        verifySoD(context, journal.createdById);
        if (journal.reviewedById === context.actorId || journal.reviewedById === context.impersonatorId) {
          throw new FinanceDomainError("F_SOD_VIOLATION", "Reviewer cannot also approve the journal");
        }
      } catch (e: unknown) {
        checkDbError(e);
      }

      try {
        const periods = await tx.$queryRaw<{id: string, status: string}[]>`
          SELECT p.id, p.status
          FROM "FinanceFiscalPeriod" p
          WHERE p.id = ${journal.fiscalPeriodId}
          FOR SHARE
        `;
        if (!periods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "No fiscal period found");
        if (periods[0].status !== "OPEN") throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Fiscal period is not open");
      } catch (e: unknown) {
        checkDbError(e);
      }

      const lines = await tx.financeJournalLine.findMany({ where: { journalEntryId: journalId } });
      if (lines.length < 2) throw new FinanceDomainError("F_JOURNAL_NOT_ENOUGH_LINES", "Journal requires at least 2 lines");

      let totalDebit = new Prisma.Decimal(0);
      let totalCredit = new Prisma.Decimal(0);
      let totalBaseDebit = new Prisma.Decimal(0);
      let totalBaseCredit = new Prisma.Decimal(0);

      const rate = journal.exchangeRate || new Prisma.Decimal(1);
      const accountIds = [...new Set(lines.map(l => l.accountId))].sort();

      try {
        const accounts = await tx.$queryRaw<{id: string, isActive: boolean, isPostingAllowed: boolean, ledgerId: string}[]>`
          SELECT id, "isActive", "isPostingAllowed", "ledgerId"
          FROM "FinanceAccount"
          WHERE id IN (${Prisma.join(accountIds)})
          ORDER BY id ASC
          FOR SHARE
        `;
        const accountMap = new Map(accounts.map(a => [a.id, a]));

        for (const line of lines) {
          const acc = accountMap.get(line.accountId);
          if (!acc) throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
          if (!acc.isActive) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_INACTIVE", "Account is inactive");
          if (!acc.isPostingAllowed) throw new FinanceDomainError("F_JOURNAL_ACCOUNT_NOT_POSTING", "Account does not allow posting");
          if (acc.ledgerId !== journal.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Account ledger does not match journal ledger");

          totalDebit = totalDebit.plus(line.debitAmount);
          totalCredit = totalCredit.plus(line.creditAmount);

          const expectedBaseDebit = new Prisma.Decimal(line.debitAmount).mul(rate).toDP(4);
          const expectedBaseCredit = new Prisma.Decimal(line.creditAmount).mul(rate).toDP(4);

          if (!new Prisma.Decimal(line.baseDebitAmount).equals(expectedBaseDebit) || !new Prisma.Decimal(line.baseCreditAmount).equals(expectedBaseCredit)) {
              throw new FinanceDomainError("F_BASE_CURRENCY_IMBALANCE", "Line base amounts mismatch calculated rate");
          }

          totalBaseDebit = totalBaseDebit.plus(expectedBaseDebit);
          totalBaseCredit = totalBaseCredit.plus(expectedBaseCredit);
        }
      } catch (e: unknown) {
        checkDbError(e);
      }

      if (!totalDebit.equals(totalCredit)) throw new FinanceDomainError("F_JOURNAL_UNBALANCED", "Journal is not balanced");
      if (!totalBaseDebit.equals(totalBaseCredit)) throw new FinanceDomainError("F_BASE_CURRENCY_IMBALANCE", "Journal base currency is unbalanced due to rounding differences");

      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data: {
          status: "APPROVED",
          approvedById: context.actorId,
          approvedAt: new Date(),
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_APPROVED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { from: "PENDING_REVIEW", to: "APPROVED" },
      });

      return updated;
    });
  }

  static async voidJournal(context: FinanceActionContext, journalId: string, reason: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.void", context.actorId);
    const trimmedReason = reason.trim();
    if (!trimmedReason) throw new FinanceDomainError("F_VALIDATION_ERROR", "Reason required");

    return prisma.$transaction(async (tx) => {
      try {
          await tx.$executeRaw`SELECT set_config('lock_timeout', '2000ms', true)`;
          await tx.$executeRaw`SELECT set_config('statement_timeout', '2000ms', true)`;
        } catch (e: unknown) {
          throw new FinanceDomainError("F_SYSTEM_ERROR", "Failed to set timeouts");
        }

      let journal;
      try {
        const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR UPDATE`;
        if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
        journal = journals[0];
      } catch (e: unknown) {
        checkDbError(e);
      }

      await verifyPeriodIsOpen(tx, journal!.fiscalPeriodId);

      if (journal!.status === "VOIDED") throw new FinanceDomainError("F_INVALID_STATE", "Already voided");
      if (journal!.status !== "DRAFT" && journal!.status !== "PENDING_REVIEW") {
        throw new FinanceDomainError("F_INVALID_STATE", "Only Draft or Pending Review can be voided");
      }

      const isSuper = await isSuperAdmin(context.actorId);
      const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
      const voidScopes = scopedPerms.get("finance.journal.void") || new Set();

      const hasCompanyVoid = isSuper || voidScopes.has("COMPANY");
      const hasSelfVoid = voidScopes.has("SELF");

      if (journal!.status === "PENDING_REVIEW" && !hasCompanyVoid) {
         throw new FinanceDomainError("F_SCOPE_DENIED", "Voiding PENDING_REVIEW requires COMPANY scope");
      }

      if (!hasCompanyVoid) {
         if (!hasSelfVoid || journal!.createdById !== context.actorId) {
            throw new FinanceDomainError("F_SCOPE_DENIED", "You cannot void this journal");
         }
      }

      const updated = await tx.financeJournalEntry.update({
        where: { id: journalId },
        data: {
          status: "VOIDED",
        },
      });

      await auditWriter.log(tx, {
        action: "JOURNAL_VOIDED",
        entityType: "FinanceJournalEntry",
        entityId: journalId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { reason: trimmedReason.substring(0, 200) },
      });

      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  static async getJournal(context: FinanceActionContext, journalId: string): Promise<FinanceJournalEntry> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.view", context.actorId);

    const journal = await prisma.financeJournalEntry.findUnique({
      where: { id: journalId },
      include: { lines: true },
    });
    if (!journal) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const viewScopes = scopedPerms.get("finance.journal.view") || new Set();
    const hasCompany = isSuper || viewScopes.has("COMPANY");

    if (!hasCompany && journal.createdById !== context.actorId) {
       throw new FinanceDomainError("F_SCOPE_DENIED", "You can only view your own journals");
    }

    return journal;
  }

  static async listJournals(context: FinanceActionContext, filter: { ledgerId?: string, status?: FinanceJournalStatus }, pagination: { skip?: number, take?: number } = {}): Promise<{ items: FinanceJournalEntry[], total: number }> {
    await requireFinanceServicePermission(context.actorId, "finance.journal.view", context.actorId);

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const viewScopes = scopedPerms.get("finance.journal.view") || new Set();

    const hasCompany = isSuper || viewScopes.has("COMPANY");

    if (pagination.skip !== undefined && pagination.skip < 0) throw new FinanceDomainError("F_VALIDATION_ERROR", "skip cannot be negative");
    if (pagination.take !== undefined && pagination.take < 0) throw new FinanceDomainError("F_VALIDATION_ERROR", "take cannot be negative");

    const whereClause: Prisma.FinanceJournalEntryWhereInput = {};
    if (filter.ledgerId) whereClause.ledgerId = filter.ledgerId;
    if (filter.status) whereClause.status = filter.status;

    if (!hasCompany) {
      whereClause.createdById = context.actorId;
    }

    const items = await prisma.financeJournalEntry.findMany({
      where: whereClause,
      skip: pagination.skip !== undefined ? pagination.skip : 0,
      take: Math.min(pagination.take !== undefined ? pagination.take : 50, 100),
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
    });
    const total = await prisma.financeJournalEntry.count({ where: whereClause });
    return { items, total };
  }

  static async reverseJournal(context: FinanceActionContext, journalId: string, targetFiscalPeriodId: string, reversalReason: string): Promise<FinanceJournalEntry> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.reverse", context.actorId);
    const trimmedReason = reversalReason.trim();
    if (!trimmedReason) throw new FinanceDomainError("F_VALIDATION_ERROR", "Reversal reason is required");

    return prisma.$transaction(async (tx) => {
      const journals = await tx.$queryRaw<FinanceJournalEntry[]>`SELECT * FROM "FinanceJournalEntry" WHERE id = ${journalId} FOR SHARE`;
      if (!journals.length) throw new FinanceDomainError("F_JOURNAL_NOT_FOUND", "Journal not found");
      const original = journals[0];

      if (original.status !== "POSTED") {
        throw new FinanceDomainError("F_INVALID_STATE", "Only POSTED journals can be reversed");
      }

      // Check original period exists
      const origPeriods = await tx.$queryRaw<{id: string, startDate: Date}[]>`SELECT id, "startDate" FROM "FinanceFiscalPeriod" WHERE id = ${original.fiscalPeriodId} FOR SHARE`;
      if (!origPeriods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "Original fiscal period not found");

      // Verify target period is OPEN and lock it
      const targetPeriods = await tx.$queryRaw<{id: string, status: string, startDate: Date, ledgerId: string}[]>`
        SELECT p.id, p.status, p."startDate", y."ledgerId"
        FROM "FinanceFiscalPeriod" p
        JOIN "FinanceFiscalYear" y ON p."fiscalYearId" = y.id
        WHERE p.id = ${targetFiscalPeriodId}
        FOR SHARE
      `;
      if (!targetPeriods.length) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "Target fiscal period not found");
      const targetPeriod = targetPeriods[0];
      if (targetPeriod.status !== "OPEN") throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Target fiscal period is not open");
      if (targetPeriod.ledgerId !== original.ledgerId) throw new FinanceDomainError("F_CROSS_LEDGER_VIOLATION", "Target period is in a different ledger");
      if (targetPeriod.startDate < origPeriods[0].startDate) throw new FinanceDomainError("F_JOURNAL_INVALID_DATE", "Target period cannot be older than original period");

      // Create DRAFT reversal
      const reversal = await tx.financeJournalEntry.create({
        data: {
          ledgerId: original.ledgerId,
          fiscalPeriodId: targetFiscalPeriodId,
          entryDate: targetPeriod.startDate, // Reversals are recorded on the first day of the target period
          currencyId: original.currencyId,
          exchangeRate: original.exchangeRate,
          description: `Reversal of ${original.entryNumber}: ${original.description}`,
          status: "DRAFT",
          sourceModule: "REVERSAL",
          reversalOfEntryId: original.id,
          reversalReason: trimmedReason,
          createdById: context.actorId,
        },
      });

      // Flip lines
      const originalLines = await tx.financeJournalLine.findMany({
        where: { journalEntryId: original.id }
      });

      for (const line of originalLines) {
        await tx.financeJournalLine.create({
          data: {
            journalEntryId: reversal.id,
            lineNumber: line.lineNumber,
            accountId: line.accountId,
            costCenterId: line.costCenterId,
            debitAmount: line.creditAmount,
            creditAmount: line.debitAmount,
            baseDebitAmount: line.baseCreditAmount,
            baseCreditAmount: line.baseDebitAmount,
            description: line.description,
          }
        });
      }

      await auditWriter.log(tx, {
        action: "JOURNAL_CREATED",
        entityType: "FinanceJournalEntry",
        entityId: reversal.id,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { status: "DRAFT", isReversal: true, originalEntryId: original.id },
      });

      return reversal;
    }, { isolationLevel: "Serializable" });
  }

  static async postJournal(context: FinanceActionContext, journalId: string): Promise<{ entryNumber: string }> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.post", context.actorId);

    // Call the finance_post_journal function.
    // Notice that we don't need a transaction block because the DB function handles it safely
    // BUT we must pass impersonation context.
    return prisma.$transaction(async (tx) => {
      if (context.impersonatorId) {
        await tx.$executeRaw`SELECT set_config('finance.impersonator_id', ${context.impersonatorId}, true)`;
      } else {
        await tx.$executeRaw`SELECT set_config('finance.impersonator_id', '', true)`;
      }
      if (context.correlationId) {
        await tx.$executeRaw`SELECT set_config('finance.correlation_id', ${context.correlationId}, true)`;
      }

      try {
        const result = await tx.$queryRaw<{ finance_post_journal: string }[]>`
          SELECT public.finance_post_journal(${journalId}, ${context.actorId})
        `;
        return { entryNumber: result[0].finance_post_journal };
      } catch (e: unknown) {
        const err = e as { code?: string, meta?: { message?: string } };
        if (err.code === "P2010" && err.meta?.message?.includes("FROZEN or CLOSED")) {
          throw new FinanceDomainError("F_JOURNAL_PERIOD_CLOSED", "Fiscal period is not open");
        }
        checkDbError(e);
      }
    }, { isolationLevel: "Serializable" });
  }

}
