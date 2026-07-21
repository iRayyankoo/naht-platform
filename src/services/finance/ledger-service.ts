import { PrismaClient, FinanceLedger, Prisma } from "@prisma/client";
import { CreateLedgerSchema, UpdateLedgerSchema } from "../../lib/validations/finance";
import { FinanceDomainError } from "../../lib/finance-errors";
import { requireFinanceServicePermission } from "../../lib/finance-auth";
import { auditWriter } from "../../lib/finance-audit";
import * as crypto from "crypto";

const prisma = new PrismaClient();

export class LedgerService {
  /**
   * Create a new Ledger
   */
  static async createLedger(
    actorId: string,
    data: unknown,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceLedger> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.manage");

      const parsed = CreateLedgerSchema.parse(data);

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeLedger.findUnique({
          where: { code: parsed.code },
        });

        if (existing) {
          throw new FinanceDomainError("F_LEDGER_DUPLICATE_CODE", "Ledger with this code already exists");
        }

        const ledger = await tx.financeLedger.create({
          data: {
            code: parsed.code,
            nameAr: parsed.nameAr,
            nameEn: parsed.nameEn,
            isActive: parsed.isActive ?? true,
          },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "LEDGER_CREATED",
          entityType: "FinanceLedger",
          entityId: ledger.id,
          correlationId,
          metadata: { code: ledger.code, nameEn: ledger.nameEn },
        });

        return ledger;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing Ledger
   */
  static async updateLedger(
    actorId: string,
    id: string,
    data: unknown,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceLedger> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.manage");

      const parsed = UpdateLedgerSchema.parse(data);

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeLedger.findUnique({ where: { id } });
        if (!existing) {
          throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
        }

        const ledger = await tx.financeLedger.update({
          where: { id },
          data: {
            nameAr: parsed.nameAr !== undefined ? parsed.nameAr : existing.nameAr,
            nameEn: parsed.nameEn !== undefined ? parsed.nameEn : existing.nameEn,
          },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "LEDGER_UPDATED",
          entityType: "FinanceLedger",
          entityId: ledger.id,
          correlationId,
          metadata: { nameEn: ledger.nameEn },
        });

        return ledger;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate a Ledger
   */
  static async deactivateLedger(
    actorId: string,
    id: string,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceLedger> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.manage");

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeLedger.findUnique({ 
          where: { id },
        });

        if (!existing) {
          throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
        }

        if (!existing.isActive) {
          return existing; // Idempotent
        }

        const ledger = await tx.financeLedger.update({
          where: { id },
          data: { isActive: false },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "LEDGER_DEACTIVATED",
          entityType: "FinanceLedger",
          entityId: ledger.id,
          correlationId,
        });

        return ledger;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reactivate a Ledger
   */
  static async reactivateLedger(
    actorId: string,
    id: string,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceLedger> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.manage");

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeLedger.findUnique({ where: { id } });

        if (!existing) {
          throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
        }

        if (existing.isActive) {
          return existing; // Idempotent
        }

        const ledger = await tx.financeLedger.update({
          where: { id },
          data: { isActive: true },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "LEDGER_REACTIVATED",
          entityType: "FinanceLedger",
          entityId: ledger.id,
          correlationId,
        });

        return ledger;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Ledger by ID
   */
  static async getLedger(
    actorId: string,
    id: string,
    /* correlationId ignored */
  ): Promise<FinanceLedger> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.view");

      const ledger = await prisma.financeLedger.findUnique({ where: { id } });
      if (!ledger) {
        throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
      }

      return ledger;
    } catch (error) {
      throw error;
    }
  }

  /**
   * List Ledgers
   */
  static async listLedgers(
    actorId: string,
    options?: { onlyActive?: boolean; search?: string }
  ): Promise<{ items: Prisma.FinanceLedgerGetPayload<{ include: { settings: true } }>[]; total: number }> {
    try {
      await requireFinanceServicePermission(actorId, "finance.ledger.view");

      const { isSuperAdmin, getCurrentUserScopedPermissions } = await import("../../lib/rbac-helpers");
      const isSuper = await isSuperAdmin(actorId);
      const scopedPerms = await getCurrentUserScopedPermissions(actorId);
      const scopes = scopedPerms.get("finance.ledger.view");
      const hasCompanyScope = isSuper || (scopes && scopes.has("COMPANY"));

      if (!hasCompanyScope) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "Insufficient scope to list ledgers");
      }

      const where: Prisma.FinanceLedgerWhereInput = {};
      if (options?.onlyActive) where.isActive = true;
      if (options?.search) {
        where.OR = [
          { code: { contains: options.search, mode: "insensitive" } },
          { nameEn: { contains: options.search, mode: "insensitive" } },
          { nameAr: { contains: options.search, mode: "insensitive" } }
        ];
      }

      const [items, total] = await Promise.all([
        prisma.financeLedger.findMany({
          where,
          include: { settings: true },
          orderBy: { code: 'asc' },
        }),
        prisma.financeLedger.count({ where })
      ]);
      return { items, total };
    } catch (error) {
      throw error;
    }
  }
}
