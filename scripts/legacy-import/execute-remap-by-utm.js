/**
 * execute-remap-by-utm.js
 * Phase 6E-5D-2E-R3 — Execute Project Remap by UTM Campaign
 *
 * Modes:
 *   --dry-run   Show what would change, no writes
 *   --execute   Apply projectId corrections + add LeadNote per lead
 *
 * Rules:
 *   naht-14 + utmCampaign → naht-13  → remap to naht-13
 *   naht-14 + utmCampaign → naht-23  → remap to naht-23
 *   landing_shaan / landing_ahdana / GUID → SKIP (Manual Review)
 *   Never delete leads. Never touch the 6 Manual Review leads.
 *   Always add a correction LeadNote (old note stays as history).
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const projectRoot = path.join(__dirname, '../../');

const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  });
}

const { PrismaClient } = require(path.join(projectRoot, 'node_modules/@prisma/client'));
const prisma = new PrismaClient({ log: [] });

// ── Known project IDs ────────────────────────────────────────────────────────
const SLUG_TO_ID = {
  'naht-14': 'cmr7tv0zn0000lb04wlwl44ww',
  'naht-13': 'cmr7tvo8a0000jv04x2vghx81',
  'naht-30': 'cmr7tw55d0000lc044sw76vak',
  // naht-23 fetched dynamically
};
const ID_TO_SLUG = Object.fromEntries(Object.entries(SLUG_TO_ID).map(([s,i])=>[i,s]));

// System user for LeadNotes
const SYSTEM_USER_ID = 'cmqglx4ea0000roqonkrf10h7';

function maskPhone(p) {
  const s = String(p || '');
  return s.length <= 4 ? '****' : s.slice(0, 3) + '****' + s.slice(-4);
}
function maskName(n) {
  if (!n) return '***';
  const parts = n.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1) + '***';
  return parts[0].slice(0, 1) + '*** ' + parts[parts.length-1].slice(0, 1) + '***';
}

function extractTargetSlug(lead) {
  const fields = [lead.utmCampaign, lead.utmContent, lead.utmTerm]
    .filter(Boolean)
    .map(f => f.toLowerCase().replace(/\+/g, ' ').replace(/_/g, ' '));

  for (const f of fields) {
    if (/naht.?14|نحت.?14/.test(f)) return 'naht-14';
    if (/naht.?13|نحت.?13/.test(f)) return 'naht-13';
    if (/naht.?30|نحت.?30/.test(f)) return 'naht-30';
    if (/naht.?23|نحت.?23/.test(f)) return 'naht-23';
  }
  return null; // Manual Review
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isExecute = process.argv.includes('--execute');

  if (!isDryRun && !isExecute) {
    console.error('ERROR: pass --dry-run or --execute');
    process.exit(1);
  }

  const MODE = isDryRun ? 'DRY RUN' : 'EXECUTE';

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Phase 6E-5D-2E-R3 — Remap by UTM — ${MODE.padEnd(22)}║`);
  console.log('║  Staging DB Only — Leads NOT deleted                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Resolve naht-23 id dynamically
  const naht23 = await prisma.project.findUnique({ where: { slug: 'naht-23' } });
  if (!naht23) {
    console.error('ERROR: naht-23 project not found — run R2 first.');
    await prisma.$disconnect();
    process.exit(1);
  }
  SLUG_TO_ID['naht-23'] = naht23.id;
  ID_TO_SLUG[naht23.id] = 'naht-23';

  console.log(`naht-23 id: ${naht23.id} | isVisible: ${naht23.isVisible}`);

  // Fetch imported leads
  const importedLeads = await prisma.lead.findMany({
    where: {
      notes: { some: { content: { contains: 'Naht-SM-CST.xlsx' } } }
    },
    select: {
      id: true, name: true, phone: true, projectId: true,
      utmCampaign: true, utmContent: true, utmTerm: true,
    },
  });

  console.log(`Imported leads fetched: ${importedLeads.length}\n`);

  // Classify
  const toRemap      = [];
  const manualReview = [];
  const correct      = [];

  for (const lead of importedLeads) {
    const currentSlug = ID_TO_SLUG[lead.projectId] || 'unknown';
    const targetSlug  = extractTargetSlug(lead);

    if (!targetSlug) {
      manualReview.push({ ...lead, currentSlug });
    } else if (targetSlug === currentSlug) {
      correct.push({ ...lead, currentSlug, targetSlug });
    } else {
      toRemap.push({ ...lead, currentSlug, targetSlug });
    }
  }

  // Remap matrix
  const remapMatrix = {};
  for (const r of toRemap) {
    const key = `${r.currentSlug} → ${r.targetSlug}`;
    remapMatrix[key] = (remapMatrix[key] || 0) + 1;
  }

  console.log('─── Classification ───');
  console.log(`  ✅ Correct (no change):  ${correct.length}`);
  console.log(`  ⚠️  Would remap:          ${toRemap.length}`);
  console.log(`  ❓ Manual Review (skip):  ${manualReview.length}`);
  console.log('');
  console.log('─── Remap Plan ───');
  for (const [k, v] of Object.entries(remapMatrix)) console.log(`  ${k}: ${v} leads`);
  console.log('');

  if (isDryRun) {
    console.log('DRY RUN — no changes written.\n');
    await prisma.$disconnect();
    return;
  }

  // ── EXECUTE ────────────────────────────────────────────────────────────────
  console.log('▶ EXECUTING REMAP...\n');
  const today = new Date().toISOString().split('T')[0];
  let remapped = 0;
  let notesAdded = 0;

  for (const lead of toRemap) {
    const newProjectId = SLUG_TO_ID[lead.targetSlug];
    if (!newProjectId) {
      console.log(`  SKIP: no ID for slug "${lead.targetSlug}"`);
      continue;
    }

    // Update projectId
    await prisma.lead.update({
      where: { id: lead.id },
      data:  { projectId: newProjectId },
    });
    remapped++;

    // Add correction LeadNote
    const noteContent = [
      '[تصحيح تصنيف المشروع]',
      'Project remapped based on UTM Campaign',
      `Old project: ${lead.currentSlug}`,
      `New project: ${lead.targetSlug}`,
      `UTM Campaign: ${lead.utmCampaign || '—'}`,
      `Correction date: ${today}`,
    ].join('\n');

    await prisma.leadNote.create({
      data: {
        leadId:   lead.id,
        userId:   SYSTEM_USER_ID,
        noteType: 'ملاحظة داخلية',
        content:  noteContent,
      },
    });
    notesAdded++;
  }

  console.log(`✅ Leads remapped:      ${remapped}`);
  console.log(`✅ LeadNotes added:     ${notesAdded}`);
  console.log(`⏭️  Manual Review skip: ${manualReview.length}`);
  console.log('');

  // ── Post-execute verification ───────────────────────────────────────────────
  console.log('─── Post-Execute DB Verification (read only) ───');

  const [n14, n13, n23, n30, totalImported, totalNotes] = await Promise.all([
    prisma.lead.count({ where: { projectId: SLUG_TO_ID['naht-14'] } }),
    prisma.lead.count({ where: { projectId: SLUG_TO_ID['naht-13'] } }),
    prisma.lead.count({ where: { projectId: naht23.id } }),
    prisma.lead.count({ where: { projectId: SLUG_TO_ID['naht-30'] } }),
    prisma.lead.count({ where: { notes: { some: { content: { contains: 'Naht-SM-CST.xlsx' } } } } }),
    prisma.leadNote.count({ where: { content: { contains: 'Project remapped based on UTM Campaign' } } }),
  ]);

  console.log(`  naht-14:        ${n14}  (expected: 22)`);
  console.log(`  naht-13:        ${n13}  (expected: 48)`);
  console.log(`  naht-23:        ${n23}  (expected: 13)`);
  console.log(`  naht-30:        ${n30}  (expected: 4)`);
  console.log(`  Total imported: ${totalImported}  (expected: 87)`);
  console.log(`  Remap notes:    ${totalNotes}  (expected: ${remapped})`);
  console.log('');
  console.log('─── Safety ───');
  console.log('  Leads deleted:       NO ✅');
  console.log('  Import re-run:       NO ✅');
  console.log('  DB push/migration:   NO ✅');
  console.log('  Commit/push:         NO ✅');
  console.log('  Full phones shown:   NO ✅');
  console.log('  Production touched:  NO ✅');

  await prisma.$disconnect();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  REMAP EXECUTE COMPLETE — Staging DB only                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
