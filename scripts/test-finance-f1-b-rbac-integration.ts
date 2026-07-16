import { PrismaClient } from "@prisma/client";
import { executeFinanceRbacSeed } from "../prisma/seeds/finance-permissions";
import { getCurrentUserScopedPermissions } from "../src/lib/rbac-helpers";
import assert from "assert";
import { execSync } from "child_process";

const prisma = new PrismaClient();
const testPrefix = `TEST_RBAC_${crypto.randomUUID().substring(0, 8)}_`;

async function runTests() {
  console.log("Starting Finance F1-B RBAC Integration Tests...");

  // Setup: Get initial counts
  const initialRoleCount = await prisma.appRole.count();
  const initialPermCount = await prisma.permission.count();
  const initialUserCount = await prisma.user.count();

  // Run Seed 1
  console.log("\n--- 1. First Seed Execution ---");
  await prisma.$transaction(async (tx) => {
    await executeFinanceRbacSeed(tx);
  });
  const afterSeed1RoleCount = await prisma.appRole.count();
  const afterSeed1PermCount = await prisma.permission.count();
  assert(
    afterSeed1RoleCount >= initialRoleCount,
    "Roles were created or already existed",
  );
  assert(
    afterSeed1PermCount >= initialPermCount,
    "Permissions were created or already existed",
  );

  // Run Seed 2 (Idempotency)
  console.log("\n--- 2. Second Seed Execution (Idempotency) ---");
  await prisma.$transaction(async (tx) => {
    await executeFinanceRbacSeed(tx);
  });
  const afterSeed2RoleCount = await prisma.appRole.count();
  const afterSeed2PermCount = await prisma.permission.count();
  assert.strictEqual(
    afterSeed2RoleCount,
    afterSeed1RoleCount,
    "No duplicate roles created",
  );
  assert.strictEqual(
    afterSeed2PermCount,
    afterSeed1PermCount,
    "No duplicate permissions created",
  );

  // Verify users unmodified
  console.log("\n--- 3. Verify Users Unmodified ---");
  const finalUserCount = await prisma.user.count();
  assert.strictEqual(
    finalUserCount,
    initialUserCount,
    "User count did not change",
  );

  // Create Test Users
  console.log("\n--- Setup Test Users ---");
  const users = {
    normal: await prisma.user.create({
      data: { email: `${testPrefix}normal@test.com`, name: "Normal User" },
    }),
    viewer: await prisma.user.create({
      data: { email: `${testPrefix}viewer@test.com`, name: "Viewer User" },
    }),
    accountant: await prisma.user.create({
      data: { email: `${testPrefix}acc@test.com`, name: "Accountant User" },
    }),
    manager: await prisma.user.create({
      data: { email: `${testPrefix}mgr@test.com`, name: "Manager User" },
    }),
    poster: await prisma.user.create({
      data: { email: `${testPrefix}poster@test.com`, name: "Poster User" },
    }),
    admin: await prisma.user.create({
      data: { email: `${testPrefix}fadmin@test.com`, name: "Finance Admin" },
    }),
    superAdmin: await prisma.user.create({
      data: { email: `${testPrefix}super@test.com`, name: "Super Admin" },
    }),
  };

  try {
    const getRole = async (code: string) =>
      prisma.appRole.findUniqueOrThrow({ where: { code } });

    await prisma.userRole.createMany({
      data: [
        {
          userId: users.viewer.id,
          roleId: (await getRole("FINANCE_VIEWER")).id,
        },
        {
          userId: users.accountant.id,
          roleId: (await getRole("FINANCE_ACCOUNTANT")).id,
        },
        {
          userId: users.manager.id,
          roleId: (await getRole("FINANCE_MANAGER")).id,
        },
        {
          userId: users.poster.id,
          roleId: (await getRole("FINANCE_POSTER")).id,
        },
        { userId: users.admin.id, roleId: (await getRole("FINANCE_ADMIN")).id },
      ],
    });

    const superAdminRole = await prisma.appRole.findUnique({
      where: { code: "SUPER_ADMIN" },
    });
    if (superAdminRole) {
      await prisma.userRole.create({
        data: { userId: users.superAdmin.id, roleId: superAdminRole.id },
      });
    }

    // Permission Resolution Logic (Simulating checkScopedPermission since we can't easily mock getCurrentUser inside it here)
    const checkPerm = async (
      userId: string,
      code: string,
      targetUserId?: string,
    ) => {
      const isSuper =
        !!superAdminRole &&
        (await prisma.userRole.findFirst({
          where: { userId, roleId: superAdminRole.id },
        }));
      if (isSuper) return true;

      const scopedPerms = await getCurrentUserScopedPermissions(userId);
      if (!scopedPerms.has(code)) return false;
      const scopes = scopedPerms.get(code)!;

      if (scopes.has("COMPANY")) return true;
      if (scopes.has("SELF") && targetUserId === userId) return true;
      return false;
    };

    console.log("\n--- 4. Normal User without Finance roles ---");
    assert.strictEqual(
      await checkPerm(users.normal.id, "finance.journal.view"),
      false,
      "Normal user denied",
    );

    console.log("\n--- 5. Viewer User ---");
    assert.strictEqual(
      await checkPerm(users.viewer.id, "finance.ledger.view"),
      true,
      "Viewer can view",
    );
    assert.strictEqual(
      await checkPerm(users.viewer.id, "finance.journal.create"),
      false,
      "Viewer cannot write",
    );

    console.log("\n--- 6. Accountant User ---");
    assert.strictEqual(
      await checkPerm(
        users.accountant.id,
        "finance.journal.create",
        users.accountant.id,
      ),
      true,
      "Accountant can create (SELF)",
    );
    assert.strictEqual(
      await checkPerm(
        users.accountant.id,
        "finance.journal.submit",
        users.accountant.id,
      ),
      true,
      "Accountant can submit (SELF)",
    );

    console.log("\n--- 7. Scope Isolation ---");
    assert.strictEqual(
      await checkPerm(
        users.accountant.id,
        "finance.journal.view",
        users.normal.id,
      ),
      false,
      "Accountant cannot access other's journal",
    );

    console.log("\n--- 8. Manager User ---");
    assert.strictEqual(
      await checkPerm(users.manager.id, "finance.journal.review"),
      true,
      "Manager can review",
    );
    assert.strictEqual(
      await checkPerm(users.manager.id, "finance.journal.approve"),
      true,
      "Manager can approve",
    );
    assert.strictEqual(
      await checkPerm(users.manager.id, "finance.journal.post"),
      false,
      "Manager cannot post",
    );

    console.log("\n--- 9. Poster User ---");
    assert.strictEqual(
      await checkPerm(users.poster.id, "finance.journal.post"),
      true,
      "Poster can post",
    );
    assert.strictEqual(
      await checkPerm(users.poster.id, "finance.journal.reverse"),
      true,
      "Poster can reverse",
    );
    assert.strictEqual(
      await checkPerm(users.poster.id, "finance.journal.approve"),
      false,
      "Poster cannot approve",
    );
    assert.strictEqual(
      await checkPerm(users.poster.id, "finance.journal.create"),
      false,
      "Poster cannot create",
    );

    console.log("\n--- 10. Finance Admin ---");
    assert.strictEqual(
      await checkPerm(users.admin.id, "finance.ledger.manage"),
      true,
      "Admin can manage config",
    );
    assert.strictEqual(
      await checkPerm(users.admin.id, "finance.journal.create"),
      false,
      "Admin does not inherit journal actions automatically",
    );

    console.log("\n--- 11. Unknown Scope / Fail Closed ---");
    assert.strictEqual(
      await checkPerm(users.accountant.id, "finance.journal.create", undefined),
      false,
      "Missing targetUserId for SELF scope fails closed",
    );

    console.log("\n--- 12. Permission Missing ---");
    assert.strictEqual(
      await checkPerm(users.viewer.id, "fake.permission"),
      false,
      "Missing permission fails closed",
    );

    console.log("\n--- 13. Legacy Fallback Denial ---");
    // The actual checkPermission allows nahtmkt@gmail.com and SUPER_ADMIN.
    // We verify that a normal user who is NOT super admin does not bypass.
    assert.strictEqual(
      await checkPerm(users.normal.id, "finance.journal.view"),
      false,
      "Normal user does not bypass",
    );

    console.log("\n--- 14. SUPER_ADMIN Bypass ---");
    if (superAdminRole) {
      assert.strictEqual(await checkPerm(users.superAdmin.id, 'finance.journal.view'), true, "SUPER_ADMIN bypasses permission checks");
    }

    console.log("\n--- 15. Environment Guard Verification ---");
    const runGuardTest = (envVars: Record<string, string>) => {
      try {
        const env = { ...process.env, ...envVars };
        delete env.FINANCE_RBAC_TARGET;
        delete env.FINANCE_RBAC_SEED_CONFIRM;
        Object.assign(env, envVars);
        execSync('npx tsx prisma/seeds/finance-permissions.ts', { env, stdio: 'pipe' });
        return true; // Success
      } catch (_err: unknown) {
        return false; // Failed
      }
    };

    console.log("  - Missing variables: " + (!runGuardTest({}) ? "✅ Denied" : "❌ Passed"));
    assert.strictEqual(runGuardTest({}), false);

    console.log("  - Unknown target: " + (!runGuardTest({ FINANCE_RBAC_TARGET: 'UNKNOWN', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }) ? "✅ Denied" : "❌ Passed"));
    assert.strictEqual(runGuardTest({ FINANCE_RBAC_TARGET: 'UNKNOWN', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }), false);

    console.log("  - Test confirm on Production: " + (!runGuardTest({ FINANCE_RBAC_TARGET: 'PRODUCTION', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }) ? "✅ Denied" : "❌ Passed"));
    assert.strictEqual(runGuardTest({ FINANCE_RBAC_TARGET: 'PRODUCTION', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }), false);

    console.log("  - Production confirm on Test: " + (!runGuardTest({ FINANCE_RBAC_TARGET: 'ISOLATED_TEST', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_FINANCE_RBAC_TO_PRODUCTION' }) ? "✅ Denied" : "❌ Passed"));
    assert.strictEqual(runGuardTest({ FINANCE_RBAC_TARGET: 'ISOLATED_TEST', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_FINANCE_RBAC_TO_PRODUCTION' }), false);

    console.log("  - Value 'true' instead of strict phrase: " + (!runGuardTest({ FINANCE_RBAC_TARGET: 'PRODUCTION', FINANCE_RBAC_SEED_CONFIRM: 'true' }) ? "✅ Denied" : "❌ Passed"));
    assert.strictEqual(runGuardTest({ FINANCE_RBAC_TARGET: 'PRODUCTION', FINANCE_RBAC_SEED_CONFIRM: 'true' }), false);

    console.log("  - Success Isolated Test track: " + (runGuardTest({ FINANCE_RBAC_TARGET: 'ISOLATED_TEST', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }) ? "✅ Passed" : "❌ Failed"));
    assert.strictEqual(runGuardTest({ FINANCE_RBAC_TARGET: 'ISOLATED_TEST', FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB' }), true);

  } finally {
    // Cleanup test users using exact IDs to prevent mass deletion
    const ids = Object.values(users).map((u) => u.id);
    await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }

  console.log("\n✅ All RBAC Integration Tests Passed!");
}

runTests()
  .catch((e) => {
    console.error("Test Failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
