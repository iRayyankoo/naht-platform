const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// Use a regex to replace the admin upsert block
const regex = /\/\/ 1\. Admin User[\s\S]*?\/\/ 2\. Site Settings/;
const replacement = `// 1. Admin User
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '?????? ????? (UAT)',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  }

  // 2. Site Settings`;

content = content.replace(regex, replacement);
fs.writeFileSync('prisma/seed.ts', content, 'utf8');
