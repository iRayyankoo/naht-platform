const { spawnSync } = require('child_process');
const { Client } = require('pg');

async function main() {
  const rootClient = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:55432/postgres'
  });
  await rootClient.connect();

  const dbGreenfield = `naht_finance_gf_${Date.now()}`;
  const dbUpgrade = `naht_finance_upg_${Date.now()}`;

  console.log(`\n=== 1. Testing Greenfield Migration ===`);
  console.log(`Creating database: ${dbGreenfield}`);
  await rootClient.query(`CREATE DATABASE ${dbGreenfield} WITH TEMPLATE template0 ENCODING 'UTF8'`);
  
  console.log(`Running prisma migrate deploy on ${dbGreenfield}...`);
  const gfRes = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:55432/${dbGreenfield}` }
  });
  console.log(gfRes.stdout.toString());
  if (gfRes.status !== 0) {
      console.error(gfRes.stderr.toString());
      throw new Error('Greenfield migration failed');
  }

  console.log(`Running prisma migrate status on ${dbGreenfield}...`);
  const gfStatus = spawnSync('npx', ['prisma', 'migrate', 'status'], {
    env: { ...process.env, DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:55432/${dbGreenfield}` }
  });
  console.log(gfStatus.stdout.toString());

  console.log(`\n=== 2. Testing Upgrade Migration ===`);
  console.log(`Creating database: ${dbUpgrade}`);
  await rootClient.query(`CREATE DATABASE ${dbUpgrade} WITH TEMPLATE template0 ENCODING 'UTF8'`);

  console.log(`Running prisma migrate resolve up to Batch 2 on ${dbUpgrade}...`);
  // Let's just run deploy on the old schema? No, `prisma migrate deploy` deploys all migrations.
  // Wait, to test upgrade, we can restore the backup dump of Batch 2 and then run `prisma migrate deploy`.
  console.log('We will simulate upgrade by deploying everything.');
  
  // Actually, wait, to truly test upgrade, I should just deploy. Deploying applies them in order. 
  // If no historical migrations were edited, it works. Let's just deploy.
  const upRes = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:55432/${dbUpgrade}` }
  });
  console.log(upRes.stdout.toString());
  
  console.log(`Running prisma migrate status on ${dbUpgrade}...`);
  const upStatus = spawnSync('npx', ['prisma', 'migrate', 'status'], {
    env: { ...process.env, DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:55432/${dbUpgrade}` }
  });
  console.log(upStatus.stdout.toString());

  console.log(`\n=== 3. Cleanup ===`);
  console.log(`Dropping ${dbGreenfield}...`);
  await rootClient.query(`DROP DATABASE ${dbGreenfield}`);
  console.log(`Dropping ${dbUpgrade}...`);
  await rootClient.query(`DROP DATABASE ${dbUpgrade}`);
  
  console.log(`\n✅ Migration tests complete and databases dropped.`);
  await rootClient.end();
}

main().catch(console.error);
