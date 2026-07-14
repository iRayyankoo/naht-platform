-- CreateEnum
CREATE TYPE "DepartmentMembershipStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DepartmentMembershipRole" AS ENUM ('MEMBER', 'OBSERVER');

-- CreateEnum
CREATE TYPE "DepartmentMembershipSource" AS ENUM ('MANUAL', 'LEGACY_MIGRATION', 'HR_SYNC');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('SELF', 'ASSIGNED', 'DEPARTMENT', 'COMPANY');

-- CreateEnum
CREATE TYPE "OrganizationActionType" AS ENUM ('MEMBER_ASSIGNED', 'MEMBER_TRANSFERRED', 'MEMBER_ENDED', 'PRIMARY_DEPARTMENT_CHANGED', 'MANAGER_ASSIGNED', 'MEMBER_ROLE_CHANGED', 'MANAGER_REMOVED', 'DEPARTMENT_ARCHIVED', 'DEPARTMENT_RESTORED');

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "scope" "PermissionScope" NOT NULL DEFAULT 'COMPANY';

-- CreateTable
CREATE TABLE "department_members" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "membershipRole" "DepartmentMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" "DepartmentMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "DepartmentMembershipSource" NOT NULL DEFAULT 'MANUAL',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_activity_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "OrganizationActionType" NOT NULL,
    "departmentId" TEXT,
    "targetUserId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "department_members_departmentId_idx" ON "department_members"("departmentId");

-- CreateIndex
CREATE INDEX "department_members_userId_idx" ON "department_members"("userId");

-- CreateIndex
CREATE INDEX "department_members_status_idx" ON "department_members"("status");

-- CreateIndex
CREATE INDEX "department_members_effectiveFrom_idx" ON "department_members"("effectiveFrom");

-- CreateIndex
CREATE INDEX "department_members_effectiveTo_idx" ON "department_members"("effectiveTo");

-- CreateIndex
CREATE INDEX "organization_activity_logs_actorId_idx" ON "organization_activity_logs"("actorId");

-- CreateIndex
CREATE INDEX "organization_activity_logs_targetUserId_idx" ON "organization_activity_logs"("targetUserId");

-- CreateIndex
CREATE INDEX "organization_activity_logs_departmentId_idx" ON "organization_activity_logs"("departmentId");

-- CreateIndex
CREATE INDEX "organization_activity_logs_createdAt_idx" ON "organization_activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_activity_logs" ADD CONSTRAINT "organization_activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_activity_logs" ADD CONSTRAINT "organization_activity_logs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_activity_logs" ADD CONSTRAINT "organization_activity_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Security: ENABLE ROW LEVEL SECURITY
ALTER TABLE "department_members" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "department_members" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "organization_activity_logs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "organization_activity_logs" FROM PUBLIC, anon, authenticated, service_role;

-- Database Guarantees and Constraints
CREATE UNIQUE INDEX "department_members_primary_active_idx" 
ON "department_members" ("userId") 
WHERE "isPrimary" = true 
  AND "status" = 'ACTIVE' 
  AND "effectiveTo" IS NULL;

CREATE UNIQUE INDEX "department_members_active_per_dept_idx" 
ON "department_members" ("departmentId", "userId") 
WHERE "status" = 'ACTIVE' 
  AND "effectiveTo" IS NULL;

ALTER TABLE "department_members"
ADD CONSTRAINT "check_effective_dates"
CHECK ("effectiveTo" IS NULL OR "effectiveTo" > "effectiveFrom");

ALTER TABLE "department_members"
ADD CONSTRAINT "department_members_status_dates_check"
CHECK (
  (
    "status" = 'ACTIVE'
    AND "effectiveTo" IS NULL
  )
  OR
  (
    "status" IN ('TRANSFERRED', 'INACTIVE')
    AND "effectiveTo" IS NOT NULL
  )
);

ALTER TABLE "department_members"
ADD CONSTRAINT "department_members_primary_role_check"
CHECK (
  "isPrimary" = false
  OR "membershipRole" = 'MEMBER'
);

-- Data Backfill Migration
-- Insert active memberships for users who currently have a departmentId.
INSERT INTO "department_members" (
  "id",
  "departmentId",
  "userId",
  "isPrimary",
  "membershipRole",
  "status",
  "source",
  "effectiveFrom",
  "createdAt",
  "updatedAt"
)
SELECT
  'legacy_' || md5(u."id" || ':' || u."departmentId"),
  u."departmentId",
  u."id",
  true,
  'MEMBER',
  'ACTIVE',
  'LEGACY_MIGRATION',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE u."departmentId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "department_members" dm
    WHERE dm."userId" = u."id"
      AND dm."isPrimary" = true
      AND dm."status" = 'ACTIVE'
      AND dm."effectiveTo" IS NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "department_members" dm
    WHERE dm."userId" = u."id"
      AND dm."departmentId" = u."departmentId"
      AND dm."status" = 'ACTIVE'
      AND dm."effectiveTo" IS NULL
  )
ON CONFLICT DO NOTHING;

