import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const orgPermissions = [
  {
    code: 'org.departments.view',
    description: 'يسمح للمستخدم برؤية هيكل الأقسام وبياناتها.',
    module: 'ORGANIZATION',
    action: 'VIEW'
  },
  {
    code: 'org.departments.manage',
    description: 'يسمح بإنشاء الأقسام، تعديلها، أو إيقافها.',
    module: 'ORGANIZATION',
    action: 'MANAGE'
  },
  {
    code: 'org.members.view',
    description: 'يسمح بعرض الموظفين المرتبطين بالقسم.',
    module: 'ORGANIZATION',
    action: 'VIEW'
  },
  {
    code: 'org.members.assign',
    description: 'يسمح بإضافة موظف إلى قسم كعضو.',
    module: 'ORGANIZATION',
    action: 'ASSIGN'
  },
  {
    code: 'org.members.transfer',
    description: 'يسمح بنقل الموظف بين الأقسام بإنهاء القديم وبدء الجديد.',
    module: 'ORGANIZATION',
    action: 'TRANSFER'
  },
  {
    code: 'org.members.end',
    description: 'يسمح بإنهاء عضوية الموظف في القسم.',
    module: 'ORGANIZATION',
    action: 'END'
  },
  {
    code: 'org.department_manager.assign',
    description: 'يسمح بترقية عضو قسم ليكون مديراً عليه.',
    module: 'ORGANIZATION',
    action: 'ASSIGN'
  },
];

async function main() {
  console.log('Seeding O1 Organization Permissions...');

  let superAdminRole = await prisma.appRole.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.appRole.create({
      data: {
        code: 'SUPER_ADMIN',
        name: 'مدير نظام شامل',
        description: 'صلاحيات مطلقة لكافة وظائف النظام',
        isSystem: true,
      }
    });
  }

  for (const perm of orgPermissions) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        description: perm.description,
        module: perm.module,
        action: perm.action,
      },
      create: perm,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: { scope: 'COMPANY' },
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
        scope: 'COMPANY'
      },
    });
  }

  console.log('O1 Organization permissions seeded and assigned to SUPER_ADMIN role successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
