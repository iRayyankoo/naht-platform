import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { spawnSync } from 'child_process';

const BOOTSTRAP_DIR = path.join(__dirname, '../prisma/bootstrap/v1');
const SCHEMA_FILE = path.join(BOOTSTRAP_DIR, 'schema.sql');
const MANIFEST_FILE = path.join(BOOTSTRAP_DIR, 'manifest.json');
const DUMMY_BASELINE_FILE = path.join(__dirname, '../prisma/migrations/20260101000000_baseline/migration.sql');

function getSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

async function main() {
  const target = process.env.GREENFIELD_BOOTSTRAP_TARGET;
  const confirm = process.env.GREENFIELD_BOOTSTRAP_CONFIRM;
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    throw new Error('Valid DATABASE_URL is required.');
  }

  // Guard: Confirmations
  if (target === 'ISOLATED_DISPOSABLE_DB') {
    if (confirm !== 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE') {
      throw new Error('Test environment target specified, but confirmation phrase is incorrect.');
    }
    const url = new URL(dbUrl);
    if (url.hostname.toLowerCase() !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new Error('Test environment MUST use localhost/127.0.0.1');
    }
    if (url.port !== '55432') {
      throw new Error('Test environment MUST use port 55432');
    }
    const dbName = url.pathname.substring(1);
    if (['postgres', 'template0', 'template1'].includes(dbName.toLowerCase())) {
      throw new Error('Cannot target default system databases');
    }

  } else if (target === 'PRODUCTION') {
    if (confirm !== 'I_ACKNOWLEDGE_THIS_IS_PRODUCTION_AND_CONFIRM_EMPTY_BOOTSTRAP') {
      throw new Error('Production environment target specified, but confirmation phrase is incorrect.');
    }
    console.warn('WARNING: Running Greenfield Bootstrap on Production Target.');
  } else {
    throw new Error('Unknown or missing GREENFIELD_BOOTSTRAP_TARGET. Must be ISOLATED_DISPOSABLE_DB or PRODUCTION.');
  }

  // Guard: Hashes and Manifest
  if (!fs.existsSync(MANIFEST_FILE) || !fs.existsSync(SCHEMA_FILE)) {
    throw new Error('Bootstrap files not found.');
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
  const currentSchemaHash = getSha256(SCHEMA_FILE);
  const currentBaselineHash = getSha256(DUMMY_BASELINE_FILE);

  if (currentSchemaHash !== manifest.schemaSha256) {
    throw new Error(`Schema file hash mismatch. Expected ${manifest.schemaSha256}, got ${currentSchemaHash}`);
  }
  if (currentBaselineHash !== manifest.dummyBaselineSha256) {
    throw new Error(`Dummy baseline hash mismatch. Expected ${manifest.dummyBaselineSha256}, got ${currentBaselineHash}`);
  }

  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
  // Strict regex for DML is prone to false positives in trigger functions.
  // We rely on the SHA256 hash to ensure the schema is untampered.

  const pgUrl = dbUrl.split('?')[0];
  const client = new Client({ connectionString: pgUrl });
  try {
    await client.connect();
  } catch (e) {
    throw new Error('Failed to connect to database.');
  }

  // Guard: Advisory Lock
  const LOCK_ID = 20260101;
  const lockRes = await client.query(`SELECT pg_try_advisory_lock(${LOCK_ID}) as acquired`);
  if (!lockRes.rows[0].acquired) {
    await client.end();
    throw new Error('Another bootstrap process is currently running. Exiting.');
  }

  try {
    // Guard: Empty Database Check
    const tableRes = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', '_prisma_migrations')
    `);
    
    if (tableRes.rowCount && tableRes.rowCount > 0) {
      const tables = tableRes.rows.map((r: any) => r.tablename);
      throw new Error(`Database is not empty! Found protected tables: ${tables.join(', ')}`);
    }

    console.log('Applying foundational schema.sql...');
    try {
      const dbUrlObj = new URL(dbUrl);
      const dbNameForPsql = dbUrlObj.pathname.substring(1);
      const psqlRes = spawnSync("C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe", ["-U", "postgres", "-h", "127.0.0.1", "-p", "55432", "-d", dbNameForPsql, "-f", SCHEMA_FILE], { stdio: 'inherit', shell: false });
      if (psqlRes.status !== 0) throw new Error("Schema application failed.");
    } catch (e) {
      throw new Error(`Schema application failed.`);
    }

    // Verify Core Objects
    console.log('Verifying core objects...');
    for (const obj of manifest.expectedCoreObjects) {
      const checkRes = await client.query(`SELECT to_regclass('public."${obj}"') as exists`);
      if (!checkRes.rows[0].exists) {
        throw new Error(`Expected core object "${obj}" was not created.`);
      }
    }

    // Run Prisma Baseline Resolve
    for (const migration of manifest.coveredMigrations) {
      console.log(`Resolving baseline migration: ${migration}...`);
      const res = spawnSync(process.execPath, [path.join(__dirname, '../node_modules/prisma/build/index.js'), 'migrate', 'resolve', '--applied', migration], { stdio: 'inherit', shell: false });
      if (res.status !== 0) throw new Error("migrate resolve failed");
    }

    // Run Prisma Deploy
    console.log('Running prisma migrate deploy...');
    const depRes = spawnSync(process.execPath, [path.join(__dirname, '../node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { stdio: 'inherit', shell: false });
    if (depRes.status !== 0) throw new Error("migrate deploy failed");

    // Verify completion
    console.log('Running prisma migrate status...');
    const statRes = spawnSync(process.execPath, [path.join(__dirname, '../node_modules/prisma/build/index.js'), 'migrate', 'status'], { stdio: 'inherit', shell: false });
    if (statRes.status !== 0) throw new Error("migrate status failed");

    console.log('Greenfield Bootstrap completed successfully.');

  } finally {
    await client.query(`SELECT pg_advisory_unlock(${LOCK_ID})`);
    await client.end();
  }
}

main().catch(e => {
  console.error('Bootstrap Failed:');
  console.error(e.message);
  process.exit(1);
});
