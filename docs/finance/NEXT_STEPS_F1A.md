# Next Steps: F1-A

The following issues remain open and must be addressed tomorrow before proceeding to Phase F1-B (Server Actions & Logic Implementation):

## Pending Issues to Fix
- **TypeScript Error:** Missing `runTest` parameter invocation near line 272 in `scripts/test-finance-f1-a-sql.ts`.
- **ESLint Error:** Implicit `any` type for `params` array near line 154 in `scripts/test-finance-f1-a-sql.ts`.
- **SAVEPOINT Logic:** Fix the logic inside `runTest` regarding `SAVEPOINT` management (ensure rollbacks happen cleanly when expected failures occur so tests can proceed without aborting the transaction).
- **Test Connections:** Hard-enforce `TEST_ALLOW_EPHEMERAL_DB` logic to ONLY allow `localhost`/`127.0.0.1` and permanently block others.
- **Rounding Policy:** Fully implement the dynamic `roundingPolicy` (currently defaults to explicit math rules but could need more mapping to Prisma types).
- **Reversal Constraints:** Make the matching for `FinanceJournalReversal` bidirectional and add unique protections to prevent duplicated reversals across identical sets.
- **btree_gist Schema Review:** Ensure the `btree_gist` extension schema creation is fully compliant with the expected production PostgreSQL layout.
- **Concurrency Testing:** Add comprehensive tests specifically targeting concurrency for `FinanceFiscalPeriod` overlaps and account tree additions under load.

## Blockers for F1-B
- A real isolated local PostgreSQL 18 instance must be running.
- The `F1-A` migrations (`20260714110000_finance_f1_a_foundation`) must be fully executed and verified on this local Postgres instance.
- The `test-finance-f1-a-sql.ts` test suite must pass 100% on the local DB.
- No transition to `F1-B` is allowed until the above gateway conditions are met.
