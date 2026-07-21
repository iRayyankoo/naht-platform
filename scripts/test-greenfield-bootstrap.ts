import { spawnSync, spawn } from 'child_process';
import * as crypto from 'crypto';
import { Client } from 'pg';

function runTest(envVars: Record<string, string>, expectedErrorFragment: string) {
  const customEnv = Object.assign({}, process.env, envVars);
  const result = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/bootstrap-greenfield.ts"], { shell: false, env: customEnv });
  const output = (result.stderr ? result.stderr.toString() : "") + (result.stdout ? result.stdout.toString() : "");
  if (result.status === 0 || !output.includes(expectedErrorFragment)) {
    console.error(`TEST FAILED. Expected error containing: "${expectedErrorFragment}"`);
    console.error(`Actual output:\n${output}`);
    process.exit(1);
  }
  console.log(`✅ Passed: Rejected with "${expectedErrorFragment}"`);
}

console.log('--- Testing Greenfield Bootstrap Guards ---');

console.log('1. Missing confirmations -> Reject');
runTest(
  { DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/test', GREENFIELD_BOOTSTRAP_TARGET: '', GREENFIELD_BOOTSTRAP_CONFIRM: '' },
  'Unknown or missing GREENFIELD_BOOTSTRAP_TARGET'
);

console.log('2. Target unknown -> Reject');
runTest(
  { DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/test', GREENFIELD_BOOTSTRAP_TARGET: 'UNKNOWN', GREENFIELD_BOOTSTRAP_CONFIRM: '123' },
  'Unknown or missing GREENFIELD_BOOTSTRAP_TARGET'
);

console.log('3. "true" as confirmation -> Reject');
runTest(
  { DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/test', GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB', GREENFIELD_BOOTSTRAP_CONFIRM: 'true' },
  'incorrect'
);

console.log('4. Test confirmation with Production -> Reject');
runTest(
  { DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/test', GREENFIELD_BOOTSTRAP_TARGET: 'PRODUCTION', GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE' },
  'incorrect'
);

console.log('5. Production confirmation with Test -> Reject');
runTest(
  { DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/test', GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB', GREENFIELD_BOOTSTRAP_CONFIRM: 'I_ACKNOWLEDGE_THIS_IS_PRODUCTION_AND_CONFIRM_EMPTY_BOOTSTRAP' },
  'incorrect'
);

async function runConcurrencyTest() {
  console.log('6. Concurrency -> Reject second instance');
  const randomDb = `naht_finance_disposable_test_greenfield_${crypto.randomBytes(4).toString('hex')}`;
  const env = {
    ...process.env,
    DATABASE_URL: `postgresql://postgres@127.0.0.1:55432/${randomDb}?schema=public`,
    GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB',
    GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE'
  };

  const setupClient = new Client({ connectionString: "postgresql://postgres@127.0.0.1:55432/postgres" });
  await setupClient.connect();
  try {
    await setupClient.query(`CREATE DATABASE ${randomDb}`);
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Failed to create test database: ${e.message}`);
    }
    throw e;
  }

  try {
    const runProcess = () => {
      return new Promise<string>((resolve) => {
        const proc = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/bootstrap-greenfield.ts"], { env: env, shell: false });
        let out = "";
        proc.stdout.on('data', d => out += d.toString());
        proc.stderr.on('data', d => out += d.toString());
        proc.on('close', () => resolve(out));
      });
    };

    const p1 = runProcess();
    const p2 = runProcess();

    const [res1, res2] = await Promise.all([p1, p2]);
    const combined = res1 + res2;

    if (combined.includes('Another bootstrap process is currently running')) {
      console.log(`✅ Passed: Concurrency lock successfully triggered. One process was rejected.`);
    } else {
      console.error(`TEST FAILED: Concurrency lock did not trigger correctly.`);
      console.error(`Output 1:\n${res1}`);
      console.error(`Output 2:\n${res2}`);
      process.exit(1);
    }
  } finally {
    // Drop the test database to clean up
    try {
      await setupClient.query(`DROP DATABASE ${randomDb} WITH (FORCE)`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`Failed to drop test database: ${e.message}`);
      }
    }
    await setupClient.end();
  }
}

runConcurrencyTest().then(() => {
  console.log('All standalone guard tests passed.');
}).catch(err => {
  console.error("Concurrency test failed:", err);
  process.exit(1);
});
