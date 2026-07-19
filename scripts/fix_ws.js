const fs = require('fs');
const files = ['src/actions/org-departments.ts', 'src/actions/users.ts', 'src/app/crm/layout.tsx'];
for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/[ \t]+\r?\n/g, '\n');
  fs.writeFileSync(file, content);
}
