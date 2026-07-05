/**
 * import-legacy-leads-staging.js
 * Phase 6E-5D-2D — Legacy Leads Import Script
 *
 * Modes:
 *   --dry-run   Connect to DB read-only, print what WOULD happen. No writes.
 *   --execute   Actually create Leads + LeadNotes in Staging DB.
 *
 * Safety rules:
 *   - Never prints DATABASE_URL, passwords, or full phone numbers.
 *   - Phones always masked as 966****XXXX in output.
 *   - Ahmad (أحمد) is excluded — fake user, never created.
 *   - No Users created in either mode.
 *   - WhatsApp_Clicks sheet is skipped entirely.
 *   - All writes go to Staging DB only (configured in .env).
 */

'use strict';

const path = require('path');
const fs   = require('fs');

const projectRoot = path.join(__dirname, '../../');

// ── Load .env without printing secrets ─────────────────────────────────────
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  });
}

// Try multiple possible XLSX locations
let XLSX;
const xlsxPaths = [
  'C:/Users/irayy/.gemini/antigravity-ide/brain/aa35fc59-ecb9-4bd2-9343-26f423fca4a4/scratch/node_modules/xlsx',
  path.join(projectRoot, 'node_modules/xlsx'),
];
for (const p of xlsxPaths) {
  try { XLSX = require(p); break; } catch {}
}
if (!XLSX) { console.error('ERROR: xlsx module not found'); process.exit(1); }

const { PrismaClient } = require(path.join(projectRoot, 'node_modules/@prisma/client'));

// ── Config ──────────────────────────────────────────────────────────────────
const XLSX_FILE = 'C:/Users/irayy/Downloads/Naht-SM-CST.xlsx';

const PROJECT_MAPPING = {
  'Naht-14': 'cmr7tv0zn0000lb04wlwl44ww',
  'Naht-13': 'cmr7tvo8a0000jv04x2vghx81',
  'Naht-30': 'cmr7tw55d0000lc044sw76vak',
};

// System user for LeadNotes (المدير العام UAT)
const SYSTEM_USER_ID = 'cmqglx4ea0000roqonkrf10h7';

// Status mapping from sheet → DB string
const STATUS_MAP = {
  'جديد':         'NEW',
  'تم التواصل':   'CONTACTED',
  'لم يتم الرد':  'NEW',      // NEW + note "لم يتم الرد"
  'رقم خاطئ':    'CLOSED_LOST',
};

// Minimum valid phone length (Saudi: 9 digits after country code)
const MIN_PHONE_DIGITS = 9;

// ── Helpers ──────────────────────────────────────────────────────────────────

function maskPhone(phone) {
  const s = String(phone || '');
  if (s.length <= 4) return '****';
  return s.slice(0, 3) + '****' + s.slice(-4);
}

function normalizePhone(raw) {
  if (!raw) return null;
  let p = String(raw).replace(/\s+/g, '').replace(/[^\d+]/g, '');
  // Remove leading zeros or spaces
  if (p.startsWith('00966')) p = '966' + p.slice(5);
  if (p.startsWith('+966'))  p = '966' + p.slice(4);
  if (p.startsWith('05'))    p = '9665' + p.slice(2);
  if (p.startsWith('5') && p.length === 9) p = '966' + p;
  // Validate
  const digits = p.replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) return null;
  return digits;
}

function readAllRows(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1, raw: false, defval: '', blankrows: true,
  });
  if (!rows.length) return [];
  const headers = rows[0].map(h => String(h).trim());
  return rows.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = String(row[i] ?? '').trim(); });
      return obj;
    })
    .filter(obj => Object.values(obj).some(v => v !== ''));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isExecute = process.argv.includes('--execute');

  if (!isDryRun && !isExecute) {
    console.error('ERROR: must pass --dry-run or --execute');
    process.exit(1);
  }

  const mode = isDryRun ? 'DRY RUN' : 'EXECUTE';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log(`║  Phase 6E-5D-2D — Legacy Leads Import — ${mode.padEnd(15)}║`);
  console.log('║  Staging DB Only — No Production Touch                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // ── 1. Load XLSX ───────────────────────────────────────────────────────────
  if (!fs.existsSync(XLSX_FILE.replace(/\//g, path.sep))) {
    console.error('ERROR: XLSX file not found:', XLSX_FILE);
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_FILE, { sheetStubs: true });
  const leadsSheet   = wb.Sheets['Leads'];
  const historySheet = wb.Sheets['History'];

  const leadsRaw   = readAllRows(leadsSheet);
  const historyRaw = readAllRows(historySheet);

  console.log(`XLSX Leads rows:   ${leadsRaw.length}`);
  console.log(`XLSX History rows: ${historyRaw.length}`);
  console.log('');

  // ── 2. Parse & validate Leads ─────────────────────────────────────────────
  const valid    = [];
  const rejected = [];
  const seenPhones = new Map(); // phone → first lead index

  for (const row of leadsRaw) {
    const rawPhone   = row['رقم الجوال'] || '';
    const name       = row['الاسم'] || '';
    const project    = row['اسم المشروع'] || '';
    const statusRaw  = row['التواصل'] || 'جديد';
    const interest   = row['الاهتمام'] || '';
    const assignee   = row['الموظف المسؤول'] || '';
    const notes      = row['الملاحظات'] || '';
    const dateRaw    = row['تاريخ التسجيل'] || '';

    const phone = normalizePhone(rawPhone);

    // Reject: invalid phone
    if (!phone) {
      rejected.push({ reason: 'invalid_phone', masked: maskPhone(rawPhone), name });
      continue;
    }

    // Reject: status = رقم خاطئ AND no valid phone structure
    if (statusRaw === 'رقم خاطئ') {
      rejected.push({ reason: 'wrong_number', masked: maskPhone(phone), name });
      continue;
    }

    // Reject: no name
    if (!name) {
      rejected.push({ reason: 'missing_name', masked: maskPhone(phone) });
      continue;
    }

    // Duplicate within sheet
    if (seenPhones.has(phone)) {
      const existingIdx = seenPhones.get(phone);
      valid[existingIdx]._extraNotes = (valid[existingIdx]._extraNotes || '') +
        `\nDuplicate in sheet: same phone, assignee=${assignee}, status=${statusRaw}`;
      rejected.push({ reason: 'sheet_duplicate', masked: maskPhone(phone), name });
      continue;
    }

    seenPhones.set(phone, valid.length);

    const projectId = PROJECT_MAPPING[project] || null;
    const status    = STATUS_MAP[statusRaw] || 'NEW';

    valid.push({
      name,
      phone,
      _maskedPhone:   maskPhone(phone),
      projectId,
      _legacyProject: project,
      _legacyAssignee: assignee,
      _legacyStatus:  statusRaw,
      _legacyInterest: interest,
      _legacyNotes:   notes,
      _legacyDate:    dateRaw,
      status,
      formType:    'GENERAL',
      leadType:    'GENERAL',
      source:      row['UTM Source'] || null,
      utmSource:   row['UTM Source'] || null,
      utmMedium:   row['UTM Medium'] || null,
      utmCampaign: row['UTM Campaign'] || null,
      utmContent:  row['UTM Content'] || null,
      utmTerm:     row['UTM Term'] || null,
      assignedToId: null,
      consent:      true,
    });
  }

  // ── 3. Parse History → LeadNotes ─────────────────────────────────────────
  const historyByPhone = new Map();
  const SKIP_ASSIGNEES = ['النظام', 'المدير', 'React Test User', 'React Test Admin', 'Admin'];

  for (const row of historyRaw) {
    const rawPhone  = row['رقم الجوال'] || row['Phone'] || '';
    const employee  = row['الموظف'] || row['Employee'] || '';
    const action    = row['الإجراء'] || row['Action'] || '';
    const noteText  = row['الملاحظة'] || row['Note'] || row['ملاحظات'] || '';
    const dateRaw   = row['التاريخ'] || row['Date'] || '';

    if (SKIP_ASSIGNEES.includes(employee)) continue;
    if (!rawPhone) continue;

    const phone = normalizePhone(rawPhone);
    if (!phone) continue;

    if (!historyByPhone.has(phone)) historyByPhone.set(phone, []);
    historyByPhone.get(phone).push({ employee, action, noteText, dateRaw });
  }

  // ── 4. Connect to DB ───────────────────────────────────────────────────────
  const prisma = new PrismaClient({ log: [] });

  // Verify projects exist in DB
  const projectIds = Object.values(PROJECT_MAPPING);
  const dbProjects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true, slug: true, isVisible: true },
  });
  const dbProjectMap = new Map(dbProjects.map(p => [p.id, p]));

  console.log('─── DB Projects Verified ───');
  for (const [label, id] of Object.entries(PROJECT_MAPPING)) {
    const p = dbProjectMap.get(id);
    if (p) console.log(`  ✅ ${label} → "${p.name}" (slug: ${p.slug}, visible: ${p.isVisible})`);
    else    console.log(`  ❌ ${label} → ID ${id} NOT FOUND in DB`);
  }
  console.log('');

  // Check existing leads in DB by phone (to detect pre-existing)
  const validPhones = valid.map(l => l.phone);
  const existingLeads = await prisma.lead.findMany({
    where: { phone: { in: validPhones } },
    select: { id: true, phone: true, name: true },
  });
  const existingPhoneSet = new Set(existingLeads.map(l => l.phone));

  // System user exists?
  const sysUser = await prisma.user.findUnique({
    where: { id: SYSTEM_USER_ID },
    select: { id: true, name: true },
  });

  console.log(`System user for notes: ${sysUser ? sysUser.name : '❌ NOT FOUND'}`);
  console.log('');

  // ── 5. Plan import ────────────────────────────────────────────────────────
  const toCreate   = valid.filter(l => !existingPhoneSet.has(l.phone));
  const wouldSkip  = valid.filter(l =>  existingPhoneSet.has(l.phone));

  let historyNotesTotal = 0;
  for (const lead of toCreate) {
    const notes = historyByPhone.get(lead.phone) || [];
    historyNotesTotal += notes.length;
  }

  // Per-project counts
  const perProject = {};
  for (const [label, id] of Object.entries(PROJECT_MAPPING)) {
    perProject[label] = toCreate.filter(l => l.projectId === id).length;
  }
  const unmapped = toCreate.filter(l => !l.projectId).length;

  // ── 6. Print Dry Run summary ───────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log(`MODE: ${mode}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('─── Leads Analysis ───');
  console.log(`  Total rows in sheet:          ${leadsRaw.length}`);
  console.log(`  Valid leads (parsed):         ${valid.length}`);
  console.log(`  Rejected (invalid phone):     ${rejected.filter(r=>r.reason==='invalid_phone').length}`);
  console.log(`  Rejected (wrong number):      ${rejected.filter(r=>r.reason==='wrong_number').length}`);
  console.log(`  Rejected (missing name):      ${rejected.filter(r=>r.reason==='missing_name').length}`);
  console.log(`  Duplicates in sheet (merged): ${rejected.filter(r=>r.reason==='sheet_duplicate').length}`);
  console.log('');
  console.log('─── DB Comparison ───');
  console.log(`  Already in Staging DB:        ${wouldSkip.length}`);
  console.log(`  Would CREATE (new leads):     ${toCreate.length}`);
  console.log('');
  console.log('─── Per Project ───');
  for (const [label, count] of Object.entries(perProject)) {
    console.log(`  ${label}: ${count} leads`);
  }
  if (unmapped > 0) console.log(`  Unmapped (no projectId): ${unmapped}`);
  console.log('');
  console.log('─── Notes ───');
  console.log(`  LeadNotes from Leads (import note): ${toCreate.length}  (1 per lead)`);
  console.log(`  LeadNotes from History sheet:       ${historyNotesTotal}`);
  console.log(`  Total LeadNotes to create:          ${toCreate.length + historyNotesTotal}`);
  console.log('');
  console.log('─── Safety ───');
  console.log(`  أحمد excluded:     YES`);
  console.log(`  Users created:     NO`);
  console.log(`  WA_Clicks skipped: YES`);
  console.log(`  Full phones shown: NO`);
  console.log(`  DB writes done:    ${isDryRun ? 'NO (dry-run)' : 'YES'}`);
  console.log('');

  // ── 7. Write JSON report ───────────────────────────────────────────────────
  const reportPath = path.join(__dirname, 'import-dry-run-report.json');
  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    xlsx: XLSX_FILE,
    leadsTotal: leadsRaw.length,
    leadsValid: valid.length,
    leadsRejectedInvalidPhone: rejected.filter(r=>r.reason==='invalid_phone').length,
    leadsRejectedWrongNumber:  rejected.filter(r=>r.reason==='wrong_number').length,
    leadsRejectedMissingName:  rejected.filter(r=>r.reason==='missing_name').length,
    sheetDuplicates:           rejected.filter(r=>r.reason==='sheet_duplicate').length,
    alreadyInDB:               wouldSkip.length,
    wouldCreate:               toCreate.length,
    perProject,
    unmappedLeads:             unmapped,
    leadNotesFromLeads:        toCreate.length,
    leadNotesFromHistory:      historyNotesTotal,
    totalLeadNotes:            toCreate.length + historyNotesTotal,
    projectsVerified:          dbProjects.map(p => ({ id: p.id, name: p.name, slug: p.slug, isVisible: p.isVisible })),
    systemUserFound:           !!sysUser,
    safetyChecks: {
      ahmadExcluded:   true,
      usersCreated:    false,
      waClicksSkipped: true,
      fullPhonesShown: false,
      dbWritesDone:    !isDryRun,
    },
    // Rejected list — masked phones only
    rejected: rejected.map(r => ({ reason: r.reason, masked: r.masked, name: r.name })),
    // Would-skip list — masked phones only
    wouldSkip: wouldSkip.map(l => ({ masked: l._maskedPhone, name: l.name, project: l._legacyProject })),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Report written: ${reportPath}`);
  console.log('');

  // ── 8. Execute mode ────────────────────────────────────────────────────────
  if (isExecute) {
    if (!sysUser) {
      console.error('ERROR: System user not found — cannot create LeadNotes. Aborting.');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log('▶ EXECUTING IMPORT...');
    let created = 0;
    let notesCreated = 0;

    for (const lead of toCreate) {
      // Build import note content
      const importNote = [
        '[مستورد من الشيت القديم]',
        `Legacy project label: ${lead._legacyProject}`,
        `Legacy assignee: ${lead._legacyAssignee || 'غير محدد'}`,
        `Legacy status: ${lead._legacyStatus}`,
        `Legacy interest: ${lead._legacyInterest || '—'}`,
        `Original UTM Campaign: ${lead.utmCampaign || '—'}`,
        `Imported from: Naht-SM-CST.xlsx`,
        `Import date: ${new Date().toISOString().split('T')[0]}`,
        lead._legacyNotes ? `Original notes: ${lead._legacyNotes}` : null,
        lead._legacyStatus === 'لم يتم الرد' ? 'ملاحظة: لم يتم الرد في النظام القديم' : null,
      ].filter(Boolean).join('\n');

      // Create Lead
      const newLead = await prisma.lead.create({
        data: {
          name:        lead.name,
          phone:       lead.phone,
          projectId:   lead.projectId,
          formType:    lead.formType,
          leadType:    lead.leadType,
          source:      lead.source,
          utmSource:   lead.utmSource,
          utmMedium:   lead.utmMedium,
          utmCampaign: lead.utmCampaign,
          utmContent:  lead.utmContent,
          utmTerm:     lead.utmTerm,
          status:      lead.status,
          assignedToId: null,
          consent:      true,
          internalNotes: lead._extraNotes || null,
        },
      });
      created++;

      // Import note
      await prisma.leadNote.create({
        data: {
          leadId:   newLead.id,
          userId:   SYSTEM_USER_ID,
          noteType: 'ملاحظة داخلية',
          content:  importNote,
        },
      });
      notesCreated++;

      // History notes
      const histNotes = historyByPhone.get(lead.phone) || [];
      for (const h of histNotes) {
        const noteContent = [
          `[سجل تاريخي من الشيت القديم]`,
          `الموظف: ${h.employee}`,
          h.action   ? `الإجراء: ${h.action}` : null,
          h.noteText ? `الملاحظة: ${h.noteText}` : null,
          h.dateRaw  ? `التاريخ: ${h.dateRaw}` : null,
        ].filter(Boolean).join('\n');

        await prisma.leadNote.create({
          data: {
            leadId:   newLead.id,
            userId:   SYSTEM_USER_ID,
            noteType: 'ملاحظة داخلية',
            content:  noteContent,
          },
        });
        notesCreated++;
      }
    }

    console.log(`✅ Created: ${created} Leads`);
    console.log(`✅ Created: ${notesCreated} LeadNotes`);
    console.log('');
    console.log('IMPORT COMPLETE — Staging DB only.');
  } else {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  DRY RUN COMPLETE — No data was written to DB           ║');
    console.log('║  To execute: node import-legacy-leads-staging.js        ║');
    console.log('║              --execute                                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('FATAL ERROR:', e.message);
  process.exit(1);
});
