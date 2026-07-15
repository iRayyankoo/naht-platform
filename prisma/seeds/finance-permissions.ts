import { PrismaClient, PermissionScope, Prisma } from '@prisma/client';

const financePermissions = [
  { code: 'finance.ledger.view', description: 'View ledgers', module: 'FINANCE', action: 'VIEW' },
  { code: 'finance.ledger.manage', description: 'Create/Edit ledgers', module: 'FINANCE', action: 'MANAGE' },
  { code: 'finance.period.view', description: 'View fiscal periods', module: 'FINANCE', action: 'VIEW' },
  { code: 'finance.period.manage', description: 'Generate/Close periods', module: 'FINANCE', action: 'MANAGE' },
  { code: 'finance.account.view', description: 'View chart of accounts', module: 'FINANCE', action: 'VIEW' },
  { code: 'finance.account.manage', description: 'Create/Update accounts', module: 'FINANCE', action: 'MANAGE' },
  { code: 'finance.journal.view', description: 'View journals', module: 'FINANCE', action: 'VIEW' },
  { code: 'finance.journal.create', description: 'Create/Edit draft journals', module: 'FINANCE', action: 'CREATE' },
  { code: 'finance.journal.submit', description: 'Submit draft for review', module: 'FINANCE', action: 'SUBMIT' },
  { code: 'finance.journal.review', description: 'Review & reject with reason', module: 'FINANCE', action: 'REVIEW' },
  { code: 'finance.journal.approve', description: 'Approve journals', module: 'FINANCE', action: 'APPROVE' },
  { code: 'finance.journal.void', description: 'Void journals', module: 'FINANCE', action: 'VOID' },
  { code: 'finance.journal.post', description: 'Post journals atomically', module: 'FINANCE', action: 'POST' },
  { code: 'finance.journal.reverse', description: 'Reverse posted journals', module: 'FINANCE', action: 'REVERSE' },
  { code: 'finance.audit.view', description: 'View finance audit logs', module: 'FINANCE', action: 'VIEW' },
];

const financeRoles = [
  { code: 'FINANCE_VIEWER', name: 'Finance Viewer', description: 'Read-only access to finance records' },
  { code: 'FINANCE_ACCOUNTANT', name: 'Finance Accountant', description: 'Create and submit journal drafts' },
  { code: 'FINANCE_MANAGER', name: 'Finance Manager', description: 'Review, approve, and void journals' },
  { code: 'FINANCE_POSTER', name: 'Finance Poster', description: 'Strictly post and reverse journals for SoD separation' },
  { code: 'FINANCE_ADMIN', name: 'Finance Administrator', description: 'Full access to setup, ledgers, periods, and accounts' },
];

const rolePermissionMap: Record<string, { code: string; scope: PermissionScope }[]> = {
  FINANCE_VIEWER: [
    { code: 'finance.ledger.view', scope: 'COMPANY' },
    { code: 'finance.period.view', scope: 'COMPANY' },
    { code: 'finance.account.view', scope: 'COMPANY' },
    { code: 'finance.journal.view', scope: 'COMPANY' },
  ],
  FINANCE_ACCOUNTANT: [
    { code: 'finance.ledger.view', scope: 'COMPANY' },
    { code: 'finance.period.view', scope: 'COMPANY' },
    { code: 'finance.account.view', scope: 'COMPANY' },
    { code: 'finance.journal.view', scope: 'SELF' },
    { code: 'finance.journal.create', scope: 'SELF' },
    { code: 'finance.journal.submit', scope: 'SELF' },
    { code: 'finance.journal.void', scope: 'SELF' },
  ],
  FINANCE_MANAGER: [
    { code: 'finance.ledger.view', scope: 'COMPANY' },
    { code: 'finance.period.view', scope: 'COMPANY' },
    { code: 'finance.account.view', scope: 'COMPANY' },
    { code: 'finance.journal.view', scope: 'COMPANY' },
    { code: 'finance.journal.review', scope: 'COMPANY' },
    { code: 'finance.journal.approve', scope: 'COMPANY' },
    { code: 'finance.journal.void', scope: 'COMPANY' },
  ],
  FINANCE_POSTER: [
    { code: 'finance.ledger.view', scope: 'COMPANY' },
    { code: 'finance.period.view', scope: 'COMPANY' },
    { code: 'finance.account.view', scope: 'COMPANY' },
    { code: 'finance.journal.view', scope: 'COMPANY' },
    { code: 'finance.journal.post', scope: 'COMPANY' },
    { code: 'finance.journal.reverse', scope: 'COMPANY' },
  ],
  FINANCE_ADMIN: [
    { code: 'finance.ledger.view', scope: 'COMPANY' },
    { code: 'finance.period.view', scope: 'COMPANY' },
    { code: 'finance.account.view', scope: 'COMPANY' },
    { code: 'finance.journal.view', scope: 'COMPANY' },
    { code: 'finance.ledger.manage', scope: 'COMPANY' },
    { code: 'finance.period.manage', scope: 'COMPANY' },
    { code: 'finance.account.manage', scope: 'COMPANY' },
    { code: 'finance.audit.view', scope: 'COMPANY' },
  ],
};

/**
 * Core Seed Logic: Exported and testable.
 * Assumes it receives an existing transaction or Prisma client.
 */
export async function executeFinanceRbacSeed(tx: Prisma.TransactionClient) {
  // 1. Check for conflicts
  const existingRoles = await tx.appRole.findMany({
    where: { code: { in: financeRoles.map(r => r.code) } }
  });

  const conflictingRoles = existingRoles.filter(
    (r) => !financeRoles.find(fr => fr.code === r.code && fr.name === r.name)
  );

  if (conflictingRoles.length > 0) {
    throw new Error(`CRITICAL: Found conflicting roles with same code but different names: ${conflictingRoles.map(r => r.code).join(', ')}. Stopping seed to prevent hostile takeover.`);
  }

  // 2. Create Permissions Idempotently
  const createdPerms = new Map<string, string>(); // code -> id
  for (const perm of financePermissions) {
    const p = await tx.permission.upsert({
      where: { code: perm.code },
      update: {
        description: perm.description,
        module: perm.module,
        action: perm.action,
      },
      create: perm,
    });
    createdPerms.set(p.code, p.id);
  }

  // 3. Create Roles Idempotently and Link Permissions
  for (const roleDef of financeRoles) {
    const role = await tx.appRole.upsert({
      where: { code: roleDef.code },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
      },
      create: {
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
      },
    });

    const permsToLink = rolePermissionMap[roleDef.code] || [];
    for (const link of permsToLink) {
      const permissionId = createdPerms.get(link.code);
      if (!permissionId) continue;

      // Ensure the link exists, but DO NOT delete other links (Non-destructive)
      await tx.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: { scope: link.scope },
        create: {
          roleId: role.id,
          permissionId,
          scope: link.scope,
        },
      });
    }
  }
}

/**
 * Safe Entrypoint for Execution.
 */
async function main() {
  const target = process.env.FINANCE_RBAC_TARGET;
  const confirm = process.env.FINANCE_RBAC_SEED_CONFIRM;

  const isProd = target === "PRODUCTION" && confirm === "APPLY_FINANCE_RBAC_TO_PRODUCTION";
  const isTest = target === "ISOLATED_TEST" && confirm === "APPLY_TO_ISOLATED_TEST_DB";

  if (!isProd && !isTest) {
    console.error("ERROR: Execution rejected. Missing or invalid explicit security confirmation.");
    console.error("To run in tests: set FINANCE_RBAC_TARGET=ISOLATED_TEST and FINANCE_RBAC_SEED_CONFIRM=APPLY_TO_ISOLATED_TEST_DB");
    console.error("To run in production: set FINANCE_RBAC_TARGET=PRODUCTION and FINANCE_RBAC_SEED_CONFIRM=APPLY_FINANCE_RBAC_TO_PRODUCTION");
    process.exit(1);
  }

  const envTarget = isProd ? "PRODUCTION" : "LOCAL TEST";
  console.log(`Seeding Finance F1-B Permissions and Roles into: ${envTarget} Environment`);

  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      await executeFinanceRbacSeed(tx);
    });
    console.log('Finance permissions and roles seeded successfully via Transaction.');
  } catch (error) {
    console.error('Seed execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ensure it doesn't execute automatically during test imports
if (require.main === module) {
  main();
}
