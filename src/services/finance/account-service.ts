import { PrismaClient, FinanceAccount } from "@prisma/client";
import { CreateAccountSchema, UpdateAccountSchema } from "../../lib/validations/finance";
import { FinanceDomainError, FinanceErrorMapper } from "../../lib/finance-errors";
import { requireFinancePermission, requireFinanceServicePermission } from "../../lib/finance-auth";
import { auditWriter } from "../../lib/finance-audit";
import { FinanceAccountType, FinanceNormalBalance } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

export class AccountService {
  private static getNormalBalanceForType(type: FinanceAccountType): FinanceNormalBalance {
    switch (type) {
      case "ASSET":
      case "EXPENSE":
        return "DEBIT";
      case "LIABILITY":
      case "EQUITY":
      case "REVENUE":
        return "CREDIT";
      default:
        return "DEBIT"; // Fallback
    }
  }

  /**
   * Create a new Account
   */
  static async createAccount(
    actorId: string,
    data: unknown,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.manage");

      const parsed = CreateAccountSchema.parse(data);

      return await prisma.$transaction(async (tx) => {
        // Verify Ledger exists and is active
        const ledger = await tx.financeLedger.findUnique({ where: { id: parsed.ledgerId } });
        if (!ledger) {
          throw new FinanceDomainError("F_LEDGER_NOT_FOUND", "Ledger not found");
        }
        if (!ledger.isActive) {
          throw new FinanceDomainError("F_LEDGER_INACTIVE", "Cannot create account in an inactive ledger");
        }

        // Validate parentId if provided
        if (parsed.parentId) {
          const parent = await tx.financeAccount.findUnique({ where: { id: parsed.parentId } });
          if (!parent) {
            throw new FinanceDomainError("F_ACCOUNT_PARENT_NOT_FOUND", "Parent account not found");
          }
          if (parent.ledgerId !== parsed.ledgerId) {
            throw new FinanceDomainError("F_ACCOUNT_PARENT_MISMATCH", "Parent account must belong to the same ledger");
          }
          if (!parent.isActive) {
            throw new FinanceDomainError("F_ACCOUNT_PARENT_INACTIVE", "Cannot create account under an inactive parent");
          }
          if (parent.isPostingAllowed) {
            throw new FinanceDomainError(
              "F_ACCOUNT_PARENT_IS_POSTING",
              "Parent account is a posting account. Please convert it to a Header account first."
            );
          }
        }

        // Validate unique code within ledger
        const existingCode = await tx.financeAccount.findFirst({
          where: {
            ledgerId: parsed.ledgerId,
            code: {
              equals: parsed.code,
              mode: 'insensitive'
            }
          }
        });

        if (existingCode) {
          throw new FinanceDomainError("F_ACCOUNT_DUPLICATE_CODE", "Account code must be unique within the ledger");
        }

        const normalBalance = parsed.normalBalance || this.getNormalBalanceForType(parsed.type);

        const account = await tx.financeAccount.create({
          data: {
            ledgerId: parsed.ledgerId,
            parentId: parsed.parentId,
            code: parsed.code,
            nameAr: parsed.nameAr,
            nameEn: parsed.nameEn,
            type: parsed.type,
            normalBalance,
            isPostingAllowed: parsed.isPostingAllowed,
            isActive: parsed.isActive ?? true,
            description: parsed.description,
          },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "ACCOUNT_CREATED",
          entityType: "FinanceAccount",
          entityId: account.id,
          correlationId,
          metadata: { code: account.code, ledgerId: account.ledgerId },
        });

        return account;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing Account
   */
  static async updateAccount(
    actorId: string,
    id: string,
    data: unknown,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.manage");

      const parsed = UpdateAccountSchema.parse(data);

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeAccount.findUnique({ 
          where: { id },
          include: { children: true }
        });

        if (!existing) {
          throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
        }

        // Validate parentId if changing
        if (parsed.parentId !== undefined && parsed.parentId !== existing.parentId) {
          if (parsed.parentId) {
            const parent = await tx.financeAccount.findUnique({
              where: { id: parsed.parentId }
            });
            if (!parent) {
              throw new FinanceDomainError("F_ACCOUNT_PARENT_NOT_FOUND", "Parent account not found");
            }
            if (parent.ledgerId !== existing.ledgerId) {
              throw new FinanceDomainError("F_ACCOUNT_PARENT_MISMATCH", "Parent account must belong to the same ledger");
            }
            // Cannot make an account its own parent or a child of its children (simplified check)
            if (parent.id === existing.id) {
              throw new FinanceDomainError("F_ACCOUNT_INVALID_PARENT", "Account cannot be its own parent");
            }
            if (parent.isPostingAllowed) {
              throw new FinanceDomainError(
                "F_ACCOUNT_PARENT_IS_POSTING",
                "Target parent account is a posting account. Please convert it to a Header account first."
              );
            }
          }
        }

        // Check if there are journal lines for changing core immutable traits
        if (parsed.type !== undefined || parsed.normalBalance !== undefined) {
          const linesCount = await tx.financeJournalLine.count({ where: { accountId: id } });
          if (linesCount > 0) {
            throw new FinanceDomainError(
              "F_ACCOUNT_HAS_JOURNALS",
              "Cannot change account type or normal balance after it has been used in a journal entry."
            );
          }
        }

        // Ensure we don't set isPostingAllowed to true if it has children
        const newIsPosting = parsed.isPostingAllowed !== undefined ? parsed.isPostingAllowed : existing.isPostingAllowed;
        if (newIsPosting && existing.children.length > 0) {
          throw new FinanceDomainError("F_ACCOUNT_HAS_CHILDREN", "Cannot allow posting on an account with children");
        }

        const account = await tx.financeAccount.update({
          where: { id },
          data: {
            parentId: parsed.parentId !== undefined ? parsed.parentId : existing.parentId,
            nameAr: parsed.nameAr !== undefined ? parsed.nameAr : existing.nameAr,
            nameEn: parsed.nameEn !== undefined ? parsed.nameEn : existing.nameEn,
            type: parsed.type !== undefined ? parsed.type : existing.type,
            normalBalance: parsed.normalBalance !== undefined ? parsed.normalBalance : existing.normalBalance,
            isPostingAllowed: newIsPosting,
            description: parsed.description !== undefined ? parsed.description : existing.description,
          },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "ACCOUNT_UPDATED",
          entityType: "FinanceAccount",
          entityId: account.id,
          correlationId,
        });

        return account;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate an Account
   */
  static async deactivateAccount(
    actorId: string,
    id: string,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.manage");

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeAccount.findUnique({ 
          where: { id },
        });

        if (!existing) {
          throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
        }

        if (!existing.isActive) {
          return existing; // Idempotent
        }

        // Rule: cannot deactivate if it has non-final journal entries
        const nonFinalLines = await tx.financeJournalLine.count({
          where: {
            accountId: id,
            journalEntry: {
              status: {
                in: ["DRAFT", "PENDING_REVIEW", "APPROVED"]
              }
            }
          }
        });

        if (nonFinalLines > 0) {
          throw new FinanceDomainError("F_ACCOUNT_HAS_NONFINAL_JOURNALS", "Cannot deactivate account with non-final journal entries.");
        }

        // Rule: cannot deactivate parent if it has active children
        const activeChildren = await tx.financeAccount.count({
          where: {
            parentId: id,
            isActive: true
          }
        });

        if (activeChildren > 0) {
          throw new FinanceDomainError("F_ACCOUNT_HAS_ACTIVE_CHILDREN", "Cannot deactivate parent account with active children.");
        }

        const account = await tx.financeAccount.update({
          where: { id },
          data: { isActive: false },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "ACCOUNT_DEACTIVATED",
          entityType: "FinanceAccount",
          entityId: account.id,
          correlationId,
        });

        return account;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reactivate an Account
   */
  static async reactivateAccount(
    actorId: string,
    id: string,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.manage");

      return await prisma.$transaction(async (tx) => {
        const existing = await tx.financeAccount.findUnique({ where: { id } });

        if (!existing) {
          throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
        }

        if (existing.isActive) {
          return existing; // Idempotent
        }

        const ledger = await tx.financeLedger.findUnique({ where: { id: existing.ledgerId } });
        if (!ledger?.isActive) {
          throw new FinanceDomainError("F_LEDGER_INACTIVE", "Cannot reactivate account in an inactive ledger");
        }

        if (existing.parentId) {
          const parent = await tx.financeAccount.findUnique({ where: { id: existing.parentId } });
          if (!parent?.isActive) {
            throw new FinanceDomainError("F_ACCOUNT_PARENT_INACTIVE", "Cannot reactivate account with inactive parent");
          }
        }

        const account = await tx.financeAccount.update({
          where: { id },
          data: { isActive: true },
        });

        await auditWriter.log(tx, {
          actorId: actorId,
          action: "ACCOUNT_REACTIVATED",
          entityType: "FinanceAccount",
          entityId: account.id,
          correlationId,
        });

        return account;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Account by ID
   */
  static async getAccount(
    actorId: string,
    id: string,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.view");

      const account = await prisma.financeAccount.findUnique({ where: { id } });
      if (!account) {
        throw new FinanceDomainError("F_ACCOUNT_NOT_FOUND", "Account not found");
      }

      return account;
    } catch (error) {
      throw error;
    }
  }

  /**
   * List Accounts
   */
  static async listAccounts(
    actorId: string,
    ledgerId: string,
    skip: number = 0,
    take: number = 100,
    correlationId: string = crypto.randomUUID()
  ): Promise<FinanceAccount[]> {
    try {
      await requireFinanceServicePermission(actorId, "finance.account.view");

      return await prisma.financeAccount.findMany({
        where: { ledgerId },
        skip,
        take,
        orderBy: { code: 'asc' },
      });
    } catch (error) {
      throw error;
    }
  }
}
