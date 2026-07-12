const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding task permissions...');

  const permissions = [
    { module: 'TASKS', action: 'VIEW', code: 'tasks.view', description: 'عرض المهام' },
    { module: 'TASKS', action: 'CREATE', code: 'tasks.create', description: 'إنشاء مهمة' },
    { module: 'TASKS', action: 'EDIT', code: 'tasks.edit', description: 'تعديل المهمة / تغيير الحالة' },
    { module: 'TASKS', action: 'ASSIGN', code: 'tasks.assign', description: 'إسناد المهام للغير' },
    { module: 'TASKS', action: 'APPROVE', code: 'tasks.approve', description: 'إعطاء قرار الموافقة أو الرفض' },
    { module: 'TASKS', action: 'DELETE', code: 'tasks.delete', description: 'إلغاء / حذف المهمة' },
  ];

  // 1. Create permissions
  const createdPermissions = [];
  for (const perm of permissions) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions.push(p);
  }
  console.log(`Ensured ${createdPermissions.length} permissions exist.`);

  // 2. Find ADMIN role
  const adminRole = await prisma.appRole.findUnique({
    where: { code: 'ADMIN' },
  });

  if (!adminRole) {
    console.error('ADMIN role not found! Could not assign permissions.');
    return;
  }

  // 3. Assign permissions to ADMIN
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id,
      },
    });
  }

  console.log('Successfully assigned task permissions to ADMIN role.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
