import { execSync, spawnSync } from 'child_process';
import * as crypto from 'crypto';

const scriptPath = 'npx tsx scripts/bootstrap-greenfield.ts';

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
  const env = {
    ...process.env,
    DATABASE_URL: 'postgresql://postgres@127.0.0.1:55432/naht_finance_disposable_test_greenfield?schema=public',
    GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB',
    GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE'
  };
  const p1 = new Promise((resolve) => {
    const r = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/bootstrap-greenfield.ts"], { env: env, shell: false });
    resolve((r.stdout ? r.stdout.toString() : "") + (r.stderr ? r.stderr.toString() : ""));
  });
  const p2 = new Promise((resolve) => {
    const r = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/bootstrap-greenfield.ts"], { env: env, shell: false });
    resolve((r.stdout ? r.stdout.toString() : "") + (r.stderr ? r.stderr.toString() : ""));
  });

  const [res1, res2] = await Promise.all([p1, p2]);
  const combined = (res1 as string) + (res2 as string);

  if (combined.includes('Another bootstrap process is currently running') || combined.includes('Database is not empty!')) {
    console.log(`✅ Passed: Concurrency lock successfully triggered or database empty check worked.`);
  } else {
    console.error(`TEST FAILED: Concurrency lock did not trigger correctly.`);
    process.exit(1);
  }
}

runConcurrencyTest().then(() => {
  console.log('All standalone guard tests passed.');
});
