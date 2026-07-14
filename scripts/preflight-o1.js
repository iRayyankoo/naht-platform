const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runPreflight() {
  try {
    console.log("=== Staging Preflight ===");
    
    const dbInfo = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as c_user, session_user as s_user, version() as v`;
    console.log("Database Info:", dbInfo);
    
    // Check if role is owner or has BYPASSRLS
    const roleInfo = await prisma.$queryRaw`SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    console.log("Role Info:", roleInfo);

    const enums = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typname IN ('DepartmentMembershipStatus', 'DepartmentMembershipRole', 'DepartmentMembershipSource', 'PermissionScope', 'OrganizationActionType')`;
    console.log("Existing Enums (Should be empty):", enums);

    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE tablename IN ('department_members', 'organization_activity_logs')`;
    console.log("Existing Tables (Should be empty):", tables);

    // Check RolePermission.scope
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'RolePermission' AND column_name = 'scope'`;
    console.log("Existing columns for scope (Should be empty):", columns);

    // Check Users with / without departmentId
    const usersTotal = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    const usersWithDept = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User" WHERE "departmentId" IS NOT NULL`;
    const usersWithoutDept = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User" WHERE "departmentId" IS NULL`;
    console.log("Total Users:", Number(usersTotal[0].count));
    console.log("Users with dept:", Number(usersWithDept[0].count));
    console.log("Users without dept:", Number(usersWithoutDept[0].count));

    // Check for invalid User.departmentId
    const invalidDepts = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User" u WHERE u."departmentId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Department" d WHERE d.id = u."departmentId")`;
    console.log("Invalid departmentIds in User:", Number(invalidDepts[0].count));
    
    // Estimate Backfill rows
    const backfillCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User" u WHERE u."departmentId" IS NOT NULL`;
    console.log("Estimated Backfill Rows:", Number(backfillCount[0].count));

    console.log("=== Preflight Complete ===");
  } catch (error) {
    console.error("Preflight Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runPreflight();