import { PrismaClient } from "@prisma/client";
import { AccountService } from "../src/services/finance/account-service";
import * as assert from "assert";
import { FinanceDomainError } from "../src/lib/finance-errors";

const prisma = new PrismaClient();

async function main() {
  console.log("Running AccountService tests...");
  
  if (process.env.FINANCE_RBAC_TARGET !== 'ISOLATED_TEST' || process.env.FINANCE_RBAC_SEED_CONFIRM !== 'APPLY_TO_ISOLATED_TEST_DB') {
    throw new Error("Must run against ISOLATED_TEST_DB with guards enabled.");
  }

  const SUPER_ADMIN_ID = "SUPER_ADMIN_ID";
  const USER_ID = "REGULAR_USER_ID";
  
  // Clean up previous test runs
  // ({ where: { actorId: USER_ID } });
  await prisma.financeAccount.deleteMany({ where: { code: { startsWith: "TST_" } } });
  await prisma.financeLedger.deleteMany({ where: { code: "TST_LEDGER" } });

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

  // Assign finance.account.manage to USER
  const permission = await prisma.permission.upsert({
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
    where: { roleId_permissionId: { roleId: appRole.id, permissionId: permission.id } },
    update: { scope: "COMPANY" as any },
    create: { roleId: appRole.id, permissionId: permission.id, scope: "COMPANY" as any }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: USER_ID, roleId: appRole.id } },
    update: {},
    create: { userId: USER_ID, roleId: appRole.id }
  });

  // Create Ledger for testing
  const ledger = await prisma.financeLedger.create({
    data: {
      code: "TST_LEDGER",
      nameAr: "Test Ledger",
      nameEn: "Test Ledger",
      isActive: true,
    }
  });

  console.log("Testing createAccount (Root)...");
  const parentAccount = await AccountService.createAccount(USER_ID, {
    ledgerId: ledger.id,
    code: "TST_1000",
    nameAr: "أصول",
    nameEn: "Assets",
    type: "ASSET",
    isPostingAllowed: true,
  });

  assert.strictEqual(parentAccount.code, "TST_1000");
  assert.strictEqual(parentAccount.normalBalance, "DEBIT"); // derived automatically

  console.log("Testing createAccount (Child) under posting parent (Should fail)...");
  try {
    await AccountService.createAccount(USER_ID, {
      ledgerId: ledger.id,
      parentId: parentAccount.id, // parentAccount is a posting account
      code: "TST_1100",
      nameAr: "نقد فرعي",
      nameEn: "Sub Cash",
      type: "ASSET",
      isPostingAllowed: true,
    });
    assert.fail("Should throw parent is posting error");
  } catch (e: any) {
    assert.ok(e instanceof FinanceDomainError);
    assert.strictEqual(e.code, "F_ACCOUNT_PARENT_IS_POSTING");
  }

  console.log("Converting parent to Header (isPostingAllowed: false)...");
  await AccountService.updateAccount(USER_ID, parentAccount.id, {
    isPostingAllowed: false
  });

  console.log("Testing createAccount (Child) under header parent...");
  const childAccount = await AccountService.createAccount(USER_ID, {
    ledgerId: ledger.id,
    parentId: parentAccount.id,
    code: "TST_1100",
    nameAr: "نقد",
    nameEn: "Cash",
    type: "ASSET",
    isPostingAllowed: true,
  });

  assert.strictEqual(childAccount.parentId, parentAccount.id);

  console.log("Verifying Parent became non-posting...");
  const updatedParent = await prisma.financeAccount.findUnique({ where: { id: parentAccount.id } });
  assert.strictEqual(updatedParent?.isPostingAllowed, false, "Parent should automatically become non-posting");

  console.log("Testing createAccount (Duplicate Code)...");
  try {
    await AccountService.createAccount(USER_ID, {
      ledgerId: ledger.id,
      code: "TST_1000",
      nameAr: "Duplicate",
      nameEn: "Duplicate",
      type: "ASSET",
      isPostingAllowed: true,
    });
    assert.fail("Should throw duplicate code error");
  } catch (e: any) {
    assert.ok(e instanceof FinanceDomainError);
    assert.strictEqual(e.code, "F_ACCOUNT_DUPLICATE_CODE");
  }

  console.log("Testing updateAccount (should work before journals)...");
  const updatedChild = await AccountService.updateAccount(USER_ID, childAccount.id, {
    nameEn: "Cash Updated",
    type: "LIABILITY",
    normalBalance: "CREDIT"
  });
  assert.strictEqual(updatedChild.nameEn, "Cash Updated");
  assert.strictEqual(updatedChild.type, "LIABILITY");
  assert.strictEqual(updatedChild.normalBalance, "CREDIT");

  console.log("Testing deactivateAccount...");
  const deactivated = await AccountService.deactivateAccount(USER_ID, childAccount.id);
  assert.strictEqual(deactivated.isActive, false);

  console.log("Testing reactivateAccount...");
  const reactivated = await AccountService.reactivateAccount(USER_ID, childAccount.id);
  assert.strictEqual(reactivated.isActive, true);

  console.log("Testing createAccount (Contra Asset overriding normal balance)...");
  const contraAccount = await AccountService.createAccount(USER_ID, {
    ledgerId: ledger.id,
    code: "TST_1001",
    nameAr: "مجمع إهلاك",
    nameEn: "Accumulated Depreciation",
    type: "ASSET",
    normalBalance: "CREDIT",
    isPostingAllowed: true,
  });
  assert.strictEqual(contraAccount.type, "ASSET");
  assert.strictEqual(contraAccount.normalBalance, "CREDIT");

  console.log("Testing createAccount under posting parent (Should fail)...");
  try {
    await AccountService.createAccount(USER_ID, {
      ledgerId: ledger.id,
      parentId: childAccount.id, // childAccount is a posting account
      code: "TST_1101",
      nameAr: "نقد فرعي",
      nameEn: "Sub Cash",
      type: "ASSET",
      isPostingAllowed: true,
    });
    assert.fail("Should throw parent is posting error");
  } catch (e: any) {
    assert.ok(e instanceof FinanceDomainError);
    assert.strictEqual(e.code, "F_ACCOUNT_PARENT_IS_POSTING");
  }

  console.log("Testing RBAC Read Access (listAccounts)...");
  const list = await AccountService.listAccounts(USER_ID, ledger.id);
  assert.ok(list.items.length > 0);
  assert.ok(list.total > 0, "listAccounts returned empty list for company scope");
  assert.ok(list.items.some(a => a.id === parentAccount.id), "listAccounts didn't contain created asset account");
  console.log(`User retrieved ${list.items.length} accounts.`);

  console.log("Testing RBAC Read Access (getAccount)...");
  const fetched = await AccountService.getAccount(USER_ID, childAccount.id);
  assert.strictEqual(fetched.code, "TST_1100");

  console.log("✅ AccountService tests passed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
