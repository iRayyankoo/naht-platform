import { ZodError } from "zod";
import { FinanceActionContext } from "@/lib/finance-context";
import { FinanceDomainError } from "@/lib/finance-errors";
import { randomUUID } from "crypto";

export type FinanceActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
    };

// ============================================================================
// Dependency Factory for Session Provider
// ============================================================================
export interface SessionProvider {
  getCurrentUser: () => Promise<{ id: string } | null>;
  getImpersonationRuntimeContext: () => Promise<{ actorUserId: string; targetUserId?: string | null } | null>;
}

const defaultSessionProvider: SessionProvider = {
  getCurrentUser: async () => {
    const { getCurrentUser } = await import("@/lib/auth-helpers");
    return getCurrentUser();
  },
  getImpersonationRuntimeContext: async () => {
    const { getImpersonationRuntimeContext } = await import("@/lib/impersonation-runtime-context");
    return getImpersonationRuntimeContext();
  },
};

let activeSessionProvider = defaultSessionProvider;

/**
 * Use strictly for testing. Overrides the session provider so we don't 
 * rely on global mutable monkey patching of Next.js auth modules.
 */
export function setTestSessionProvider(provider: SessionProvider) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot override session provider in production");
  }
  activeSessionProvider = provider;
}

export function resetTestSessionProvider() {
  activeSessionProvider = defaultSessionProvider;
}

/**
 * Extracts securely the finance action context from the server session and impersonation state.
 * Never trust client input for actorId, impersonatorId, or correlationId.
 */
export async function getFinanceServerContext(): Promise<FinanceActionContext> {
  const currentUser = await activeSessionProvider.getCurrentUser();
  if (!currentUser) {
    throw new FinanceDomainError("F_PERMISSION_DENIED", "User is not authenticated");
  }

  const runtime = await activeSessionProvider.getImpersonationRuntimeContext();

  let actorId = currentUser.id;
  let impersonatorId: string | undefined = undefined;

  // If impersonation is active
  if (runtime && runtime.targetUserId) {
    // Strict safeguard: Only allow impersonation if the logged-in user matches the runtime actor
    if (runtime.actorUserId !== currentUser.id) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Impersonation session mismatch");
    }
    // Set context to the impersonated user
    actorId = runtime.targetUserId;
    impersonatorId = runtime.actorUserId;
  }

  return {
    actorId,
    impersonatorId,
    correlationId: randomUUID(),
  };
}

/**
 * Safely executes a finance action, catching all errors and formatting them
 * into a safe, client-friendly `FinanceActionResult` contract.
 * Prevents Prisma/PostgreSQL or unexpected errors from leaking.
 */
export async function withFinanceActionErrorHandler<T>(
  actionFn: (context: FinanceActionContext) => Promise<T>
): Promise<FinanceActionResult<T>> {
  try {
    const context = await getFinanceServerContext();
    const data = await actionFn(context);
    return { ok: true, data };
  } catch (error: any) {
    // 1. Handle Zod Validation Errors
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: {
          code: "F_VALIDATION_ERROR",
          message: "Input validation failed",
          fieldErrors: error.flatten().fieldErrors,
        },
      };
    }

    // 2. Handle Known Finance Domain Errors (Safe to expose)
    if (error instanceof FinanceDomainError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    // 3. Prevent Prisma / DB leaks. Log to console, return generic error.
    console.error("[FinanceAction Error]", error);

    return {
      ok: false,
      error: {
        code: "F_INTERNAL_ERROR",
        message: "An internal server error occurred while processing your request.",
      },
    };
  }
}
