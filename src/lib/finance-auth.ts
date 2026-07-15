import { checkScopedPermission } from "./rbac-helpers";
import { getCurrentUser } from "./auth-helpers";
import { FinanceDomainError } from "./finance-errors";

/**
 * Known finance permissions. If these are not registered in the
 * RolePermission table, they will fail-close to ADMIN/SUPER_ADMIN.
 */
export type FinancePermissionCode =
  | "finance.journal.create"
  | "finance.journal.approve"
  | "finance.journal.post"
  | "finance.journal.reverse"
  | "finance.account.manage"
  | "finance.period.manage"
  | "finance.ledger.manage";

export interface FinanceAuthDependencies {
  getCurrentUser: () => Promise<{ id: string; email?: string | null } | null>;
  checkScopedPermission: (
    permissionCode: string,
    options: { targetUserId?: string },
    context?: string,
  ) => Promise<boolean>;
}

const defaultDependencies: FinanceAuthDependencies = {
  getCurrentUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkScopedPermission: (code, options, context) =>
    checkScopedPermission(code, options as any, context),
};

/**
 * A thin wrapper over the existing RBAC system tailored for Finance operations.
 * It enforces fail-closed behavior and throws Domain Errors.
 */
export async function requireFinancePermission(
  permissionCode: FinancePermissionCode,
  resourceOwnerId?: string,
  context: string = "Finance Operation",
  deps: FinanceAuthDependencies = defaultDependencies,
): Promise<void> {
  try {
    const user = await deps.getCurrentUser();
    if (!user) {
      throw new FinanceDomainError(
        "F_PERMISSION_DENIED",
        "Authentication required",
      );
    }

    // Use the injected checkScopedPermission
    // If resourceOwnerId is provided, we map it to targetUserId to evaluate 'SELF' scope.
    const hasPerm = await deps.checkScopedPermission(
      permissionCode,
      { targetUserId: resourceOwnerId },
      context,
    );

    if (!hasPerm) {
      // Determine if it was a permission denial or scope denial for better error mapping
      const errorCode =
        resourceOwnerId && resourceOwnerId !== user.id
          ? "F_SCOPE_DENIED"
          : "F_PERMISSION_DENIED";

      throw new FinanceDomainError(
        errorCode,
        "You do not have the required permissions or scope to perform this action.",
      );
    }
  } catch (err) {
    if (err instanceof FinanceDomainError) {
      throw err;
    }
    // Fail-closed on any unexpected RBAC exception
    console.error("[FINANCE_AUTH] Unexpected RBAC error", err);
    throw new FinanceDomainError(
      "F_PERMISSION_DENIED",
      "Internal authorization error. Access denied.",
    );
  }
}
