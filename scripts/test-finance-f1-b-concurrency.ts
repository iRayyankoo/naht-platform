import { PrismaClient } from "@prisma/client";
import { LedgerService } from "../src/services/finance/ledger-service";
import { AccountService } from "../src/services/finance/account-service";
import * as assert from "assert";

const prisma = new PrismaClient();

const USER_ID = "REGULAR_USER_ID"; 

async function setupUsers() {
  const SUPER_ADMIN_ID = "SUPER_ADMIN_ID";

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
  const ledgerPerm = await prisma.permission.upsert({
    where: { code: "finance.ledger.manage" },
    update: {},
    create: { code: "finance.ledger.manage", action: "manage", module: "FINANCE" }
  });

  // Assign finance.account.manage to USER
  const accountPerm = await prisma.permission.upsert({
    where: { code: "finance.account.manage" },
    update: {},
    create: { code: "finance.account.manage", action: "manage", module: "FINANCE" }
  });
  
  const appRole = await prisma.appRole.upsert({
    where: { code: "FINANCE_MANAGER" },
    update: {},
    create: { name: "FINANCE_MANAGER", code: "FINANCE_MANAGER", description: "Finance Manager" }
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: appRole.id, permissionId: ledgerPerm.id } },
    update: { scope: "COMPANY" as any },
    create: { roleId: appRole.id, permissionId: ledgerPerm.id, scope: "COMPANY" as any }
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: appRole.id, permissionId: accountPerm.id } },
    update: { scope: "COMPANY" as any },
    create: { roleId: appRole.id, permissionId: accountPerm.id, scope: "COMPANY" as any }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: USER_ID, roleId: appRole.id } },
    update: {},
    create: { userId: USER_ID, roleId: appRole.id }
  });
}

async function runConcurrencyTests() {
  console.log("Starting Concurrency Tests...");

  await setupUsers();

  // 1. Concurrent Ledger Creation
  console.log("1. Concurrent Ledger Creation (Duplicate Code)");
  const concurrentCode = "CONC_LEDGER_" + Date.now();
  
  const p1 = LedgerService.createLedger(USER_ID, {
    code: concurrentCode,
    nameAr: "تزامن",
    nameEn: "Concurrency",
  });
  
  const p2 = LedgerService.createLedger(USER_ID, {
    code: concurrentCode,
    nameAr: "تزامن 2",
    nameEn: "Concurrency 2",
  });

  const results1 = await Promise.allSettled([p1, p2]);
  const succeeded1 = results1.filter(r => r.status === "fulfilled").length;
  const failed1 = results1.filter(r => r.status === "rejected").length;
  
  if (succeeded1 !== 1) {
    console.error(results1);
  }
  assert.strictEqual(succeeded1, 1, "Exactly one ledger creation should succeed");
  assert.strictEqual(failed1, 1, "Exactly one ledger creation should fail");
  
  const ledgerId = (results1.find(r => r.status === "fulfilled") as PromiseFulfilledResult<any>).value.id;

  // 2. Concurrent Account Creation (Duplicate Code)
  console.log("2. Concurrent Account Creation (Duplicate Code)");
  const accCode = "ACC_CONC_" + Date.now();
  
  const a1 = AccountService.createAccount(USER_ID, {
    ledgerId,
    code: accCode,
    nameAr: "حساب",
    nameEn: "Account",
    type: "ASSET",
    isPostingAllowed: true,
  });

  const a2 = AccountService.createAccount(USER_ID, {
    ledgerId,
    code: accCode,
    nameAr: "حساب 2",
    nameEn: "Account 2",
    type: "ASSET",
    isPostingAllowed: true,
  });

  const results2 = await Promise.allSettled([a1, a2]);
  const succeeded2 = results2.filter(r => r.status === "fulfilled").length;
  const failed2 = results2.filter(r => r.status === "rejected").length;
  assert.strictEqual(succeeded2, 1, "Exactly one account creation should succeed");
  assert.strictEqual(failed2, 1, "Exactly one account creation should fail");

  const parentId = (results2.find(r => r.status === "fulfilled") as PromiseFulfilledResult<any>).value.id;

  // 3. Concurrent Deactivate/Reactivate
  console.log("3. Concurrent Deactivate/Reactivate");
  const d1 = AccountService.deactivateAccount(USER_ID, parentId);
  const d2 = AccountService.deactivateAccount(USER_ID, parentId);
  const r1 = AccountService.reactivateAccount(USER_ID, parentId);

  const results3 = await Promise.allSettled([d1, d2, r1]);
  assert.strictEqual(results3.filter(r => r.status === "rejected").length, 0, "Deactivate/Reactivate should not throw deadlocks");

  console.log("✅ Concurrency Tests Passed!");
}

async function main() {
  if (process.env.FINANCE_RBAC_TARGET !== "ISOLATED_TEST") throw new Error("Must use ISOLATED_TEST");
  
  try {
    await runConcurrencyTests();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
