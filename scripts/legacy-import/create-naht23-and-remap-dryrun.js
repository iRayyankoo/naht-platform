/**
 * create-naht23-and-remap-dryrun.js
 * Phase 6E-5D-2E-R2
 *
 * Step 1: Create hidden project naht-23 in Staging (if not exists)
 * Step 2: Dry Run remap — show what WOULD change, no lead updates
 *
 * Safety: Never writes to Lead records. Only creates project if needed.
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

// ── Project slugs ────────────────────────────────────────────────────────────
const KNOWN_SLUGS = {
  'cmr7tv0zn0000lb04wlwl44ww': 'naht-14',
  'cmr7tvo8a0000jv04x2vghx81': 'naht-13',
  'cmr7tw55d0000lc044sw76vak': 'naht-30',
};

function maskPhone(p) {
  const s = String(p || '');
  return s.length <= 4 ? '****' : s.slice(0, 3) + '****' + s.slice(-4);
}
function maskName(n) {
  if (!n) return '***';
  const parts = n.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1) + '***';
  return parts[0].slice(0, 1) + '*** ' + parts[parts.length - 1].slice(0, 1) + '***';
}

/**
 * Extract target project slug from UTM fields.
 * Priority: utmCampaign → utmContent → utmTerm
 */
function extractTargetSlug(lead) {
  const fields = [
    lead.utmCampaign,
    lead.utmContent,
    lead.utmTerm,
  ].filter(Boolean).map(f => f.toLowerCase().replace(/\+/g, ' ').replace(/_/g, ' '));

  for (const f of fields) {
    if (/naht.?14|نحت.?14/.test(f)) return { slug: 'naht-14', reason: `utmCampaign="${lead.utmCampaign}"` };
    if (/naht.?13|نحت.?13/.test(f)) return { slug: 'naht-13', reason: `utmCampaign="${lead.utmCampaign}"` };
    if (/naht.?30|نحت.?30/.test(f)) return { slug: 'naht-30', reason: `utmCampaign="${lead.utmCampaign}"` };
    if (/naht.?23|نحت.?23/.test(f)) return { slug: 'naht-23', reason: `utmCampaign="${lead.utmCampaign}"` };
  }
  return { slug: null, reason: `utmCampaign="${lead.utmCampaign}" — unclear` };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Phase 6E-5D-2E-R2 — naht-23 Create + Remap Dry Run        ║');
  console.log('║  Staging DB Only — READ ONLY for Leads                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── STEP 1: Create naht-23 if not exists ─────────────────────────────────
  console.log('─── Step 1: naht-23 Project ───');

  let naht23 = await prisma.project.findUnique({ where: { slug: 'naht-23' } });
  let naht23Created = false;

  if (naht23) {
    console.log(`  ✅ naht-23 already exists — id="${naht23.id}" | isVisible=${naht23.isVisible}`);
  } else {
    console.log('  ⚙️  naht-23 not found — creating...');
    naht23 = await prisma.project.create({
      data: {
        slug:          'naht-23',
        name:          'مشروع نحت 23',
        type:          'RESIDENTIAL',
        city:          'الرياض',
        neighborhood:  'غير محدد',
        status:        'AVAILABLE',
        isVisible:     false,
        isFeatured:    false,
        shortDesc:     'مشروع نحت 23 - مشروع داخلي لتصنيف عملاء الحملات القديمة',
        fullDesc:      'مشروع داخلي مخفي لتصنيف عملاء الحملات القديمة الخاصة بمشروع نحت 23. لا يظهر في الموقع العام.',
      },
    });
    naht23Created = true;
    console.log(`  ✅ naht-23 created — id="${naht23.id}" | isVisible=${naht23.isVisible}`);
  }
  console.log('');

  // Build full slug→id map including naht-23
  const slugToId = {
    ...Object.fromEntries(Object.entries(KNOWN_SLUGS).map(([id, slug]) => [slug, id])),
    'naht-23': naht23.id,
  };

  // ── STEP 2: Fetch imported leads ──────────────────────────────────────────
  console.log('─── Step 2: Fetching imported leads ───');

  const importedLeads = await prisma.lead.findMany({
    where: {
      notes: { some: { content: { contains: 'Naht-SM-CST.xlsx' } } }
    },
    select: {
      id: true, name: true, phone: true, projectId: true,
      utmCampaign: true, utmContent: true, utmTerm: true, utmSource: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`  Imported leads found: ${importedLeads.length}\n`);

  // ── STEP 3: Classify ──────────────────────────────────────────────────────
  const correct      = [];
  const toRemap      = [];
  const manualReview = [];

  // Remap frequency matrix
  const remapMatrix = {};

  for (const lead of importedLeads) {
    const currentSlug = KNOWN_SLUGS[lead.projectId] ||
      (lead.projectId === naht23.id ? 'naht-23' : 'unknown');

    const { slug: targetSlug, reason } = extractTargetSlug(lead);

    const entry = {
      maskedName:  maskName(lead.name),
      maskedPhone: maskPhone(lead.phone),
      currentSlug,
      targetSlug,
      utmCampaign: lead.utmCampaign,
      reason,
    };

    if (!targetSlug) {
      manualReview.push(entry);
    } else if (targetSlug === currentSlug) {
      correct.push(entry);
    } else {
      const key = `${currentSlug} → ${targetSlug}`;
      remapMatrix[key] = (remapMatrix[key] || 0) + 1;
      toRemap.push(entry);
    }
  }

  // ── STEP 4: Print Dry Run results ─────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('MODE: DRY RUN — No Lead records changed');
  console.log('═══════════════════════════════════════\n');

  console.log('─── Categorization ───');
  console.log(`  ✅ Correct (no change needed):       ${correct.length}`);
  console.log(`  ⚠️  Would remap (needs correction):   ${toRemap.length}`);
  console.log(`  ❓ Manual Review (UTM unclear):       ${manualReview.length}`);
  console.log(`  Total:                                ${importedLeads.length}`);
  console.log('');

  console.log('─── Remap Summary (DRY RUN) ───');
  if (Object.keys(remapMatrix).length === 0) {
    console.log('  No remaps needed ✅');
  } else {
    for (const [key, count] of Object.entries(remapMatrix)) {
      console.log(`  ${key}: ${count} leads`);
    }
  }
  console.log('');

  // ── Show remap examples ───────────────────────────────────────────────────
  const byTarget = {};
  for (const r of toRemap) {
    if (!byTarget[r.targetSlug]) byTarget[r.targetSlug] = [];
    byTarget[r.targetSlug].push(r);
  }

  for (const [target, rows] of Object.entries(byTarget)) {
    console.log(`─── Would remap TO ${target} (${rows.length} leads, masked) ───`);
    rows.slice(0, 6).forEach(r => {
      console.log(`  name=${r.maskedName} | from=${r.currentSlug} | utmCampaign="${r.utmCampaign}"`);
    });
    if (rows.length > 6) console.log(`  ... and ${rows.length - 6} more`);
    console.log('');
  }

  // ── Manual Review examples ────────────────────────────────────────────────
  console.log(`─── Manual Review (${manualReview.length} leads, unclear UTM) ───`);
  manualReview.slice(0, 5).forEach(r => {
    console.log(`  name=${r.maskedName} | current=${r.currentSlug} | utmCampaign="${r.utmCampaign}"`);
  });
  if (manualReview.length > 5) console.log(`  ... and ${manualReview.length - 5} more`);
  console.log('');

  // ── Safety checks ─────────────────────────────────────────────────────────
  console.log('─── Safety ───');
  console.log(`  naht-23 project created: ${naht23Created ? 'YES (new)' : 'NO (already existed)'}`);
  console.log(`  naht-23 isVisible=false: ${!naht23.isVisible ? 'YES ✅' : '⚠️ CHECK'}`);
  console.log(`  Lead records modified:   NO ✅`);
  console.log(`  Leads deleted:           NO ✅`);
  console.log(`  Import re-run:           NO ✅`);
  console.log(`  Commit/push/db push:     NO ✅`);
  console.log('');

  // ── Write report JSON ────────────────────────────────────────────────────
  const reportPath = path.join(__dirname, 'remap-dryrun-r2-report.json');
  const report = {
    generatedAt: new Date().toISOString(),
    phase: '6E-5D-2E-R2',
    mode: 'DRY RUN — Leads NOT modified',
    naht23: { id: naht23.id, isVisible: naht23.isVisible, created: naht23Created },
    totalImported: importedLeads.length,
    correct:       correct.length,
    wouldRemap:    toRemap.length,
    manualReview:  manualReview.length,
    remapMatrix,
    remapExamples: toRemap.slice(0, 20).map(r => ({
      maskedName: r.maskedName,
      from: r.currentSlug,
      to: r.targetSlug,
      utmCampaign: r.utmCampaign,
    })),
    manualReviewExamples: manualReview.slice(0, 10).map(r => ({
      maskedName: r.maskedName,
      current: r.currentSlug,
      utmCampaign: r.utmCampaign,
    })),
    safetyChecks: {
      leadRecordsModified: false,
      leadsDeleted: false,
      importReRun: false,
      commitPushDone: false,
      productionTouched: false,
    },
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`JSON report: ${reportPath}`);
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  DRY RUN COMPLETE — No Lead data was changed                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
