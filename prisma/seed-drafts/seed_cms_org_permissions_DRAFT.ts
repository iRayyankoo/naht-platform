// DO NOT RUN — DRAFT ONLY
// This script is a draft for seeding CMS and Org Permissions.
// It is NOT intended to be executed directly in its current state.
// Requires final review and integration with the main seed process.

import { PrismaClient, NavigationLocation } from "@prisma/client";

const prisma = new PrismaClient();

// Configuration
const SUPER_ADMIN_EMAIL = "SUPER_ADMIN_EMAIL_TO_BE_CONFIRMED";

async function main() {
  console.log("Starting seed draft execution (dry-run mode if uncommented)...");

  // 1. Departments Seed Array
  const departments = [
    { name: "الإدارة", code: "MANAGEMENT", description: "الإدارة التنفيذية والقيادة", sortOrder: 1, isActive: true },
    { name: "التسويق", code: "MARKETING", description: "إدارة الهوية والحملات", sortOrder: 2, isActive: true },
    { name: "المبيعات", code: "SALES", description: "إدارة العملاء المحتملين", sortOrder: 3, isActive: true },
    { name: "المشاريع", code: "PROJECTS", description: "إدارة العقارات والإنشاءات", sortOrder: 4, isActive: true },
    { name: "خدمة العملاء", code: "CUSTOMER_CARE", description: "دعم ومساندة ما بعد البيع", sortOrder: 5, isActive: true },
    { name: "المحتوى", code: "CONTENT", description: "إدارة الموقع وتحديث النصوص", sortOrder: 6, isActive: true },
  ];

  // 2. Roles Seed Array
  const roles = [
    { name: "SUPER_ADMIN", code: "SUPER_ADMIN", description: "المالك (وصول كامل وتخطي لجميع القيود)", isSystem: true, isActive: true },
    { name: "ADMIN", code: "ADMIN", description: "مدير النظام", isSystem: true, isActive: true },
    { name: "MARKETING_MANAGER", code: "MARKETING_MANAGER", description: "مدير التسويق", isSystem: false, isActive: true },
    { name: "MARKETING", code: "MARKETING", description: "موظف تسويق", isSystem: false, isActive: true },
    { name: "SALES_MANAGER", code: "SALES_MANAGER", description: "مدير المبيعات", isSystem: false, isActive: true },
    { name: "SALES", code: "SALES", description: "ممثل مبيعات", isSystem: false, isActive: true },
    { name: "CONTENT_EDITOR", code: "CONTENT_EDITOR", description: "محرر المحتوى للموقع (CMS)", isSystem: false, isActive: true },
    { name: "VIEWER", code: "VIEWER", description: "للقراءة وعرض التقارير فقط", isSystem: true, isActive: true },
  ];

  // 3. Permissions Seed Array
  const permissions = [
    { module: "CMS", action: "VIEW", code: "CMS.VIEW", description: "عرض المحتوى" },
    { module: "CMS", action: "UPDATE", code: "CMS.UPDATE", description: "تحديث المحتوى" },
    { module: "CMS", action: "UPDATE", code: "CMS.BRAND.UPDATE", description: "تحديث الهوية" },
    { module: "SITE_MAP", action: "VIEW", code: "SITE_MAP.VIEW", description: "عرض خريطة الموقع" },
    { module: "SITE_MAP", action: "MANAGE", code: "SITE_MAP.MANAGE", description: "إدارة خريطة الموقع" },
    { module: "NAVIGATION", action: "VIEW", code: "NAVIGATION.VIEW", description: "عرض القوائم" },
    { module: "NAVIGATION", action: "MANAGE", code: "NAVIGATION.MANAGE", description: "إدارة القوائم" },
    { module: "USER_FLOW", action: "VIEW", code: "USER_FLOW.VIEW", description: "عرض مسار الزائر" },
    { module: "USER_FLOW", action: "MANAGE", code: "USER_FLOW.MANAGE", description: "إدارة مسار الزائر" },
    { module: "LEADS", action: "VIEW", code: "LEADS.VIEW", description: "عرض العملاء" },
    { module: "LEADS", action: "CREATE", code: "LEADS.CREATE", description: "إضافة عملاء" },
    { module: "LEADS", action: "UPDATE", code: "LEADS.UPDATE", description: "تحديث العملاء" },
    { module: "LEADS", action: "ASSIGN", code: "LEADS.ASSIGN", description: "تعيين العملاء" },
    { module: "LEADS", action: "DELETE", code: "LEADS.DELETE", description: "حذف العملاء" },
    { module: "LEADS", action: "EXPORT", code: "LEADS.EXPORT", description: "تصدير العملاء" },
    { module: "PROJECTS", action: "VIEW", code: "PROJECTS.VIEW", description: "عرض المشاريع" },
    { module: "PROJECTS", action: "CREATE", code: "PROJECTS.CREATE", description: "إضافة مشاريع" },
    { module: "PROJECTS", action: "UPDATE", code: "PROJECTS.UPDATE", description: "تحديث المشاريع" },
    { module: "PROJECTS", action: "DELETE", code: "PROJECTS.DELETE", description: "حذف المشاريع" },
    { module: "PROJECTS", action: "PUBLISH", code: "PROJECTS.PUBLISH", description: "نشر المشاريع" },
    { module: "ORG", action: "VIEW", code: "EMPLOYEES.VIEW", description: "عرض الموظفين" },
    { module: "ORG", action: "MANAGE", code: "EMPLOYEES.MANAGE", description: "إدارة الموظفين" },
    { module: "ORG", action: "VIEW", code: "DEPARTMENTS.VIEW", description: "عرض الأقسام" },
    { module: "ORG", action: "MANAGE", code: "DEPARTMENTS.MANAGE", description: "إدارة الأقسام" },
    { module: "RBAC", action: "VIEW", code: "ROLES.VIEW", description: "عرض الأدوار" },
    { module: "RBAC", action: "MANAGE", code: "ROLES.MANAGE", description: "إدارة الأدوار" },
    { module: "RBAC", action: "VIEW", code: "PERMISSIONS.VIEW", description: "عرض الصلاحيات" },
    { module: "RBAC", action: "MANAGE", code: "PERMISSIONS.MANAGE", description: "إدارة الصلاحيات" },
    { module: "REPORTS", action: "VIEW", code: "REPORTS.VIEW", description: "عرض التقارير" },
    { module: "REPORTS", action: "EXPORT", code: "REPORTS.EXPORT", description: "تصدير التقارير" },
    { module: "SETTINGS", action: "VIEW", code: "SETTINGS.VIEW", description: "عرض الإعدادات" },
    { module: "SETTINGS", action: "UPDATE", code: "SETTINGS.UPDATE", description: "تحديث الإعدادات" },
  ];

  // 4. Role Permission Matrix
  const rolePermissionMatrix: Record<string, string[]> = {
    SUPER_ADMIN: permissions.map(p => p.code),
    ADMIN: permissions.filter(p => !['SUPER_ADMIN_SPECIFIC_LATER'].includes(p.code)).map(p => p.code),
    MARKETING_MANAGER: ["CMS.VIEW", "CMS.UPDATE", "CMS.BRAND.UPDATE", "SITE_MAP.VIEW", "NAVIGATION.VIEW", "USER_FLOW.VIEW", "USER_FLOW.MANAGE", "PROJECTS.VIEW", "PROJECTS.UPDATE", "REPORTS.VIEW"],
    MARKETING: ["CMS.VIEW", "CMS.UPDATE", "SITE_MAP.VIEW", "NAVIGATION.VIEW", "USER_FLOW.VIEW", "PROJECTS.VIEW", "REPORTS.VIEW"],
    CONTENT_EDITOR: ["CMS.VIEW", "CMS.UPDATE", "SITE_MAP.VIEW", "NAVIGATION.VIEW", "USER_FLOW.VIEW"],
    SALES_MANAGER: ["LEADS.VIEW", "LEADS.CREATE", "LEADS.UPDATE", "LEADS.ASSIGN", "LEADS.EXPORT", "PROJECTS.VIEW", "REPORTS.VIEW"],
    SALES: ["LEADS.VIEW", "LEADS.CREATE", "LEADS.UPDATE", "PROJECTS.VIEW"],
    VIEWER: permissions.filter(p => p.action === "VIEW").map(p => p.code),
  };

  // 5. Navigation Items Seed Array
  const navigationItems = [
    { label: "الرئيسية", href: "/", location: NavigationLocation.HEADER, sortOrder: 1 },
    { label: "من نحن", href: "/about", location: NavigationLocation.BOTH, sortOrder: 2 },
    { label: "خدماتنا", href: "/services", location: NavigationLocation.BOTH, sortOrder: 3 },
    { label: "مشاريعنا", href: "/projects", location: NavigationLocation.BOTH, sortOrder: 4 },
    { label: "تواصل معنا", href: "/contact", location: NavigationLocation.BOTH, sortOrder: 5 },
    { label: "بوابة الموظفين", href: "/auth/login", location: NavigationLocation.FOOTER, sortOrder: 6 },
  ];

  // 6. Site Pages Seed Array
  const sitePages = [
    { title: "الرئيسية", slug: "/", showInNavbar: true, showInFooter: false, sortOrder: 1, seoTitle: "نحت | الرئيسية", seoDescription: "الصفحة الرئيسية لشركة نحت" },
    { title: "من نحن", slug: "/about", showInNavbar: true, showInFooter: true, sortOrder: 2, seoTitle: "نحت | من نحن", seoDescription: "تعرف على شركة نحت" },
    { title: "خدماتنا", slug: "/services", showInNavbar: true, showInFooter: true, sortOrder: 3, seoTitle: "نحت | خدماتنا", seoDescription: "خدمات شركة نحت" },
    { title: "مشاريعنا", slug: "/projects", showInNavbar: true, showInFooter: true, sortOrder: 4, seoTitle: "نحت | مشاريعنا", seoDescription: "مشاريع شركة نحت" },
    { title: "تواصل معنا", slug: "/contact", showInNavbar: true, showInFooter: true, sortOrder: 5, seoTitle: "نحت | تواصل معنا", seoDescription: "تواصل مع شركة نحت" },
    { title: "التوظيف", slug: "/careers", showInNavbar: false, showInFooter: true, sortOrder: 6, seoTitle: "نحت | التوظيف", seoDescription: "التوظيف في شركة نحت" },
    { title: "بوابة الموظفين", slug: "/auth/login", showInNavbar: false, showInFooter: true, sortOrder: 7, seoTitle: "نحت | بوابة الموظفين", seoDescription: "بوابة موظفي نحت" },
  ];

  // 7. User Flow Sections Seed Array
  const userFlowSections = [
    { pageKey: "home", sectionKey: "HERO", adminLabel: "منطقة البداية الأساسية", sortOrder: 1, isVisible: true, isLocked: true },
    { pageKey: "home", sectionKey: "FEATURED_PROJECTS", adminLabel: "المشاريع المختارة", sortOrder: 2, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "TRUST_STRIP", adminLabel: "شريط الثقة (اللوجوهات)", sortOrder: 3, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "NAHT_STANDARD", adminLabel: "معايير نحت", sortOrder: 4, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "ABOUT_BRIEF", adminLabel: "نبذة عن الشركة", sortOrder: 5, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "INTERACTIVE_MAP", adminLabel: "الخريطة التفاعلية", sortOrder: 6, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "STATS", adminLabel: "الأرقام والإحصائيات", sortOrder: 7, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "WHY_CHOOSE_US", adminLabel: "لماذا نحت", sortOrder: 8, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "CLIENT_JOURNEY", adminLabel: "رحلة العميل", sortOrder: 9, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "FAQ", adminLabel: "الأسئلة الشائعة", sortOrder: 10, isVisible: true, isLocked: false },
    { pageKey: "home", sectionKey: "CONTACT", adminLabel: "تواصل معنا أسفل الصفحة", sortOrder: 11, isVisible: true, isLocked: true },
  ];

  // Example idempotent upsert logic (DO NOT UNCOMMENT OR RUN):
  /*
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: dept,
      create: dept,
    });
  }

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
  }

  for (const role of roles) {
    await prisma.appRole.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }

  // Handle matrix...
  // Handle site pages...
  // Handle nav...
  // Handle flow...
  
  // Set Super Admin if email exists in DB
  if (SUPER_ADMIN_EMAIL && SUPER_ADMIN_EMAIL !== "SUPER_ADMIN_EMAIL_TO_BE_CONFIRMED") {
      const adminRole = await prisma.appRole.findUnique({ where: { code: "SUPER_ADMIN" }});
      if (adminRole) {
          const user = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL }});
          if (user) {
              await prisma.userRole.upsert({
                  where: { userId_roleId: { userId: user.id, roleId: adminRole.id }},
                  update: {},
                  create: { userId: user.id, roleId: adminRole.id }
              });
          }
      }
  }
  */

  console.log("Draft seed arrays loaded. No execution performed.");
}

/*
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/
