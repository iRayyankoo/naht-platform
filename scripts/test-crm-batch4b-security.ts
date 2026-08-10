import { PrismaClient, Prisma } from "@prisma/client";
import { execSync } from "child_process";
import { leadService, ALLOWED_NOTE_TYPES, ALLOWED_LEAD_STATUSES } from "../src/services/lead-service";

const timestamp = Date.now();
const randomId = Math.random().toString(36).substring(2, 9);
const dbPrefix = "naht_crm_disposable_test_";
const testDbName = `${dbPrefix}${timestamp}_${randomId}`;

// Local PostgreSQL connection on 127.0.0.1:55432
const localPgHost = "127.0.0.1";
const localPgPort = 55432;
const localPgUser = "postgres";
const localPgPass = "postgres";

const adminDbUrl = `postgresql://${localPgUser}:${localPgPass}@${localPgHost}:${localPgPort}/postgres`;
const testDbUrl = `postgresql://${localPgUser}:${localPgPass}@${localPgHost}:${localPgPort}/${testDbName}`;

// -------------------------------------------------------------
// FAIL-CLOSED GUARD: Strictly enforce Local Host & Disposable DB Name
// -------------------------------------------------------------
function enforceFailClosedHostGuard(url: string, dbName: string) {
  const isLocalHost = url.includes("127.0.0.1") || url.includes("localhost");
  const isDisposableDbName = dbName.startsWith(dbPrefix);
  const isRemoteSupabase = url.includes("supabase") || url.includes("pooler") || url.includes("aws-");

  if (!isLocalHost || !isDisposableDbName || isRemoteSupabase) {
    console.error("\n==========================================================");
    console.error("  FAIL-CLOSED SECURITY GUARD TRIGGERED!");
    console.error("  Refusing to run tests on remote or non-disposable database!");
    console.error(`  URL Host Local: ${isLocalHost}`);
    console.error(`  Disposable DB Prefix: ${isDisposableDbName}`);
    console.error(`  Remote Supabase Blocked: ${!isRemoteSupabase}`);
    console.error("==========================================================\n");
    throw new Error("FAIL-CLOSED GUARD: Execution blocked to protect remote/production environments.");
  }
}

enforceFailClosedHostGuard(testDbUrl, testDbName);

const redactedUrl = testDbUrl.replace(/:[^:@]+@/, ":****@");

console.log("==========================================================");
console.log(`  BATCH 4B LOCAL DISPOSABLE DATABASE SECURITY SUITE`);
console.log(`  Target Database: "${testDbName}"`);
console.log(`  Connection Host: ${localPgHost}:${localPgPort}`);
console.log(`  Redacted Connection: ${redactedUrl}`);
console.log("==========================================================\n");

const adminPrisma = new PrismaClient({
  datasources: { db: { url: adminDbUrl } },
});

let testPrisma: PrismaClient | null = null;
let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, title: string, failureDetails?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${totalCount}. ${title}`);
  } else {
    console.error(`\n[FAIL] ${totalCount}. ${title}`);
    console.error(`Details: ${failureDetails || "Assertion condition evaluated to false"}`);
    throw new Error(`TEST FAILURE AT ASSERTION ${totalCount}: ${title}`);
  }
}

async function runBatch4bSecurityTestSuite() {
  try {
    // 1. Create Local Disposable Database
    console.log(`[PROVISIONING] Creating local disposable PostgreSQL database "${testDbName}"...`);
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${testDbName}";`);

    const dbCheck = await adminPrisma.$queryRaw<Array<{ datname: string }>>`
      SELECT datname FROM pg_database WHERE datname = ${testDbName};
    `;
    assert(dbCheck.length > 0, `Disposable database "${testDbName}" created successfully on local PostgreSQL`);

    // 2. Push Schema DDL to Disposable Database (Override both DATABASE_URL and DIRECT_URL)
    console.log(`[PROVISIONING] Pushing Prisma Schema DDL to "${testDbName}"...`);
    execSync(`npx prisma db push --skip-generate`, {
      env: { ...process.env, DATABASE_URL: testDbUrl, DIRECT_URL: testDbUrl },
      stdio: "pipe",
    });
    console.log(`[PROVISIONING] Schema DDL successfully pushed to "${testDbName}".`);

    // 3. Connect testPrisma to disposable database
    testPrisma = new PrismaClient({
      datasources: { db: { url: testDbUrl } },
    });

    const userCount = await testPrisma.user.count();
    const leadCount = await testPrisma.lead.count();
    const noteCount = await testPrisma.leadNote.count();

    assert(userCount === 0, `Table "User" ready in disposable DB (Initial count: ${userCount})`);
    assert(leadCount === 0, `Table "Lead" ready in disposable DB (Initial count: ${leadCount})`);
    assert(noteCount === 0, `Table "LeadNote" ready in disposable DB (Initial count: ${noteCount})`);

    // 4. Create Dynamic Fixtures
    console.log("\n[SETUP] Creating dynamic test fixtures in disposable DB...");
    const uid = () => Math.random().toString(36).substring(2, 10);

    const adminUser = await testPrisma.user.create({
      data: {
        id: `usr_admin_${uid()}`,
        name: `Admin Tester ${uid()}`,
        email: `admin_${uid()}@local-test.internal`,
        role: "ADMIN",
        isActive: true,
      },
    });

    const salesUser1 = await testPrisma.user.create({
      data: {
        id: `usr_sales1_${uid()}`,
        name: `Sales Tester 1 ${uid()}`,
        email: `sales1_${uid()}@local-test.internal`,
        role: "SALES",
        isActive: true,
      },
    });

    const salesUser2 = await testPrisma.user.create({
      data: {
        id: `usr_sales2_${uid()}`,
        name: `Sales Tester 2 ${uid()}`,
        email: `sales2_${uid()}@local-test.internal`,
        role: "SALES",
        isActive: true,
      },
    });

    const marketingUser = await testPrisma.user.create({
      data: {
        id: `usr_mkt_${uid()}`,
        name: `Marketing Tester ${uid()}`,
        email: `mkt_${uid()}@local-test.internal`,
        role: "MARKETING",
        isActive: true,
      },
    });

    const inactiveSalesUser = await testPrisma.user.create({
      data: {
        id: `usr_inactive_${uid()}`,
        name: `Inactive Sales ${uid()}`,
        email: `inactive_${uid()}@local-test.internal`,
        role: "SALES",
        isActive: false,
      },
    });

    assert(Boolean(adminUser.id), "Dynamic Admin fixture created");
    assert(Boolean(salesUser1.id), "Dynamic Sales 1 fixture created");
    assert(Boolean(salesUser2.id), "Dynamic Sales 2 fixture created");
    assert(Boolean(marketingUser.id), "Dynamic Marketing fixture created");
    assert(Boolean(inactiveSalesUser.id), "Dynamic Inactive Sales fixture created");

    // -------------------------------------------------------------
    // CASE 1: All 6 Approved Note Types Saved As-Is via leadService
    // -------------------------------------------------------------
    console.log("\n--- CASE 1: All 6 Approved Note Types Saved As-Is ---");
    const testLead1 = await testPrisma.lead.create({
      data: {
        id: `lead_1_${uid()}`,
        name: "Test Lead Approved Notes",
        phone: "0590000001",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    const noteTypesToTest = Array.from(ALLOWED_NOTE_TYPES);
    assert(noteTypesToTest.length === 6, "leadService exports exactly 6 approved note types");

    for (const noteType of noteTypesToTest) {
      const res = await leadService.addLeadNote(
        salesUser1,
        testLead1.id,
        noteType,
        `Content for note type ${noteType}`,
        testPrisma
      );
      assert(res.success === true, `leadService.addLeadNote for '${noteType}' returned success`);
    }

    const notes1InDb = await testPrisma.leadNote.findMany({ where: { leadId: testLead1.id } });
    assert(notes1InDb.length === 6, "All 6 notes saved in disposable DB");
    const dbNoteTypes = new Set(notes1InDb.map((n) => n.noteType));
    for (const nt of noteTypesToTest) {
      assert(dbNoteTypes.has(nt), `Note type '${nt}' persisted in DB exactly as specified`);
    }

    // -------------------------------------------------------------
    // CASE 2: Reject Unapproved Note Type Without DB Write
    // -------------------------------------------------------------
    console.log("\n--- CASE 2: Reject Unapproved Note Type ---");
    const testLead2 = await testPrisma.lead.create({
      data: {
        id: `lead_2_${uid()}`,
        name: "Test Lead Reject Invalid Note",
        phone: "0590000002",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    const invalidNoteRes = await leadService.addLeadNote(
      salesUser1,
      testLead2.id,
      "INVALID_HACKED_NOTE",
      "Malicious content",
      testPrisma
    );

    assert(invalidNoteRes.success === false, "leadService.addLeadNote rejected unapproved note type");
    if (!invalidNoteRes.success) {
      assert(invalidNoteRes.error === "نوع الملاحظة غير معتمد", "Returned explicit Arabic error message");
    }

    const notes2InDb = await testPrisma.leadNote.findMany({ where: { leadId: testLead2.id } });
    assert(notes2InDb.length === 0, "Zero notes created in DB on invalid note type rejection");

    // -------------------------------------------------------------
    // CASE 3: Reject Unapproved Status & Accept Valid Status (VISIT_DONE)
    // -------------------------------------------------------------
    console.log("\n--- CASE 3: Reject Unapproved Status & Accept VISIT_DONE ---");
    const testLead3 = await testPrisma.lead.create({
      data: {
        id: `lead_3_${uid()}`,
        name: "Test Lead Status Validation",
        phone: "0590000003",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    const invalidStatusRes = await leadService.updateLeadStatus(
      salesUser1,
      testLead3.id,
      "INVALID_HACKED_STATUS",
      testPrisma
    );

    assert(invalidStatusRes.success === false, "leadService.updateLeadStatus rejected unapproved status");
    if (!invalidStatusRes.success) {
      assert(invalidStatusRes.error === "حالة عميل غير معتمدة", "Returned explicit Arabic error message");
    }

    const lead3AfterInvalid = await testPrisma.lead.findUnique({ where: { id: testLead3.id } });
    assert(lead3AfterInvalid?.status === "NEW", "Lead status in DB remained 'NEW'");

    assert(ALLOWED_LEAD_STATUSES.has("VISIT_DONE"), "'VISIT_DONE' is in ALLOWED_LEAD_STATUSES");
    const validStatusRes = await leadService.updateLeadStatus(
      salesUser1,
      testLead3.id,
      "VISIT_DONE",
      testPrisma
    );
    assert(validStatusRes.success === true, "leadService.updateLeadStatus succeeded for 'VISIT_DONE'");

    const lead3AfterValid = await testPrisma.lead.findUnique({ where: { id: testLead3.id } });
    assert(lead3AfterValid?.status === "VISIT_DONE", "Lead status in DB updated to 'VISIT_DONE'");

    // -------------------------------------------------------------
    // CASE 4: Prevent SALES from Modifying Lead of Another Sales User (IDOR & Unified Error for addLeadNote & updateLeadStatus)
    // -------------------------------------------------------------
    console.log("\n--- CASE 4: IDOR & Unified Error Message Prevention ---");
    const testLead4 = await testPrisma.lead.create({
      data: {
        id: `lead_4_${uid()}`,
        name: "Test Lead Sales 1 Only",
        phone: "0590000004",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    // IDOR Test A: Sales 2 attempts updateLeadStatus on Sales 1's lead
    const idorStatusRes = await leadService.updateLeadStatus(
      salesUser2,
      testLead4.id,
      "CONTACTED",
      testPrisma
    );

    assert(idorStatusRes.success === false, "leadService.updateLeadStatus rejected Sales 2 on Sales 1's lead");
    if (!idorStatusRes.success) {
      assert(
        idorStatusRes.error === "غير مصرح لك بتنفيذ العملية على هذا العميل",
        "Returned unified error message for unauthorized sales status operation"
      );
    }

    // IDOR Test B: Sales 2 attempts addLeadNote on Sales 1's lead
    const idorNoteRes = await leadService.addLeadNote(
      salesUser2,
      testLead4.id,
      "INTERNAL_NOTE",
      "Unauthorized note from Sales 2",
      testPrisma
    );

    assert(idorNoteRes.success === false, "leadService.addLeadNote rejected Sales 2 on Sales 1's lead");
    if (!idorNoteRes.success) {
      assert(
        idorNoteRes.error === "غير مصرح لك بتنفيذ العملية على هذا العميل",
        "Returned unified error message for unauthorized sales addLeadNote operation"
      );
    }

    const notes4InDb = await testPrisma.leadNote.findMany({ where: { leadId: testLead4.id } });
    assert(notes4InDb.length === 0, "Zero notes created in DB on IDOR addLeadNote attempt");

    // Non-existent lead test: returns exact same error message to prevent enumeration
    const nonExistentRes = await leadService.updateLeadStatus(
      salesUser2,
      "lead_non_existent_9999",
      "CONTACTED",
      testPrisma
    );

    assert(nonExistentRes.success === false, "leadService.updateLeadStatus rejected non-existent lead for Sales");
    if (!nonExistentRes.success) {
      assert(
        nonExistentRes.error === "غير مصرح لك بتنفيذ العملية على هذا العميل",
        "Returned unified error message for non-existent lead (prevents ID enumeration)"
      );
    }

    const lead4Unchanged = await testPrisma.lead.findUnique({ where: { id: testLead4.id } });
    assert(lead4Unchanged?.status === "NEW", "Lead status remained 'NEW' without alteration");

    // -------------------------------------------------------------
    // CASE 5: AssignLead Server-Side Validation & Marketing Rejection for Both addLeadNote & updateLeadStatus
    // -------------------------------------------------------------
    console.log("\n--- CASE 5: AssignLead Validation & Marketing Role Rejection ---");
    const testLead5 = await testPrisma.lead.create({
      data: {
        id: `lead_5_${uid()}`,
        name: "Test Lead Assignment Validation",
        phone: "0590000005",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    const assignInactiveRes = await leadService.assignLead(
      adminUser,
      testLead5.id,
      inactiveSalesUser.id,
      testPrisma
    );
    assert(assignInactiveRes.success === false, "leadService.assignLead rejected inactive sales user");
    if (!assignInactiveRes.success) {
      assert(assignInactiveRes.error === "الموظف المعين غير صالح أو غير نشط", "Returned inactive user error");
    }

    const assignMktRes = await leadService.assignLead(
      adminUser,
      testLead5.id,
      marketingUser.id,
      testPrisma
    );
    assert(assignMktRes.success === false, "leadService.assignLead rejected non-SALES marketing user");
    if (!assignMktRes.success) {
      assert(assignMktRes.error === "الموظف المعين غير صالح أو غير نشط", "Returned non-SALES role error");
    }

    // Rejection of MARKETING for updateLeadStatus
    const mktStatusRes = await leadService.updateLeadStatus(
      marketingUser,
      testLead5.id,
      "CONTACTED",
      testPrisma
    );
    assert(mktStatusRes.success === false, "leadService.updateLeadStatus rejected MARKETING role");

    // Rejection of MARKETING for addLeadNote
    const mktNoteRes = await leadService.addLeadNote(
      marketingUser,
      testLead5.id,
      "INTERNAL_NOTE",
      "Marketing note attempt",
      testPrisma
    );
    assert(mktNoteRes.success === false, "leadService.addLeadNote rejected MARKETING role");

    const notes5InDb = await testPrisma.leadNote.findMany({ where: { leadId: testLead5.id } });
    assert(notes5InDb.length === 0, "Zero notes created in DB on Marketing addLeadNote rejection");

    // -------------------------------------------------------------
    // CASE 6: LeadService Direct Atomic Rollback Verification via Trigger
    // -------------------------------------------------------------
    console.log("\n--- CASE 6: LeadService Direct Atomic Rollback ---");
    const targetLeadIdForRollback = `lead_rollback_${uid()}`;
    await testPrisma.lead.create({
      data: {
        id: targetLeadIdForRollback,
        name: "Test Lead Atomic Rollback Target",
        phone: "0590000006",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    // Create temporary PostgreSQL trigger (single statements) to force LeadNote.create failure inside leadService.updateLeadStatus
    await testPrisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_fail_note_insert() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."leadId" = '${targetLeadIdForRollback}' THEN
          RAISE EXCEPTION 'Simulated LeadNote Creation Failure for Rollback Test';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await testPrisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_test_fail_note ON "LeadNote";`);

    await testPrisma.$executeRawUnsafe(`
      CREATE TRIGGER trigger_test_fail_note
      BEFORE INSERT ON "LeadNote"
      FOR EACH ROW EXECUTE FUNCTION test_fail_note_insert();
    `);

    // Call leadService.updateLeadStatus directly
    const rollbackRes = await leadService.updateLeadStatus(
      salesUser1,
      targetLeadIdForRollback,
      "VISIT_DONE",
      testPrisma
    );

    assert(rollbackRes.success === false, "leadService.updateLeadStatus returned failure when LeadNote creation failed");
    if (!rollbackRes.success) {
      assert(rollbackRes.error === "فشلت العملية أثناء الحفظ", "Returned transaction rollback error message");
    }

    const lead6AfterRollback = await testPrisma.lead.findUnique({ where: { id: targetLeadIdForRollback } });
    assert(lead6AfterRollback?.status === "NEW", "Atomic Rollback: Lead status in DB reverted to 'NEW'");

    const notes6Count = await testPrisma.leadNote.count({ where: { leadId: targetLeadIdForRollback } });
    assert(notes6Count === 0, "Atomic Rollback: 0 notes created in DB");

    // Clean up temporary trigger
    await testPrisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_test_fail_note ON "LeadNote";`);
    await testPrisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS test_fail_note_insert();`);

    // -------------------------------------------------------------
    // CASE 7: Proof of assignLead Waiting Behind External Row Lock
    // -------------------------------------------------------------
    console.log("\n--- CASE 7: Proof of assignLead Waiting Behind External Row Lock ---");
    const testLead7 = await testPrisma.lead.create({
      data: {
        id: `lead_7_${uid()}`,
        name: "Test Lead Application Concurrency Lock",
        phone: "0590000007",
        formType: "GENERAL_INQUIRY",
        status: "NEW",
        assignedToId: salesUser1.id,
      },
    });

    const executionLog: string[] = [];
    let lockAcquiredSignal!: () => void;
    const lockAcquiredPromise = new Promise<void>((res) => { lockAcquiredSignal = res; });

    // Task A: External transaction acquires FOR UPDATE row lock on testLead7
    const promiseA = testPrisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`SELECT "id", "status" FROM "Lead" WHERE "id" = ${testLead7.id} FOR UPDATE`);
      executionLog.push("TxA: External Row Lock Acquired (FOR UPDATE)");
      lockAcquiredSignal();
      await new Promise((r) => setTimeout(r, 600));
      await tx.lead.update({ where: { id: testLead7.id }, data: { status: "VISIT_DONE" } });
      executionLog.push("TxA: External Transaction Completed & Lock Released");
    });

    await lockAcquiredPromise;

    // Task B: Admin assigns lead using leadService.assignLead
    const promiseB = (async () => {
      executionLog.push("TxB: Attempting leadService.assignLead");
      const res = await leadService.assignLead(adminUser, testLead7.id, salesUser2.id, testPrisma);
      executionLog.push(`TxB: leadService.assignLead Completed (${res.success})`);
    })();

    await Promise.all([promiseA, promiseB]);

    assert(executionLog[0] === "TxA: External Row Lock Acquired (FOR UPDATE)", "Concurrency: TxA acquired external lock first");
    assert(executionLog[1] === "TxB: Attempting leadService.assignLead", "Concurrency: TxB attempted assignLead while TxA held lock");
    assert(executionLog[2] === "TxA: External Transaction Completed & Lock Released", "TxA completed mutation before TxB finished");
    assert(executionLog[3] === "TxB: leadService.assignLead Completed (true)", "Proof verified: leadService.assignLead waited behind external row lock and completed successfully");

    const lead7Final = await testPrisma.lead.findUnique({ where: { id: testLead7.id } });
    assert(lead7Final?.status === "VISIT_DONE", "Final status is 'VISIT_DONE' from TxA");
    assert(lead7Final?.assignedToId === salesUser2.id, "Final assignee is Sales 2 from leadService.assignLead");

    console.log("\n==========================================================");
    const isAllPassed = passedCount === totalCount;
    const successRatioPercentage = isAllPassed ? " (100% SUCCESS)" : "";
    console.log(`  SUMMARY: ${passedCount} / ${totalCount} INTEGRATION TESTS PASSED${successRatioPercentage}`);
    console.log("==========================================================\n");

  } catch (err) {
    console.error("\n==========================================================");
    console.error("  LOCAL INTEGRATION TEST SUITE ENCOUNTERED AN ERROR!");
    console.error("==========================================================");
    console.error(err);
    process.exitCode = 1;
    throw err;
  } finally {
    if (testPrisma) {
      await testPrisma.$disconnect();
    }
    console.log(`\n[CLEANUP] Dropping temporary local disposable database "${testDbName}"...`);
    try {
      await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${testDbName}" WITH (FORCE);`);
      const checkDropped = await adminPrisma.$queryRaw<Array<{ datname: string }>>`
        SELECT datname FROM pg_database WHERE datname = ${testDbName};
      `;
      if (checkDropped.length > 0) {
        process.exitCode = 1;
        throw new Error(`CRITICAL CLEANUP FAILURE: Database "${testDbName}" still exists in pg_database after DROP DATABASE!`);
      }
      console.log(`[CLEANUP VERIFICATION] Disposable database "${testDbName}" successfully dropped from local PostgreSQL.`);
      console.log(`[CLEANUP PROOF] Verified 0 rows returned for database "${testDbName}" in pg_database.`);
    } catch (cleanupErr) {
      console.error("[CLEANUP CRITICAL FAILURE] Failed to drop disposable database:", cleanupErr);
      process.exitCode = 1;
      throw cleanupErr;
    } finally {
      await adminPrisma.$disconnect();
    }
  }
}

runBatch4bSecurityTestSuite();
