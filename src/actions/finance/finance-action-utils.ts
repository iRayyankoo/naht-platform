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

import { prisma } from "@/lib/prisma";

export interface SessionDependencies {
  getCurrentUser?: () => Promise<{ id: string; isActive: boolean } | null>;
  getImpersonationRuntimeContext?: () => Promise<{ actorUserId: string; targetUserId?: string | null } | null>;
  getUserById?: (id: string) => Promise<{ id: string; isActive: boolean } | null>;
}

export async function getFinanceServerContext(deps?: SessionDependencies): Promise<FinanceActionContext> {
  const getCurrentUser = deps?.getCurrentUser ?? (await import("@/lib/auth-helpers")).getCurrentUser;
  const getImpersonationRuntimeContext = deps?.getImpersonationRuntimeContext ?? (await import("@/lib/impersonation-runtime-context")).getImpersonationRuntimeContext;
  const getUserById = deps?.getUserById ?? (async (id: string) => await prisma.user.findUnique({ where: { id }, select: { id: true, isActive: true } }));

  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isActive) {
    throw new FinanceDomainError("F_PERMISSION_DENIED", "User is not authenticated or inactive");
  }

  const runtime = await getImpersonationRuntimeContext();

  let actorId = currentUser.id;
  let impersonatorId: string | undefined = undefined;

  // If impersonation is active
  if (runtime && runtime.targetUserId) {
    // Strict safeguard: Only allow impersonation if the logged-in user matches the runtime actor
    if (runtime.actorUserId !== currentUser.id) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Impersonation session mismatch");
    }

    // Check target user exists and is active
    const targetUser = await getUserById(runtime.targetUserId);
    if (!targetUser || !targetUser.isActive) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Target user is inactive or does not exist");
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

export async function withFinanceActionErrorHandler<T>(
  actionFn: (context: FinanceActionContext) => Promise<T>,
  deps?: SessionDependencies
): Promise<FinanceActionResult<T>> {
  let context: FinanceActionContext | undefined;
  try {
    context = await getFinanceServerContext(deps);
    const data = await actionFn(context);
    return { ok: true, data };
  } catch (error: unknown) {
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

    if (error instanceof FinanceDomainError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    // Safely log the error type/code and correlationId, without dumping the raw error
    const errType = typeof error;
    const errName = error instanceof Error ? error.name : "UnknownError";
    const correlationId = context?.correlationId ?? "unknown";
    console.error(`[FinanceAction Error] Type: ${errName} (${errType}) | CorrelationId: ${correlationId} | Message: ${error instanceof Error ? error.message : String(error)}`);

    return {
      ok: false,
      error: {
        code: "F_INTERNAL_ERROR",
        message: "An internal server error occurred while processing your request.",
      },
    };
  }
}
