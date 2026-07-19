const fs = require('fs');
const files = fs.readdirSync('src/components/crm/organization/modals').filter(f => f.endsWith('.tsx')).map(f => 'src/components/crm/organization/modals/' + f);
for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Promise<any>/g, 'Promise<unknown>');
  fs.writeFileSync(file, content);
}
