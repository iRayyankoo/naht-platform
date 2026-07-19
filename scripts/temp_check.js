const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.count();
  const roles = await prisma.appRole.count();
  const permissions = await prisma.permission.count();
  const rolePermissions = await prisma.rolePermission.count();
  const departments = await prisma.department.count();
  const departmentMembers = await prisma.departmentMember.count();
  const activityLogs = await prisma.organizationActivityLog.count();

  console.log("=== POST-SEED SNAPSHOT ===");
  console.log("Users:", users);
  console.log("Roles:", roles);
  console.log("Permissions:", permissions);
  console.log("RolePermissions:", rolePermissions);
  console.log("Departments:", departments);
  console.log("DepartmentMembers:", departmentMembers);
  console.log("OrganizationActivityLog:", activityLogs);

  const orgPerms = await prisma.permission.findMany({
    where: { code: { startsWith: 'org.' } },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  console.log("Existing org.* permissions:", orgPerms.length);
  for (const p of orgPerms) {
    console.log(`- ${p.code}:`);
    const superAdmin = p.roles.filter(rp => rp.role.code === 'SUPER_ADMIN').length;
    const admin = p.roles.filter(rp => rp.role.code === 'ADMIN').length;
    const employee = p.roles.filter(rp => rp.role.code === 'EMPLOYEE').length;
    console.log(`  SUPER_ADMIN links: ${superAdmin}, ADMIN links: ${admin}, EMPLOYEE links: ${employee}`);
    console.log(`  Scopes: ${p.roles.map(rp => rp.scope).join(", ")}`);
  }
  
  await prisma.$disconnect();
}
run();
