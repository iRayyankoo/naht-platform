/**
 * verify-import-full.js
 * Phase 6E-5D-2E — Post-Import DB Verification — READ ONLY
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

function maskPhone(p) {
  const s = String(p || '');
  return s.length <= 4 ? '****' : s.slice(0, 3) + '****' + s.slice(-4);
}

async function main() {
  console.log('\n=== PHASE 6E-5D-2E — POST-IMPORT VERIFICATION (READ ONLY) ===\n');

  // --- Counts ---
  const leadsTotal    = await prisma.lead.count();
  const leadsNaht14   = await prisma.lead.count({ where: { projectId: 'cmr7tv0zn0000lb04wlwl44ww' } });
  const leadsNaht13   = await prisma.lead.count({ where: { projectId: 'cmr7tvo8a0000jv04x2vghx81' } });
  const leadsNaht30   = await prisma.lead.count({ where: { projectId: 'cmr7tw55d0000lc044sw76vak' } });
  const leadsUnmapped = await prisma.lead.count({ where: { projectId: null } });
  const leadsAssigned = await prisma.lead.count({ where: { assignedToId: { not: null } } });
  const notesTotal    = await prisma.leadNote.count();
  const usersTotal    = await prisma.user.count();

  // --- UTM check ---
  const leadsWithUtm  = await prisma.lead.count({ where: { utmSource: { not: null } } });
  const leadsWithCampaign = await prisma.lead.count({ where: { utmCampaign: { not: null } } });

  // --- Import notes check ---
  const importNotes   = await prisma.leadNote.count({ where: { content: { contains: 'مستورد من الشيت القديم' } } });
  const historyNotes  = await prisma.leadNote.count({ where: { content: { contains: 'سجل تاريخي من الشيت القديم' } } });

  // --- Projects visibility ---
  const legacyProjects = await prisma.project.findMany({
    where: { slug: { in: ['naht-14', 'naht-13', 'naht-30'] } },
    select: { slug: true, name: true, isVisible: true, _count: { select: { leads: true } } },
  });

  // --- Sample leads verification ---
  const sampleLeads = await prisma.lead.findMany({
    take: 5,
    where: { projectId: { in: ['cmr7tv0zn0000lb04wlwl44ww', 'cmr7tvo8a0000jv04x2vghx81', 'cmr7tw55d0000lc044sw76vak'] } },
    select: {
      name: true, phone: true, status: true, formType: true, leadType: true,
      assignedToId: true, projectId: true,
      utmSource: true, utmCampaign: true,
      _count: { select: { notes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // --- Print results ---
  console.log('─── Lead Counts ───');
  console.log(`  Total Leads in DB:           ${leadsTotal}`);
  console.log(`  naht-14 leads:               ${leadsNaht14}  (expected: 62)`);
  console.log(`  naht-13 leads:               ${leadsNaht13}  (expected: 21)`);
  console.log(`  naht-30 leads:               ${leadsNaht30}  (expected: 4)`);
  console.log(`  Unmapped (projectId=null):   ${leadsUnmapped}  (expected: 0)`);
  console.log(`  Assigned (assignedToId≠null):${leadsAssigned}  (expected: 0)`);
  console.log('');
  console.log('─── LeadNote Counts ───');
  console.log(`  Total LeadNotes in DB:       ${notesTotal}  (expected: 297)`);
  console.log(`  Import notes:                ${importNotes}  (expected: 87)`);
  console.log(`  History notes:               ${historyNotes}  (expected: 210)`);
  console.log('');
  console.log('─── UTM Fields ───');
  console.log(`  Leads with utmSource:        ${leadsWithUtm}`);
  console.log(`  Leads with utmCampaign:      ${leadsWithCampaign}`);
  console.log('');
  console.log('─── Users ───');
  console.log(`  Total Users in DB:           ${usersTotal}  (expected: 2 — no new users created)`);
  console.log('');
  console.log('─── Legacy Projects isVisible ───');
  legacyProjects.forEach(p => {
    const visOk = p.isVisible === false ? '✅' : '⚠️';
    console.log(`  ${visOk} ${p.slug}: name="${p.name}" | visible=${p.isVisible} | leads=${p._count.leads}`);
  });
  console.log('');
  console.log('─── Sample Leads (last 5, phones masked) ───');
  sampleLeads.forEach((l, i) => {
    console.log(`  [${i+1}] name="${l.name}" | phone=${maskPhone(l.phone)} | status="${l.status}" | formType="${l.formType}" | assigned=${l.assignedToId} | notes=${l._count.notes} | utmSrc="${l.utmSource}" | utmCampaign="${l.utmCampaign}"`);
  });

  await prisma.$disconnect();
  console.log('\n=== VERIFICATION DONE — READ ONLY ===');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
