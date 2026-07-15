# F1-B Finance RBAC Deployment Guide

## Overview
This document outlines the explicit deployment steps required to register Finance Roles and Permissions (RBAC) in the target environment.

**IMPORTANT:** The `migrate deploy` command **DOES NOT** register permissions automatically. The standard `prisma/seed.ts` is intentionally protected against execution in production. Therefore, an explicit, manual run of the Finance RBAC Seed script is required.

## Deployment Sequence

1. **Apply F1-A Foundation Migration:**
   Deploy the database foundation.
   `npx prisma migrate deploy`

2. **Verify Migration Integrity:**
   Ensure the Checksum matches the expected F1-A foundation without errors.
   `npx prisma migrate status`

3. **Execute Finance RBAC Seed:**
   Run the independent seed script with explicit security confirmations.

## Execution Variables
To prevent accidental or automated execution, the seed script enforces strict environment variable checks. **No credentials or connection strings are stored here.** 

Provide the environment variable `CONFIRM_PRODUCTION_FINANCE_SEED=true` to authorize execution in a live environment.

### Command
```bash
CONFIRM_PRODUCTION_FINANCE_SEED=true npx tsx prisma/seeds/finance-permissions.ts
```

## Expected Results
- **15 Permissions** will be created covering the F1-B matrix.
- **5 Roles** will be created (`FINANCE_VIEWER`, `FINANCE_ACCOUNTANT`, `FINANCE_MANAGER`, `FINANCE_POSTER`, `FINANCE_ADMIN`).
- Execution is **idempotent**. Running it multiple times will not duplicate records.
- The script **DOES NOT** assign roles to users. User assignments must be done via the standard Admin UI.

## Verification
To verify counts without exposing user data, you can query the database directly or use Prisma Studio to check exactly:
- 5 records in `AppRole` where `code` starts with `FINANCE_`
- 15 records in `Permission` where `module` is `FINANCE`

## Rollback / Recovery
**DO NOT** automatically delete roles or permissions if an error occurs.
- If the script halts due to a "Hostile Takeover" (Role code collision), it will stop immediately without modifying data.
- **Resolution:** Manually review the conflicting `AppRole` codes in the database, resolve the naming conflicts, and re-run the seed script.
- The script uses Prisma Transactions. A failure during execution will cleanly roll back any partial inserts.
