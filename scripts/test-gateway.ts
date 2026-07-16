import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

function runStep(name: string, command: string, args: string[], env: Record<string, string> = {}) {
    console.log(`\n======================================================`);
    console.log(`GATEWAY STEP: ${name}`);
    const customEnv = Object.assign({}, process.env, env);
    const cmd = process.platform === 'win32' && command === 'npx' ? 'npx.cmd' : command;
    const result = spawnSync(cmd, args, { stdio: 'inherit', env: customEnv, shell: process.platform === 'win32' && (command === 'npm' || command === 'npx') });
    if (result.status !== 0) {
        console.error(`\n❌ GATEWAY FAILED AT STEP: ${name}`);
        process.exit(1);
    }
    console.log(`✅ STEP PASSED: ${name}`);
}

async function runGateway() {
    console.log(`🚀 STARTING BATCH 2 REGRESSION GATEWAY...`);

    const dbName = `naht_finance_disposable_test_f2b_${Date.now()}`;
    const dbUrl = `postgresql://postgres@127.0.0.1:55432/${dbName}?schema=public`;
    const dbEnv = { DATABASE_NAME: dbName, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl };

    try {
        // 1. Prisma Validate
        runStep('Prisma Validate', 'npx', ['prisma', 'validate'], dbEnv);

        // 2. Prisma Generate 
        runStep('Prisma Generate', 'npx', ['prisma', 'generate'], dbEnv);

        // 3. TypeScript
        runStep('TypeScript Compilation', 'npx', ['tsc', '--noEmit']);

        // 4. ESLint Strict (Recursive src + scripts)
        runStep('ESLint (Strict)', 'npx', ['eslint', 'src/services/finance', 'scripts/test-finance-f2-b-final.ts', 'scripts/test-gateway.ts']);

        // 5. Git Cleanliness
        console.log(`\n======================================================`);
        console.log(`GATEWAY STEP: Git Cleanliness`);
        const gitRes = spawnSync('git', ['diff', '--check'], { stdio: 'inherit', shell: false });
        if (gitRes.status !== 0) {
            console.error(`❌ Git Diff --check found trailing whitespace or conflict markers.`);
            process.exit(1);
        }
        console.log(`✅ STEP PASSED: Git Cleanliness`);

        // 6. Security Tools: Bootstrap Greenfield
        runStep('Greenfield Bootstrap Security', process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/test-greenfield-bootstrap.ts']);

        // 7. Old Test Harnesses (F1-A, F1-B)
        const testFiles = [
            'scripts/test-finance-f1-a-sql.ts',
            'scripts/test-finance-f1-b-rbac-integration.ts',
            'scripts/test-finance-f1-b-audit-actions.ts',
            'scripts/test-finance-f1-b-ledger.ts',
            'scripts/test-finance-f1-b-account.ts',
            'scripts/test-finance-f1-b-concurrency.ts',
            'scripts/test-finance-f1-b-batch1a.ts',
            'scripts/test-finance-f2-a-audit-actions.ts'
        ];
        
        // 7. Setup Test Database for Legacy Scripts
        runStep('Setup Legacy DB', process.execPath, ['scripts/setup-legacy-db.js'], dbEnv);
        runStep('Legacy Bootstrap', process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/bootstrap-greenfield.ts'], {
            ...dbEnv,
            GREENFIELD_BOOTSTRAP_TARGET: 'ISOLATED_DISPOSABLE_DB',
            GREENFIELD_BOOTSTRAP_CONFIRM: 'INITIALIZE_EMPTY_DISPOSABLE_DATABASE'
        });
        runStep('Legacy Prisma Migrate', 'npx', ['prisma', 'migrate', 'deploy'], dbEnv);
        runStep('Legacy Prisma Migrate Status', 'npx', ['prisma', 'migrate', 'status'], dbEnv);

        // 8. Legacy Scripts (F1-A SQL, F1-B RBAC)
        for (const f of testFiles) {
            if (fs.existsSync(f)) {
                runStep(`Legacy Regression: ${f}`, process.execPath, ['node_modules/tsx/dist/cli.mjs', f], {
                    ...dbEnv,
                    FINANCE_SQL_TEST_CONFIRM: 'I_ACCEPT_THIS_DATABASE_WILL_BE_DISPOSABLE',
                    FINANCE_SQL_TEST_TARGET: 'ISOLATED_DISPOSABLE_DB',
                    FINANCE_RBAC_TARGET: 'ISOLATED_TEST',
                    FINANCE_RBAC_SEED_CONFIRM: 'APPLY_TO_ISOLATED_TEST_DB'
                });
            } else {
                console.error(`❌ Missing mandatory test file: ${f}`);
                process.exit(1);
            }
        }

        // 9. Batch 2 Verification Harness
        runStep('Batch 2 Exhaustive Matrix', process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/test-finance-f2-b-final.ts']);

        // 10. Production Build
        runStep('Production Build', 'npm', ['run', 'build']);

        console.log(`\n🎉🎉🎉 ALL REGRESSION GATEWAYS PASSED! 🎉🎉🎉`);
    } finally {
        console.log("Cleaning up Gateway Legacy DB...");
        const guardRegex = /^naht_finance_disposable_test_f2b_\d+$/;
        if (guardRegex.test(dbName)) {
            const cleanupClient = new Client({ connectionString: "postgresql://postgres@127.0.0.1:55432/postgres" });
            await cleanupClient.connect();
            try {
                await cleanupClient.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()', [dbName]);
                await cleanupClient.query(`DROP DATABASE "${dbName}"`);
                console.log(`✅ Legacy DB ${dbName} successfully dropped.`);
            } catch (err: unknown) {
                console.log(`⚠️ Failed to drop legacy DB ${dbName}: ${(err as Error).message}`);
            } finally {
                await cleanupClient.end();
            }
        }
    }
}

runGateway().catch(e => {
    console.error("Gateway Fatal Error:", e);
    process.exit(1);
});
