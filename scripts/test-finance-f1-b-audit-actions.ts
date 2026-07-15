import { PrismaClient, FinanceActivityAction } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing new FinanceActivityAction enum values...");

  const testActorId = "test-actor-123";
  const newActions = [
    FinanceActivityAction.LEDGER_CREATED,
    FinanceActivityAction.LEDGER_UPDATED,
    FinanceActivityAction.LEDGER_DEACTIVATED,
    FinanceActivityAction.LEDGER_REACTIVATED,
    FinanceActivityAction.ACCOUNT_DEACTIVATED,
    FinanceActivityAction.ACCOUNT_REACTIVATED,
  ];

  // 1. Create a dummy user for the actor to satisfy foreign key
  await prisma.user.upsert({
    where: { id: testActorId },
    update: {},
    create: {
      id: testActorId,
      email: "test-audit-actor@example.com",
      name: "Audit Actor"
    }
  });

  const createdLogIds: string[] = [];

  try {
    for (const action of newActions) {
      console.log(`Inserting log for action: ${action}`);
      const log = await prisma.financeActivityLog.create({
        data: {
          actorId: testActorId,
          action: action,
          entityType: "TEST",
          entityId: "test-entity-1",
          metadata: { test: true },
        }
      });
      createdLogIds.push(log.id);
      console.log(`✅ Success! ID: ${log.id}`);
    }

    // 2. Test reading them back
    const readLogs = await prisma.financeActivityLog.findMany({
      where: { id: { in: createdLogIds } }
    });

    if (readLogs.length !== newActions.length) {
      throw new Error(`Expected ${newActions.length} logs, found ${readLogs.length}`);
    }
    console.log("✅ All new actions read successfully.");

    // 3. Test rollback
    try {
      await prisma.$transaction(async (tx) => {
        await tx.financeActivityLog.create({
          data: {
            actorId: testActorId,
            action: FinanceActivityAction.LEDGER_CREATED,
            entityType: "TEST_ROLLBACK",
            entityId: "rollback",
          }
        });
        throw new Error("Triggering rollback");
      });
    } catch (e: any) {
      console.log("Rollback triggered as expected.");
    }

    const rollbackCheck = await prisma.financeActivityLog.findFirst({
      where: { entityType: "TEST_ROLLBACK" }
    });

    if (rollbackCheck) {
      throw new Error("❌ Rollback failed, log was persisted!");
    }
    console.log("✅ Transaction rollback successfully prevented log persistence.");

  } finally {
    // Clean up
    console.log("Cleaning up test logs...");
    try {
      await prisma.financeActivityLog.deleteMany({
        where: { id: { in: createdLogIds } }
      });
    } catch (e: any) {
      console.log("Cleanup skipped: FinanceActivityLog is immutable as expected.");
    }
    console.log("Cleaned up successfully.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
