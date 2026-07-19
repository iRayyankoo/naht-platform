/**
 * remap-audit-by-utm.js
 * Phase 6E-5D-2E-R1 — Imported Leads Project Remap Audit
 *
 * READ ONLY — No DB writes.
 * Identifies imported leads where projectId may need correction
 * based on utmCampaign (source of truth) vs Legacy project label.
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

// ── Project map ──────────────────────────────────────────────────────────────
const PROJECT_SLUGS = {
  'cmr7tv0zn0000lb04wlwl44ww': 'naht-14',
  'cmr7tvo8a0000jv04x2vghx81': 'naht-13',
  'cmr7tw55d0000lc044sw76vak': 'naht-30',
};
const PROJECT_IDS = {
  'naht-14': 'cmr7tv0zn0000lb04wlwl44ww',
  'naht-13': 'cmr7tvo8a0000jv04x2vghx81',
  'naht-30': 'cmr7tw55d0000lc044sw76vak',
};

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

/**
 * Extract target project slug from UTM fields.
 * Priority: utmCampaign → utmContent → utmTerm → utmMedium
 */
function extractTargetProject(lead) {
  const fields = [
    lead.utmCampaign,
    lead.utmContent,
    lead.utmTerm,
    lead.utmMedium,
  ].filter(Boolean).map(f => f.toLowerCase().replace(/\+/g, ' '));

  for (const f of fields) {
    if (/naht.?14|نحت.?14/.test(f)) return { slug: 'naht-14', source: 'utmCampaign/content' };
    if (/naht.?13|نحت.?13/.test(f)) return { slug: 'naht-13', source: 'utmCampaign/content' };
    if (/naht.?30|نحت.?30/.test(f)) return { slug: 'naht-30', source: 'utmCampaign/content' };
  }

  return { slug: null, source: 'not_determinable' };
}

/**
 * Extract Legacy project label from import note
 */
function extractLegacyLabel(notes) {
  for (const note of notes) {
    const m = (note.content || '').match(/Legacy project label:\s*(Naht-\d+)/i);
    if (m) return m[1];
  }
  return null;
}

async function main() {
  console.log('\n=== PHASE 6E-5D-2E-R1 — REMAP AUDIT (READ ONLY) ===\n');

  // Fetch all imported leads (identified by LeadNote containing import marker)
  const importedLeads = await prisma.lead.findMany({
    where: {
      notes: {
        some: {
          content: { contains: 'Naht-SM-CST.xlsx' }
        }
      }
    },
    select: {
      id: true, name: true, phone: true,
      projectId: true,
      utmSource: true, utmMedium: true, utmCampaign: true,
      utmContent: true, utmTerm: true,
      notes: {
        where: { content: { contains: 'مستورد من الشيت القديم' } },
        select: { content: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Imported leads found: ${importedLeads.length}\n`);

  // ── Categorize ────────────────────────────────────────────────────────────
  const correct       = [];
  const needsRemap    = [];
  const needsReview   = [];

  // Correction frequency table: "from → to"
  const remapMatrix = {};

  for (const lead of importedLeads) {
    const currentSlug = PROJECT_SLUGS[lead.projectId] || 'unknown';
    const { slug: targetSlug, source } = extractTargetProject(lead);
    const legacyLabel = extractLegacyLabel(lead.notes);

    const row = {
      id:           lead.id,
      maskedName:   maskName(lead.name),
      maskedPhone:  maskPhone(lead.phone),
      currentSlug,
      utmCampaign:  lead.utmCampaign,
      utmSource:    lead.utmSource,
      targetSlug,
      utmSource_:   source,
      legacyLabel,
    };

    if (!targetSlug) {
      needsReview.push(row);
    } else if (targetSlug === currentSlug) {
      correct.push(row);
    } else {
      const key = `${currentSlug} → ${targetSlug}`;
      remapMatrix[key] = (remapMatrix[key] || 0) + 1;
      needsRemap.push(row);
    }
  }

  // ── Print summary ─────────────────────────────────────────────────────────
  console.log('─── Categorization ───');
  console.log(`  ✅ Correct (currentProject = utmCampaign target): ${correct.length}`);
  console.log(`  ⚠️  Needs Remap (mismatch between current and UTM): ${needsRemap.length}`);
  console.log(`  ❓ Needs Manual Review (utmCampaign unclear): ${needsReview.length}`);
  console.log(`  Total: ${importedLeads.length}`);
  console.log('');

  // ── Remap matrix ──────────────────────────────────────────────────────────
  console.log('─── Correction Summary (from → to) ───');
  if (Object.keys(remapMatrix).length === 0) {
    console.log('  No remaps needed ✅');
  } else {
    for (const [key, count] of Object.entries(remapMatrix)) {
      console.log(`  ${key}: ${count} leads`);
    }
  }
  console.log('');

  // ── Examples of mismatches ────────────────────────────────────────────────
  console.log('─── Examples of Leads Needing Remap (masked) ───');
  const showRemap = needsRemap.slice(0, 10);
  for (const r of showRemap) {
    console.log(`  name=${r.maskedName} | current=${r.currentSlug} | utmCampaign="${r.utmCampaign}" | target=${r.targetSlug} | legacy=${r.legacyLabel}`);
  }
  if (needsRemap.length > 10) {
    console.log(`  ... and ${needsRemap.length - 10} more`);
  }
  console.log('');

  // ── Manual Review examples ────────────────────────────────────────────────
  console.log('─── Examples of Leads Needing Manual Review ───');
  const showReview = needsReview.slice(0, 5);
  for (const r of showReview) {
    console.log(`  name=${r.maskedName} | current=${r.currentSlug} | utmCampaign="${r.utmCampaign}" | legacy=${r.legacyLabel}`);
  }
  if (needsReview.length > 5) {
    console.log(`  ... and ${needsReview.length - 5} more`);
  }
  console.log('');

  // ── UTM Campaign breakdown ────────────────────────────────────────────────
  // Count unique utmCampaign values
  const campaignCounts = {};
  for (const l of importedLeads) {
    const c = l.utmCampaign || '(empty)';
    campaignCounts[c] = (campaignCounts[c] || 0) + 1;
  }
  console.log('─── UTM Campaign Values (all imported leads) ───');
  for (const [campaign, count] of Object.entries(campaignCounts).sort((a,b)=>b[1]-a[1])) {
    const { slug } = extractTargetProject({ utmCampaign: campaign });
    console.log(`  "${campaign}" (${count} leads) → maps to: ${slug || '❓ unclear'}`);
  }
  console.log('');

  // ── Write JSON report (not committed) ─────────────────────────────────────
  const report = {
    generatedAt: new Date().toISOString(),
    phase: '6E-5D-2E-R1',
    mode: 'READ_ONLY — NO DB CHANGES',
    totalImported: importedLeads.length,
    correct: correct.length,
    needsRemap: needsRemap.length,
    needsManualReview: needsReview.length,
    remapMatrix,
    campaignCounts,
    // masked samples only
    remapExamples: needsRemap.slice(0, 20).map(r => ({
      maskedName: r.maskedName,
      current: r.currentSlug,
      target: r.targetSlug,
      utmCampaign: r.utmCampaign,
      legacy: r.legacyLabel,
    })),
    reviewExamples: needsReview.slice(0, 10).map(r => ({
      maskedName: r.maskedName,
      current: r.currentSlug,
      utmCampaign: r.utmCampaign,
      legacy: r.legacyLabel,
    })),
    safetyChecks: {
      dbWritesDone: false,
      leadsDeleted: false,
      importRunAgain: false,
      commitPushDone: false,
    },
  };

  const reportPath = path.join(__dirname, 'remap-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`JSON report written: ${reportPath}`);
  console.log('\n=== AUDIT COMPLETE — READ ONLY — NO DB CHANGES ===\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
