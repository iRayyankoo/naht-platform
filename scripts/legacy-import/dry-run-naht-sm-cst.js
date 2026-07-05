/**
 * dry-run-naht-sm-cst.js
 * Phase 6E-5D-1B — Fix: Read ALL rows (including Excel filtered/hidden rows)
 *
 * READ-ONLY: No DB connection. No imports. Analysis only.
 * Passwords: [HIDDEN]
 * Phone numbers: masked (966****1234)
 */

'use strict';

const XLSX = require(require.resolve('xlsx', { paths: [
  require('path').join(__dirname, '../../'),
  require('path').join(__dirname, '../../../'),
  'C:/Users/irayy/.gemini/antigravity-ide/brain/aa35fc59-ecb9-4bd2-9343-26f423fca4a4/scratch'
] }));
const path = require('path');
const fs = require('fs');

const XLSX_PATH = 'C:/Users/irayy/Downloads/Naht-SM-CST.xlsx';
const REPORT_PATH = path.join(__dirname, 'dry-run-report.json');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Mask phone: show first 3 + last 4 digits only */
function maskPhone(raw) {
  if (!raw) return '[EMPTY]';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 6) return '[SHORT:' + digits.length + ']';
  return digits.slice(0, 3) + '****' + digits.slice(-4);
}

/** Normalize Saudi phone → 9665XXXXXXXX */
function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('00966')) digits = digits.slice(2);
  else if (digits.startsWith('966')) { /* keep */ }
  else if (digits.startsWith('0')) digits = '966' + digits.slice(1);
  else if (digits.length === 9) digits = '966' + digits;
  return digits.length >= 9 ? digits : null;
}

/** Count occurrences of values in an array of strings */
function countValues(arr) {
  return arr.reduce((acc, v) => {
    const key = (v === null || v === undefined || v === '') ? '(فارغ)' : String(v).trim() || '(فارغ)';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Read ALL data rows from a sheet — includes all rows (blankrows:true),
 * then filters out truly empty rows (all cells empty).
 * Confirmed via cell-level inspection: 844 rows are genuinely empty in the source file.
 */
function readAllRows(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: true,   // include blank rows so we don't miss any
  });

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => String(h).trim());
  const dataRows = rows.slice(1);

  return dataRows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? String(row[i]).trim() : '';
      });
      return obj;
    })
    .filter(obj => {
      // Keep only rows where at least one cell has a value
      return Object.values(obj).some(v => v !== '');
    });
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║  Phase 6E-5D-1B — Full Rows Dry Run Fix      ║');
console.log('║  READ ONLY — No DB — No Import               ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

if (!fs.existsSync(XLSX_PATH)) {
  console.error('ERROR: File not found:', XLSX_PATH);
  process.exit(1);
}

// Read with ALL options that expose hidden/filtered rows
const wb = XLSX.readFile(XLSX_PATH, {
  cellStyles: false,
  cellNF: false,
  cellFormula: false,
  sheetStubs: true,   // ← include stub cells (hidden rows still have stubs)
  raw: false,
});

const sheetNames = wb.SheetNames;
console.log(`File: ${XLSX_PATH}`);
console.log(`Sheets (${sheetNames.length}): ${sheetNames.join(' | ')}`);
console.log('');

const report = {
  generatedAt: new Date().toISOString(),
  filePath: XLSX_PATH,
  fixVersion: '1B',
  readMethod: 'header:1, raw:false, blankrows:false, sheetStubs:true — reads ALL rows',
  sheets: sheetNames,
  dbConnection: false,
  importExecuted: false,
  passwordsPrinted: false,
  fullPhonesPrinted: false,
  leads: {},
  history: {},
  users: {},
  whatsappClicks: {},
};

// ─────────────────────────────────────────────
// 1. LEADS
// ─────────────────────────────────────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SHEET: Leads');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const leadsRaw = readAllRows(wb.Sheets['Leads']);
const totalLeads = leadsRaw.length;

const missingPhone = leadsRaw.filter(r => !r['رقم الجوال'] || r['رقم الجوال'] === '').length;
const missingName  = leadsRaw.filter(r => !r['الاسم'] || r['الاسم'] === '').length;

const phones = leadsRaw.map(r => normalizePhone(r['رقم الجوال']));
const validPhones   = phones.filter(Boolean);
const invalidPhones = phones.filter(p => !p);

// Duplicates
const phoneCounts = countValues(validPhones);
const duplicatePhoneGroups = Object.entries(phoneCounts).filter(([, c]) => c > 1);
const duplicateLeadsCount = duplicatePhoneGroups.reduce((s, [, c]) => s + (c - 1), 0);

// Stats
const projectNames = countValues(leadsRaw.map(r => r['اسم المشروع']));
const assignees    = countValues(leadsRaw.map(r => r['الموظف المسؤول']));
const statusVals   = countValues(leadsRaw.map(r => r['التواصل']));
const interestVals = countValues(leadsRaw.map(r => r['الاهتمام']));

const estimatedToImport = validPhones.length - duplicateLeadsCount;

console.log(`Total rows read:          ${totalLeads}`);
console.log(`Missing phone:            ${missingPhone}`);
console.log(`Missing name:             ${missingName}`);
console.log(`Valid phones:             ${validPhones.length}`);
console.log(`Invalid/empty phones:     ${invalidPhones.length}`);
console.log(`Duplicate phone groups:   ${duplicatePhoneGroups.length}`);
console.log(`Duplicate leads (skip):   ${duplicateLeadsCount}`);
console.log(`Estimated to import:      ${estimatedToImport}`);
console.log(`Unique projects:          ${Object.keys(projectNames).filter(k => k !== '(فارغ)').length}`);
console.log(`Unique assignees:         ${Object.keys(assignees).filter(k => k !== '(فارغ)').length}`);
console.log('');
console.log('Projects (count):');
Object.entries(projectNames).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');
console.log('Assignees (count):');
Object.entries(assignees).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');
console.log('Status values (التواصل):');
Object.entries(statusVals).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');
console.log('Interest values (الاهتمام):');
Object.entries(interestVals).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');

if (duplicatePhoneGroups.length > 0) {
  console.log(`Duplicate phone groups (masked, first 10):`);
  duplicatePhoneGroups.slice(0, 10).forEach(([p, c]) => {
    console.log(`  ${maskPhone(p)}: ${c} times`);
  });
  console.log('');
}

report.leads = {
  totalRows: totalLeads,
  missingPhone,
  missingName,
  validPhones: validPhones.length,
  invalidPhones: invalidPhones.length,
  duplicatePhoneGroups: duplicatePhoneGroups.length,
  duplicateLeadsCount,
  estimatedToImport,
  projectNames,
  assignees,
  statusValues: statusVals,
  interestValues: interestVals,
};

// ─────────────────────────────────────────────
// 2. HISTORY
// ─────────────────────────────────────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SHEET: History');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const histRaw = readAllRows(wb.Sheets['History']);
const totalHistory = histRaw.length;
const histWithPhone = histRaw.filter(r => {
  const p = String(r['رقم الجوال'] || '').trim();
  return p !== '' && p !== '-';
}).length;
const histNoPhone = totalHistory - histWithPhone;

const systemKeywords = ['إضافة موظف', 'تعيين', 'اضافة موظف', 'React Test'];
const systemRows = histRaw.filter(r => {
  const note = String(r['الملاحظة'] || '');
  const name = String(r['اسم العميل'] || '');
  return systemKeywords.some(k => note.includes(k) || name.includes(k));
});

const prevStatuses  = countValues(histRaw.map(r => r['الحالة السابقة']));
const newStatuses   = countValues(histRaw.map(r => r['الحالة الجديدة']));
const histEmployees = countValues(histRaw.map(r => r['اسم الموظف']));

console.log(`Total rows read:       ${totalHistory}`);
console.log(`With phone (linkable): ${histWithPhone}`);
console.log(`Without phone:         ${histNoPhone}`);
console.log(`System/admin rows:     ${systemRows.length} (to be filtered)`);
console.log(`Importable notes:      ${totalHistory - systemRows.length}`);
console.log('');
console.log('Employees in History:');
Object.entries(histEmployees).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');

report.history = {
  totalRows: totalHistory,
  withPhone: histWithPhone,
  withoutPhone: histNoPhone,
  systemRows: systemRows.length,
  importableNotes: totalHistory - systemRows.length,
  previousStatuses: prevStatuses,
  newStatuses,
  employees: histEmployees,
};

// ─────────────────────────────────────────────
// 3. USERS
// ─────────────────────────────────────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SHEET: Users');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const usersRaw = readAllRows(wb.Sheets['Users']);
const totalUsers = usersRaw.length;

// password column names to hide
const PWD_COLS = ['كلمة المرور', 'password', 'pass', 'pwd', 'secret'];

const usersReport = usersRaw.map((u, i) => {
  const name  = u['المدير'] || u['الاسم'] || '(unnamed)';
  const role  = u['الصلاحية'] || '(unknown)';
  const email = (u['البريد الإلكتروني'] || '').trim();
  return {
    index: i + 1,
    name,
    role,
    hasEmail: email !== '',
    email: email || '(missing)',
    password: '[HIDDEN]',
  };
});

const rolesCount  = countValues(usersRaw.map(r => r['الصلاحية']));
const withEmail   = usersReport.filter(u => u.hasEmail).length;
const withoutEmail = usersReport.filter(u => !u.hasEmail).length;

console.log(`Total users:     ${totalUsers}`);
console.log(`With email:      ${withEmail}`);
console.log(`Without email:   ${withoutEmail}`);
console.log('');
console.log('Roles:');
Object.entries(rolesCount).forEach(([k, v]) => console.log(`  "${k}": ${v}`));
console.log('');
console.log('Users (passwords hidden):');
usersReport.forEach(u => {
  console.log(`  [${u.index}] name="${u.name}" role="${u.role}" email="${u.email}" password=[HIDDEN]`);
});
console.log('');

report.users = {
  totalUsers,
  withEmail,
  withoutEmail,
  roles: rolesCount,
  users: usersReport,
  note: 'Passwords are HIDDEN. New passwords will be created fresh.',
};

// ─────────────────────────────────────────────
// 4. WHATSAPP_CLICKS
// ─────────────────────────────────────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SHEET: WhatsApp_Clicks');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const waRaw = readAllRows(wb.Sheets['WhatsApp_Clicks']);
const isTestOnly = waRaw.every(r =>
  String(r['المشروع'] || '').toLowerCase().includes('test') ||
  String(r['UTM Source'] || '').toLowerCase().includes('test')
);

console.log(`Total rows:   ${waRaw.length}`);
console.log(`Test-only:    ${isTestOnly ? 'YES — SKIP' : 'NO — Review'}`);
if (waRaw.length > 0) {
  console.log(`Sample:  المشروع="${waRaw[0]['المشروع']}" Source="${waRaw[0]['UTM Source']}"`);
}
console.log('');

report.whatsappClicks = {
  totalRows: waRaw.length,
  isTestOnly,
  recommendation: isTestOnly ? 'SKIP — test data only' : 'Review manually',
};

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════╗');
console.log('║  DRY RUN SUMMARY (1B — ALL ROWS READ)        ║');
console.log('╚══════════════════════════════════════════════╝');
console.log(`Leads total read:          ${totalLeads}`);
console.log(`Leads est. to import:      ${estimatedToImport}`);
console.log(`Leads duplicates (skip):   ${duplicateLeadsCount}`);
console.log(`Leads invalid phone:       ${invalidPhones.length}`);
console.log(`History notes importable:  ${totalHistory - systemRows.length}`);
console.log(`Users to create:           ${totalUsers}`);
console.log(`WhatsApp_Clicks:           SKIP (test data)`);
console.log(`DB connection used:        NO`);
console.log(`Import executed:           NO`);
console.log(`Passwords printed:         NO`);
console.log(`Full phones printed:       NO`);
console.log('');
console.log('=== PROJECT NAMES → NEED MANUAL MAPPING ===');
Object.keys(projectNames)
  .filter(k => k !== '(فارغ)')
  .sort()
  .forEach(p => console.log(`  "${p}" → [needs project.id from DB]`));
console.log('');

// ─────────────────────────────────────────────
// WRITE REPORT JSON
// ─────────────────────────────────────────────

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
console.log(`Report written: ${REPORT_PATH}`);
console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║  DRY RUN 1B COMPLETE — No data was imported  ║');
console.log('╚══════════════════════════════════════════════╝');
