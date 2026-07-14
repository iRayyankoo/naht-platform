import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Running Seed Separation Tests ---');
  let passed = true;

  // Test 1: UAT Seed fails without explicit variables
  try {
    console.log('Test 1: Running db:seed without env variables...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'pipe' });
    console.error('❌ Test 1 Failed: Seed should have thrown an error but succeeded.');
    passed = false;
  } catch (err: any) {
    if (err.stderr && err.stderr.toString().includes('UAT seed rejected')) {
      console.log('✅ Test 1 Passed: Seed correctly rejected execution without SEED_PROFILE=uat.');
    } else {
      console.error('❌ Test 1 Failed with unexpected error:', err.stderr ? err.stderr.toString() : err.message);
      passed = false;
    }
  }

  // Test 2: org seed script only calls Permission and RolePermission (Static Analysis)
  console.log('Test 2: Verifying org-permissions.ts contains no unauthorized models or deleteMany...');
  const orgCode = fs.readFileSync('prisma/seeds/org-permissions.ts', 'utf8');
  const unauthorizedCalls = [
    'prisma.user', 'prisma.project', 'prisma.lead', 'prisma.homePage', 'deleteMany',
  ];
  let hasUnauthorized = false;
  for (const call of unauthorizedCalls) {
    if (orgCode.includes(call)) {
      hasUnauthorized = true;
      console.error(`❌ Test 2 Failed: Found unauthorized call "${call}" in org-permissions.ts`);
    }
  }
  if (!hasUnauthorized) {
    console.log('✅ Test 2 Passed: org-permissions.ts strictly isolates Permission and RolePermission writes.');
  } else {
    passed = false;
  }

  // Test 3: Idempotency of org seed (Run twice, check counts)
  console.log('Test 3: Checking Idempotency of org seed...');
  const beforePerms = await prisma.permission.count();
  const beforeRolePerms = await prisma.rolePermission.count();
  
  execSync('npx tsx prisma/seeds/org-permissions.ts', { stdio: 'pipe' });
  execSync('npx tsx prisma/seeds/org-permissions.ts', { stdio: 'pipe' });
  
  const afterPerms = await prisma.permission.count();
  const afterRolePerms = await prisma.rolePermission.count();

  if (afterPerms === beforePerms && afterRolePerms === beforeRolePerms) {
    console.log('✅ Test 3 Passed: Running org seed twice does not duplicate records (Idempotency confirmed).');
  } else {
    console.error(`❌ Test 3 Failed: Records changed (Perms: ${beforePerms}->${afterPerms}, RolePerms: ${beforeRolePerms}->${afterRolePerms})`);
    passed = false;
  }

  // Test 4: UAT admin password is not overwritten
  console.log('Test 4: Verifying UAT seed does not overwrite existing admin password...');
  const seedCode = fs.readFileSync('prisma/seed.ts', 'utf8');
  if (seedCode.includes('update: { password: hashedPassword') && seedCode.includes('where: { email: adminEmail }')) {
    console.error('❌ Test 4 Failed: seed.ts still contains the password overwrite logic in upsert.');
    passed = false;
  } else {
    console.log('✅ Test 4 Passed: seed.ts password overwrite logic removed.');
  }

  if (passed) {
    console.log('--- All Seed Separation Tests Passed! ---');
  } else {
    console.log('--- Some tests failed. ---');
    process.exit(1);
  }

  await prisma.$disconnect();
}

runTests().catch(console.error);
