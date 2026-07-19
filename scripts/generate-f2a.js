const { execSync } = require('child_process');

try {
  // Drop and create schema
  execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h 127.0.0.1 -p 55432 -d naht_finance_disposable_test_greenfield -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`, { stdio: 'inherit', env: { ...process.env, PGPASSWORD: 'postgres' } });
  
  // Bootstrap greenfield
  execSync(`npx tsx scripts/bootstrap-greenfield.ts`, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB',
      GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public',
      DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public'
    }
  });

  // Generate new migration
  console.log("Generating migration...");
  execSync(`npx prisma migrate dev --create-only --name finance_f2_a_journal_audit_actions`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public',
      DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public'
    }
  });

  console.log("Migration generated successfully.");
} catch (e) {
  console.error("Failed", e.message);
  process.exit(1);
}
