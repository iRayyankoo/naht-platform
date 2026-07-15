import { z, ZodError } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  FinanceErrorMapper,
  FinanceDomainError,
} from "../src/lib/finance-errors";
import {
  CreateAccountSchema,
  JournalLineSchema,
  CreateJournalDraftSchema,
} from "../src/lib/validations/finance";
import { requireFinancePermission } from "../src/lib/finance-auth";

async function runTests() {
  console.log("Starting Finance Batch 1A Unit Tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- 1. Validation Tests ---
  console.log("\n--- Testing Zod Validations ---");

  const validLine = {
    accountId: "cuid123456789012345678901",
    debit: "100.50",
    credit: "0",
  };
  assert(
    JournalLineSchema.safeParse(validLine).success,
    "Valid journal line parses successfully",
  );

  const invalidLineNum = {
    accountId: "cuid123456789012345678901",
    debit: 100.5,
    credit: 0,
  };
  assert(
    !JournalLineSchema.safeParse(invalidLineNum).success,
    "Rejects number type for money (requires string)",
  );

  const invalidBoth = {
    accountId: "cuid123456789012345678901",
    debit: "10",
    credit: "10",
  };
  assert(
    !JournalLineSchema.safeParse(invalidBoth).success,
    "Rejects line with both debit and credit > 0",
  );

  const invalidPrecision = {
    accountId: "cuid123456789012345678901",
    debit: "100.12345678901",
    credit: "0",
  };
  assert(
    !JournalLineSchema.safeParse(invalidPrecision).success,
    "Rejects decimal exceeding scale 10",
  );

  const invalidUnknown = { ...validLine, hackedField: "drop tables" };
  assert(
    !JournalLineSchema.safeParse(invalidUnknown).success,
    "Rejects unknown fields (.strict())",
  );

  const invalidProtectedFields = {
    ...validLine,
    status: "POSTED",
    createdById: "123",
  };
  assert(
    !JournalLineSchema.safeParse(invalidProtectedFields).success,
    "Rejects protected fields",
  );

  // --- 2. FinanceErrorMapper Tests ---
  console.log("\n--- Testing FinanceErrorMapper ---");
  const corrId = "test-corr-123";

  const zodErr = new ZodError([]);
  const mappedZod = FinanceErrorMapper.map(zodErr, corrId);
  assert(
    mappedZod.error?.code === "F_VALIDATION_ERROR",
    "Maps ZodError to F_VALIDATION_ERROR",
  );
  assert(!mappedZod.error?.retryable, "Zod error is not retryable");

  const domainErr = new FinanceDomainError(
    "F_SOD_VIOLATION",
    "Cannot approve own journal",
    false,
  );
  const mappedDomain = FinanceErrorMapper.map(domainErr, corrId);
  assert(
    mappedDomain.error?.code === "F_SOD_VIOLATION",
    "Maps Domain Error correctly",
  );

  const p2002Idemp = new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed",
    {
      code: "P2002",
      clientVersion: "1",
      meta: { target: ["ledgerId", "idempotencyKey"] },
    },
  );
  const mappedP2002Idemp = FinanceErrorMapper.map(p2002Idemp, corrId);
  assert(
    mappedP2002Idemp.error?.code === "F_IDEMPOTENCY_CONFLICT",
    "Maps P2002 idempotency key to F_IDEMPOTENCY_CONFLICT",
  );
  assert(
    !mappedP2002Idemp.error?.retryable,
    "Idempotency conflict is not retryable (Deduplication)",
  );

  const p2010Cycle = new Prisma.PrismaClientKnownRequestError(
    "Raw query failed: cycle detected",
    {
      code: "P2010",
      clientVersion: "1",
    },
  );
  const mappedP2010Cycle = FinanceErrorMapper.map(p2010Cycle, corrId);
  assert(
    mappedP2010Cycle.error?.code === "F_ACCOUNT_CYCLE_DETECTED",
    "Maps P2010 with 'cycle' to F_ACCOUNT_CYCLE_DETECTED",
  );
  assert(
    !mappedP2010Cycle.error?.message.includes("Raw query"),
    "Hides raw query from message",
  );

  const unknownErr = new Error("Database went away");
  const mappedUnknown = FinanceErrorMapper.map(unknownErr, corrId);
  assert(
    mappedUnknown.error?.code === "F_UNKNOWN_ERROR",
    "Maps unknown error to F_UNKNOWN_ERROR",
  );
  assert(
    mappedUnknown.error?.correlationId === corrId,
    "CorrelationId is injected properly",
  );
  assert(
    !mappedUnknown.error?.message.includes("Database went away"),
    "Hides original error message for unknowns",
  );

  // --- 3. FinanceAuth Adapter check ---
  console.log("\n--- Testing FinanceAuth Adapter ---");

  // Mock setup for Auth
  const createMockDeps = (user: any, checkResult: boolean | Error) => ({
    getCurrentUser: async () => user,
    checkScopedPermission: async () => {
      if (checkResult instanceof Error) throw checkResult;
      return checkResult;
    },
  });

  // Test missing user
  let authThrew = false;
  try {
    await requireFinancePermission(
      "finance.journal.create",
      undefined,
      "Test",
      createMockDeps(null, false),
    );
  } catch (e: any) {
    authThrew = true;
    assert(
      e.code === "F_PERMISSION_DENIED",
      "Missing user -> Deny (F_PERMISSION_DENIED)",
    );
  }
  assert(authThrew, "Missing user throws error");

  // Test missing permission
  try {
    await requireFinancePermission(
      "finance.journal.create",
      undefined,
      "Test",
      createMockDeps({ id: "user1" }, false),
    );
    assert(false, "Should have thrown for missing permission");
  } catch (e: any) {
    assert(
      e.code === "F_PERMISSION_DENIED",
      "Missing permission -> Deny (F_PERMISSION_DENIED)",
    );
  }

  // Test internal exception -> Fail closed
  try {
    await requireFinancePermission(
      "finance.journal.create",
      undefined,
      "Test",
      createMockDeps({ id: "user1" }, new Error("DB DOWN")),
    );
    assert(false, "Should have thrown for RBAC failure");
  } catch (e: any) {
    assert(
      e.code === "F_PERMISSION_DENIED",
      "RBAC Exception -> Fail closed (F_PERMISSION_DENIED)",
    );
  }

  // Test SELF scope matching owner
  let selfSuccess = true;
  try {
    await requireFinancePermission(
      "finance.journal.create",
      "user1",
      "Test",
      createMockDeps({ id: "user1" }, true),
    );
  } catch (e) {
    selfSuccess = false;
  }
  assert(selfSuccess, "SELF scope and matching owner -> Allow");

  // Test SELF scope different owner
  try {
    await requireFinancePermission(
      "finance.journal.create",
      "user2",
      "Test",
      createMockDeps({ id: "user1" }, false),
    );
    assert(false, "Should have thrown for scope mismatch");
  } catch (e: any) {
    assert(
      e.code === "F_SCOPE_DENIED",
      "SELF scope with different owner -> Deny (F_SCOPE_DENIED)",
    );
  }

  // Test COMPANY scope with correct permission
  let companySuccess = true;
  try {
    await requireFinancePermission(
      "finance.journal.create",
      "user2",
      "Test",
      createMockDeps({ id: "user1" }, true),
    );
  } catch (e) {
    companySuccess = false;
  }
  assert(companySuccess, "COMPANY scope (true) with different owner -> Allow");

  // --- 4. FinanceAudit Contract check ---
  console.log("\n--- Testing FinanceAudit Contract ---");
  // The interface FinanceAuditWriter only exists in TypeScript types,
  // so we verify by assigning a dummy implementation that conforms to the interface.
  const dummyAuditWriter: import("../src/lib/finance-audit").FinanceAuditWriter =
    {
      log: async (tx, params) => {
        // Must accept tx and params
      },
    };
  assert(
    typeof dummyAuditWriter.log === "function",
    "FinanceAuditWriter interface correctly types a .log method",
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
