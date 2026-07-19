const { execSync } = require('child_process');
const fs = require('fs');

const envVars = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    acc[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
  return acc;
}, {});

let url = envVars.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
url = url.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');

const backupPath = 'C:\\tmp\\backup_staging_db_before_admin_fix_2026_07_14.dump';
console.log('Taking backup to ' + backupPath);

try {
  execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe" "${url}" -F c -f ${backupPath}`, { stdio: 'inherit' });
  console.log('Backup successful.');
} catch (e) {
  console.error('Backup failed:', e.message);
  process.exit(1);
}
