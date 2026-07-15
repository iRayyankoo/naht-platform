import { PrismaClient, FinanceActivityAction } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing new FinanceActivityAction enum values strictly via Rollback Transaction...");
  const testActorId = "test-actor-123";
  const newActions = [
    FinanceActivityAction.LEDGER_CREATED,
    FinanceActivityAction.LEDGER_UPDATED,
    FinanceActivityAction.LEDGER_DEACTIVATED,
    FinanceActivityAction.LEDGER_REACTIVATED,
    FinanceActivityAction.ACCOUNT_DEACTIVATED,
    FinanceActivityAction.ACCOUNT_REACTIVATED,
  ];

  await prisma.user.upsert({
    where: { id: testActorId },
    update: {},
    create: { id: testActorId, email: "test-audit-actor@example.com", name: "Audit Actor" }
  });

  try {
    await prisma.$transaction(async (tx) => {
      console.log("Transaction opened.");
      const createdLogIds: string[] = [];
      
      for (const action of newActions) {
        const log = await tx.financeActivityLog.create({
          data: {
            actorId: testActorId,
            action: action,
            entityType: "TEST",
            entityId: "test-entity-1",
          }
        });
        createdLogIds.push(log.id);
      }

      const readLogs = await tx.financeActivityLog.findMany({
        where: { id: { in: createdLogIds } }
      });

      if (readLogs.length !== newActions.length) {
        throw new Error(`Inside TX: Expected ${newActions.length} logs, found ${readLogs.length}`);
      }
      console.log("✅ Inside TX: All logs created and read successfully.");

      throw new Error("SENTINEL_ERROR");
    });
  } catch (e: any) {
    if (e.message !== "SENTINEL_ERROR") {
      throw e;
    }
    console.log("✅ Sentinel error caught. Rollback completed.");
  }

  const lingeringLogs = await prisma.financeActivityLog.findMany({
    where: { entityType: "TEST", entityId: "test-entity-1" }
  });

  if (lingeringLogs.length > 0) {
    throw new Error("❌ Rollback failed! Logs persisted outside transaction.");
  }

  console.log("✅ Verified outside TX: No logs persisted.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
