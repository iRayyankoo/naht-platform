import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export type FinanceErrorCode =
  | "F_VALIDATION_ERROR"
  | "F_NOT_FOUND"
  | "F_PERMISSION_DENIED"
  | "F_SCOPE_DENIED"
  | "F_SOD_VIOLATION"
  | "F_INVALID_STATE"
  | "F_IDEMPOTENCY_CONFLICT"
  | "F_ACCOUNT_CYCLE_DETECTED"
  | "F_CROSS_LEDGER_VIOLATION"
  | "F_DB_CONSTRAINT_ERROR"
  | "F_UNKNOWN_ERROR";

export type FinanceActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: FinanceErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryable: boolean;
    correlationId: string;
  };
};

export class FinanceDomainError extends Error {
  constructor(
    public code: FinanceErrorCode,
    message: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = "FinanceDomainError";
  }
}

export const FinanceErrorMapper = {
  map(error: unknown, correlationId: string): FinanceActionResponse {
    // 1. Zod Validation Errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          code: "F_VALIDATION_ERROR",
          message: "Input validation failed",
          fieldErrors: error.flatten().fieldErrors,
          retryable: false,
          correlationId,
        },
      };
    }

    // 2. Custom Domain Errors
    if (error instanceof FinanceDomainError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message, // Safe message defined in service
          retryable: error.retryable,
          correlationId,
        },
      };
    }

    // 3. Prisma Known Request Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("idempotencyKey")) {
          return {
            success: false,
            error: {
              code: "F_IDEMPOTENCY_CONFLICT",
              message:
                "A request with this idempotency key has already been processed.",
              retryable: false, // User shouldn't just blindly retry with same key if it's genuinely a dup
              correlationId,
            },
          };
        }
        return {
          success: false,
          error: {
            code: "F_DB_CONSTRAINT_ERROR",
            message: "A unique constraint violation occurred.",
            retryable: false,
            correlationId,
          },
        };
      }

      // P2010: Raw query failed (Used by Postgres Triggers)
      if (error.code === "P2010") {
        const message = error.message.toLowerCase();

        // Map known triggers/constraints
        if (message.includes("chk_finance_reversal_not_self")) {
          return {
            success: false,
            error: {
              code: "F_INVALID_STATE",
              message: "Cannot reverse a journal with itself.",
              retryable: false,
              correlationId,
            },
          };
        }

        if (message.includes("cycle")) {
          return {
            success: false,
            error: {
              code: "F_ACCOUNT_CYCLE_DETECTED",
              message:
                "Hierarchy cycle detected. Account cannot be its own ancestor.",
              retryable: false,
              correlationId,
            },
          };
        }

        if (message.includes("cross") || message.includes("ledger")) {
          return {
            success: false,
            error: {
              code: "F_CROSS_LEDGER_VIOLATION",
              message: "Cannot mix entities from different ledgers.",
              retryable: false,
              correlationId,
            },
          };
        }

        // Generic P2010 safe fallback
        return {
          success: false,
          error: {
            code: "F_DB_CONSTRAINT_ERROR",
            message: "Database validation rejected the operation.",
            retryable: false,
            correlationId,
          },
        };
      }

      // P2025: Record not found
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            code: "F_NOT_FOUND",
            message: "The requested resource could not be found.",
            retryable: false,
            correlationId,
          },
        };
      }
    }

    // 4. Unknown Errors (Catch-all)
    // Log the actual error internally
    console.error(`[FINANCE_ERROR] [${correlationId}]`, error);

    return {
      success: false,
      error: {
        code: "F_UNKNOWN_ERROR",
        message: "An unexpected error occurred. Please contact support.",
        retryable: true, // Some unknown errors (like network/deadlocks) might be retryable
        correlationId,
      },
    };
  },
};
