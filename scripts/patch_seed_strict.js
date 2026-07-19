const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// 1. Add UAT guards
if (!content.includes('process.env.SEED_PROFILE')) {
  content = content.replace('async function main() {', 'async function main() {\n  if (process.env.SEED_PROFILE !== "uat" || process.env.ALLOW_UAT_DATA_WRITE !== "true") {\n    console.error("ERROR: UAT seed rejected");\n    process.exit(1);\n  }\n');
}

// 2. Fix admin password logic
const search = `  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, role: 'ADMIN', name: '?????? ????? (UAT)' },
    create: {
      email: adminEmail,
      name: '?????? ????? (UAT)',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });`;

const searchCr = search.replace(/\n/g, '\r\n');

const replace = `  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '?????? ????? (UAT)',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  }`;

if (content.includes(search)) {
    content = content.replace(search, replace);
} else if (content.includes(searchCr)) {
    content = content.replace(searchCr, replace);
}

// 3. Remove O1 org permissions
const pStart = content.indexOf("console.log('Seeding O1 Organization Permissions...');");
const pEnd = content.indexOf("console.log('Staging UAT Seeding finished successfully.');");
if (pStart > -1 && pEnd > -1) {
    content = content.substring(0, pStart) + content.substring(pEnd);
}

fs.writeFileSync('prisma/seed.ts', content, 'utf8');
