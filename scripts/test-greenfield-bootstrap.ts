import { execSync, spawnSync } from 'child_process';
import * as crypto from 'crypto';

const scriptPath = 'npx tsx scripts/bootstrap-greenfield.ts';

function runTest(envVars: Record<string, string>, expectedErrorFragment: string) {
  const result = spawnSync(scriptPath, { shell: true, env: { ...process.env, ...envVars } });
  const output = result.stderr.toString() + result.stdout.toString();
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

console.log('All standalone guard tests passed.');
