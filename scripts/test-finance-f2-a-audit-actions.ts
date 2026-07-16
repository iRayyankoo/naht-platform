import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Attempt to insert and read the new enum values
    // To avoid persisting, we run in a transaction that always throws
    await prisma.$transaction(async (tx) => {
      // Create dummy user for FK constraints
      const user = await tx.user.create({
        data: {
          email: 'audit-test-actor@example.com',
          name: 'Audit Actor',
        }
      });
      const actorId = user.id;

      // 1. Create a minimal log with JOURNAL_UPDATED
      const log1 = await tx.financeActivityLog.create({
        data: {
          action: 'JOURNAL_UPDATED',
          entityType: 'FinanceJournalEntry',
          entityId: 'test-journal-1',
          actorId: actorId,
          metadata: { note: 'updated' },
        },
      });
      console.log('✅ Successfully wrote JOURNAL_UPDATED log:', log1.action);

      // 2. Create a minimal log with JOURNAL_SUBMITTED
      const log2 = await tx.financeActivityLog.create({
        data: {
          action: 'JOURNAL_SUBMITTED',
          entityType: 'FinanceJournalEntry',
          entityId: 'test-journal-1',
          actorId: actorId,
          metadata: { note: 'submitted' },
        },
      });
      console.log('✅ Successfully wrote JOURNAL_SUBMITTED log:', log2.action);

      // 3. Create a log with JOURNAL_REVIEWED and RETURNED metadata
      const log3 = await tx.financeActivityLog.create({
        data: {
          action: 'JOURNAL_REVIEWED',
          entityType: 'FinanceJournalEntry',
          entityId: 'test-journal-1',
          actorId: actorId,
          metadata: { outcome: 'RETURNED_FOR_MODIFICATION', reason: 'Please fix amounts' },
        },
      });
      console.log('✅ Successfully wrote JOURNAL_REVIEWED log (return outcome):', log3.action);

      // Read them back
      const readBack = await tx.financeActivityLog.findMany({
        where: { entityId: 'test-journal-1' }
      });
      if (readBack.length !== 3) {
        throw new Error('Failed to read back the 3 logs');
      }
      console.log('✅ Successfully read back the 3 logs within transaction');

      throw new Error('ROLLBACK_TEST_SUCCESS');
    });
  } catch (error: any) {
    if (error.message === 'ROLLBACK_TEST_SUCCESS') {
      console.log('✅ Transaction rolled back successfully as planned.');
    } else {
      console.error('❌ Test failed with unexpected error:', error);
      process.exit(1);
    }
  }

  // Verify they were rolled back
  const remaining = await prisma.financeActivityLog.findMany({
    where: { entityId: 'test-journal-1' }
  });

  if (remaining.length > 0) {
    console.error('❌ Test failed! Logs persisted outside of transaction.');
    process.exit(1);
  } else {
    console.log('✅ Verified outside TX: No test logs persisted.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
