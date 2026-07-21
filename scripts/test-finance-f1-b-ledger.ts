import { PrismaClient, FinanceActivityAction } from "@prisma/client";
import { LedgerService } from "../src/services/finance/ledger-service";
import * as assert from "assert";
import { FinanceDomainError } from "../src/lib/finance-errors";

const prisma = new PrismaClient();

async function main() {
  console.log("Running LedgerService tests...");
  
  if (process.env.FINANCE_RBAC_TARGET !== 'ISOLATED_TEST' || process.env.FINANCE_RBAC_SEED_CONFIRM !== 'APPLY_TO_ISOLATED_TEST_DB') {
    throw new Error("Must run against ISOLATED_TEST_DB with guards enabled.");
  }

  const SUPER_ADMIN_ID = "SUPER_ADMIN_ID";
  const USER_ID = "REGULAR_USER_ID";
  
  // Create test users
  await prisma.user.upsert({
    where: { id: SUPER_ADMIN_ID },
    update: {},
    create: { id: SUPER_ADMIN_ID, email: "super@test.com", name: "Super" }
  });

  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: { id: USER_ID, email: "user@test.com", name: "User" }
  });

  // Assign finance.ledger.manage to USER
  const permission = await prisma.permission.upsert({
    where: { code: "finance.ledger.manage" },
    update: {},
    create: { code: "finance.ledger.manage", action: "manage", module: "FINANCE" }
  });
  const permissionView = await prisma.permission.upsert({
    where: { code: "finance.ledger.view" },
    update: {},
    create: { code: "finance.ledger.view", action: "view", module: "FINANCE" }
  });
  
  const companyScope = "COMPANY";
  const appRole = await prisma.appRole.upsert({
    where: { code: "FINANCE_MANAGER" },
    update: {},
    create: { name: "FINANCE_MANAGER", code: "FINANCE_MANAGER", description: "Finance Manager" }
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: appRole.id, permissionId: permission.id } },
    update: { scope: companyScope as any },
    create: { roleId: appRole.id, permissionId: permission.id, scope: companyScope as any }
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: appRole.id, permissionId: permissionView.id } },
    update: { scope: companyScope as any },
    create: { roleId: appRole.id, permissionId: permissionView.id, scope: companyScope as any }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: USER_ID, roleId: appRole.id } },
    update: {},
    create: { userId: USER_ID, roleId: appRole.id }
  });

  const ledgerCode = "TEST_LEDGER_001";
  
  // Clean up if exists
  await prisma.financeLedger.deleteMany({ where: { code: ledgerCode } });

  console.log("Testing createLedger...");
  const ledger = await LedgerService.createLedger(USER_ID, {
    code: ledgerCode,
    nameAr: "دفتر اختبار",
    nameEn: "Test Ledger"
  });

  assert.strictEqual(ledger.code, ledgerCode);
  
  // Audit Check
  const audit = await prisma.financeActivityLog.findFirst({
    where: { entityId: ledger.id, action: "LEDGER_CREATED" }
  });
  assert.ok(audit, "Audit log not created");

  console.log("Testing updateLedger...");
  const updated = await LedgerService.updateLedger(USER_ID, ledger.id, {
    nameEn: "Updated Ledger"
  });
  assert.strictEqual(updated.nameEn, "Updated Ledger");

  console.log("Testing deactivateLedger...");
  const deactivated = await LedgerService.deactivateLedger(USER_ID, ledger.id);
  assert.strictEqual(deactivated.isActive, false);

  console.log("Testing reactivateLedger...");
  const reactivated = await LedgerService.reactivateLedger(USER_ID, ledger.id);
  assert.strictEqual(reactivated.isActive, true);

  console.log("Testing getLedger (Read access)...");
  const fetched = await LedgerService.getLedger(USER_ID, ledger.id);
  assert.strictEqual(fetched.code, ledgerCode);

  console.log("Testing listLedgers (Read access)...");
  const list = await LedgerService.listLedgers(USER_ID);
  assert.ok(list.items.length > 0);

  console.log("Testing Duplicate Code...");
  try {
    await LedgerService.createLedger(USER_ID, {
      code: ledgerCode,
      nameAr: "Another",
      nameEn: "Another"
    });
    assert.fail("Should throw duplicate code error");
  } catch (e: any) {
    assert.ok(e instanceof FinanceDomainError);
    assert.strictEqual(e.code, "F_LEDGER_DUPLICATE_CODE");
  }

  console.log("✅ LedgerService tests passed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
