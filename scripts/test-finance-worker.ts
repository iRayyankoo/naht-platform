import { JournalService } from "../src/services/finance/journal-service";
import { PrismaClient } from "@prisma/client";

const test = process.argv[2];
const dId = process.argv[3];
const threadNum = process.argv[4];
const role = process.argv[5];
const userId = process.argv[6];
const extra1 = process.argv[7];
const extra2 = process.argv[8];

const ctx = {
  actorId: userId,
  correlationId: "test-concurrency-" + threadNum
};

const prisma = new PrismaClient();

async function run() {
  try {
    if (threadNum === "1") {
       if (test === "Submit vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Return vs Approve") await JournalService.approveJournal(ctx, dId);
       else if (test === "Approve vs Approve") await JournalService.approveJournal(ctx, dId);
       else if (test === "Return vs Return") await JournalService.returnForModification(ctx, dId, "Reason 1");
       else if (test === "Submit vs Return") await JournalService.submitForReview(ctx, dId);
       else if (test === "Submit vs Approve") await JournalService.submitForReview(ctx, dId);
       else if (test === "Add Line vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Remove Line vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Update Draft vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Period Close vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Period Lock vs Approve") await JournalService.approveJournal(ctx, dId);
       else if (test === "Ledger Deactivate vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Ledger Deactivate vs Approve") await JournalService.approveJournal(ctx, dId);
    } else {
       if (test === "Submit vs Submit") await JournalService.submitForReview(ctx, dId);
       else if (test === "Return vs Approve") await JournalService.returnForModification(ctx, dId, "Reason 2");
       else if (test === "Approve vs Approve") await JournalService.approveJournal(ctx, dId);
       else if (test === "Return vs Return") await JournalService.returnForModification(ctx, dId, "Reason 2");
       else if (test === "Submit vs Return") await JournalService.returnForModification(ctx, dId, "Reason 2");
       else if (test === "Submit vs Approve") await JournalService.approveJournal(ctx, dId);
       else if (test === "Add Line vs Submit") await JournalService.addLine(ctx, dId, { accountId: extra1, debitAmount: "10", creditAmount: "0" });
       else if (test === "Remove Line vs Submit") { const l = await prisma.financeJournalLine.findFirst({ where: { journalEntryId: dId }}); await JournalService.removeLine(ctx, dId, l!.id); }
       else if (test === "Update Draft vs Submit") await JournalService.updateDraft(ctx, dId, { description: "MUT" });
       else if (test === "Period Close vs Submit") await prisma.financeFiscalPeriod.update({ where: { id: extra1 }, data: { status: "CLOSED", closedAt: new Date(), closedById: extra2 }});
       else if (test === "Period Lock vs Approve") await prisma.financeFiscalPeriod.update({ where: { id: extra1 }, data: { status: "CLOSED", closedAt: new Date(), closedById: extra2 }});
       else if (test === "Ledger Deactivate vs Submit") await prisma.financeLedger.update({ where: { id: extra1 }, data: { isActive: false }});
       else if (test === "Ledger Deactivate vs Approve") await prisma.financeLedger.update({ where: { id: extra1 }, data: { isActive: false }});
    }
    console.log("SUCCESS");
  } catch(e: unknown) {
    if (e instanceof Error) {
      const isDomain = e.name.startsWith("Finance");
      if (isDomain) {
         console.log(e.message);
      } else {
         console.log(`[FATAL_ERROR] ${e.message}`);
         process.exitCode = 1;
      }
    } else {
      console.log(`[UNKNOWN_ERROR] ${String(e)}`);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

run();
