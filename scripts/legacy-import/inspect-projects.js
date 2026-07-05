/**
 * inspect-projects.js
 * Phase 6E-5D-2A — Read-only project inspection
 * NO writes. NO imports. Audit only.
 */
'use strict';

const path = require('path');
const fs   = require('fs');
const projectRoot = path.join(__dirname, '../../');

// Parse .env manually — do NOT print secrets
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

async function main() {
  console.log('=== CRM Projects (Staging DB) — READ ONLY ===');
  console.log('');

  const projects = await prisma.project.findMany({
    select: {
      id:           true,
      name:         true,
      slug:         true,
      status:       true,
      isVisible:    true,
      city:         true,
      neighborhood: true,
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total projects: ${projects.length}`);
  console.log('');

  projects.forEach((p, i) => {
    console.log(`[${i+1}] name="${p.name}" | slug="${p.slug}" | status="${p.status}" | visible=${p.isVisible} | leads=${p._count.leads}`);
    console.log(`     id="${p.id}" | city="${p.city||'—'}" | neighborhood="${p.neighborhood||'—'}"`);
    console.log('');
  });

  // Also check users
  console.log('=== CRM Users (Staging DB) — READ ONLY ===');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Total users: ${users.length}`);
  users.forEach((u, i) => {
    console.log(`[${i+1}] name="${u.name}" | email="${u.email||'—'}" | role="${u.role}" | active=${u.isActive} | id="${u.id}"`);
  });

  console.log('');
  console.log('DONE — No writes performed.');
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
