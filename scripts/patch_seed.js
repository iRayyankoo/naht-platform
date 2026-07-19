const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// 1. Add UAT guards at the beginning
const guards = `
  if (process.env.SEED_PROFILE !== 'uat') {
    console.error('ERROR: UAT seed must be run with SEED_PROFILE=uat');
    process.exit(1);
  }
  if (process.env.ALLOW_UAT_DATA_WRITE !== 'true') {
    console.error('ERROR: UAT seed must be run with ALLOW_UAT_DATA_WRITE=true');
    process.exit(1);
  }
`;

content = content.replace('async function main() {', 'async function main() {' + guards);

// 2. Fix admin password logic: do not overwrite if exists
const adminUpsertOld = `
  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, role: 'ADMIN', name: '?????? ????? (UAT)' },
    create: {
      email: adminEmail,
      name: '?????? ????? (UAT)',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
`;

const adminUpsertNew = `
  // 1. Admin User
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: '?????? ????? (UAT)',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  }
`;

content = content.replace(adminUpsertOld.trim(), adminUpsertNew.trim());

// 3. Remove O1 org permissions
const orgPermsStart = content.indexOf(`console.log('Seeding O1 Organization Permissions...');`);
const orgPermsEnd = content.indexOf(`console.log('Staging UAT Seeding finished successfully.');`);

if (orgPermsStart !== -1 && orgPermsEnd !== -1) {
    content = content.substring(0, orgPermsStart) + content.substring(orgPermsEnd);
}

fs.writeFileSync('prisma/seed.ts', content, 'utf8');
