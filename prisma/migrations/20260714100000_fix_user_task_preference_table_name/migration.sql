-- Align the physical table name with @@map("user_task_preferences")
ALTER TABLE "UserTaskPreference"
RENAME TO "user_task_preferences";

-- Align constraint and index names with Prisma's mapped-table convention
ALTER TABLE "user_task_preferences"
RENAME CONSTRAINT "UserTaskPreference_pkey"
TO "user_task_preferences_pkey";

ALTER INDEX "UserTaskPreference_userId_key"
RENAME TO "user_task_preferences_userId_key";

ALTER TABLE "user_task_preferences"
RENAME CONSTRAINT "UserTaskPreference_userId_fkey"
TO "user_task_preferences_userId_fkey";
