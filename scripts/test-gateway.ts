import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

function runStep(name: string, command: string, args: string[], env: Record<string, string> = {}) {
    console.log(`\n======================================================`);
    console.log(`GATEWAY STEP: ${name}`);
    const customEnv = Object.assign({}, process.env, env);
    const result = spawnSync(command, args, { stdio: 'inherit', env: customEnv });
    if (result.status !== 0) {
        throw new Error(`GATEWAY FAILED AT STEP: ${name}`);
    }
    console.log(`✅ STEP PASSED: ${name}`);
}

async function runGateway() {
    console.log(`🚀 STARTING BATCH 2 REGRESSION GATEWAY...`);

    const dbName = `naht_finance_disposable_test_batch2_${Date.now()}`;
    const dbUrl = `postgresql://postgres@127.0.0.1:55432/${dbName}?schema=public`;
    const dbEnv = { DATABASE_NAME: dbName, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl };

    try {
        // 1. Prisma Validate
        runStep('Prisma Validate', process.execPath, ['node_modules/prisma/build/index.js', 'validate'], dbEnv);

        // 2. Prisma Generate 
        runStep('Prisma Generate', process.execPath, ['node_modules/prisma/build/index.js', 'generate'], dbEnv);

        // 3. TypeScript
        runStep('TypeScript Compilation', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);

        // 4. ESLint Strict (Recursive src + scripts)
        runStep('ESLint (Strict)', process.execPath, ['node_modules/eslint/bin/eslint.js', 'src/services/finance', 'scripts/test-finance-f2-b-final.ts', 'scripts/test-gateway.ts']);

        // 5. Git Cleanliness
        console.log(`\n======================================================`);
        console.log(`GATEWAY STEP: Git Cleanliness`);
        const gitRes = spawnSync('git', ['diff', '--check'], { stdio: 'inherit' });
        if (gitRes.status !== 0) {
            throw new Error(`Git Diff --check found trailing whitespace or conflict markers.`);
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
        runStep('Legacy Prisma Migrate', process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], dbEnv);
        runStep('Legacy Prisma Migrate Status', process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'status'], dbEnv);

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
                throw new Error(`Missing mandatory test file: ${f}`);
            }
        }

        // 9. Batch 2 Verification Harness
        runStep('Batch 2 Exhaustive Matrix', process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/test-finance-f2-b-final.ts'], dbEnv);


        // 10. Production Build
        runStep('Production Build', process.execPath, ['node_modules/next/dist/bin/next', 'build'], dbEnv);

        console.log(`\n🎉🎉🎉 ALL REGRESSION GATEWAYS PASSED! 🎉🎉🎉`);
    } finally {
        console.log("Cleaning up Gateway Legacy DB...");
        const guardRegex = /^naht_finance_disposable_test_batch2_\d+$/;
        if (guardRegex.test(dbName)) {
            const cleanupClient = new Client({ connectionString: "postgresql://postgres@127.0.0.1:55432/postgres" });
            await cleanupClient.connect();
            try {
                const res = await cleanupClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
                if (res.rowCount && res.rowCount > 0) {
                    await cleanupClient.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()', [dbName]);
                    await cleanupClient.query(`DROP DATABASE "${dbName}"`);
                    console.log(`✅ Legacy DB ${dbName} successfully dropped.`);
                }
            } catch (err: unknown) {
                console.log(`⚠️ Failed to drop legacy DB ${dbName}: ${(err as Error).message}`);
                throw new Error(`Cleanup failed for DB ${dbName}: ${(err as Error).message}`);
            } finally {
                await cleanupClient.end();
            }
        }
    }
}

runGateway().catch(e => {
    console.error("Gateway Fatal Error:", e);
    process.exitCode = 1;
});
