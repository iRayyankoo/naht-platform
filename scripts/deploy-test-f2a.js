const { execSync } = require('child_process');

try {
  const env = {
    ...process.env,
    GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB',
    GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE',
    DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public',
    DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public'
  };

  // Drop and create schema
  execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h 127.0.0.1 -p 55432 -d naht_finance_disposable_test_greenfield -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`, { stdio: 'inherit', env: { ...env, PGPASSWORD: 'postgres' } });
  
  // Bootstrap greenfield (this includes prisma migrate deploy)
  console.log("Bootstrapping database...");
  execSync(`npx tsx scripts/bootstrap-greenfield.ts`, { stdio: 'inherit', env });

  // Prisma generate to update client
  console.log("Generating Prisma client...");
  execSync(`npx prisma generate`, { stdio: 'inherit', env });

  // Run the test
  console.log("Running audit actions test...");
  execSync(`npx tsx scripts/test-finance-f2-a-audit-actions.ts`, { stdio: 'inherit', env });

  console.log("All tasks completed successfully.");
} catch (e) {
  console.error("Failed", e.message);
  process.exit(1);
}
