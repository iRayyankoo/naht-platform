import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_PROFILE !== "uat" || process.env.ALLOW_UAT_DATA_WRITE !== "true") {
    console.error("ERROR: UAT seed rejected");
    process.exit(1);
  }

  const adminEmail = process.env.STAGING_ADMIN_EMAIL || 'admin@naht-re.sa';
  const adminPassword = process.env.STAGING_ADMIN_PASSWORD || 'adminUAT2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  if (process.env.RESET_STAGING_DB === 'true') {
    console.log('RESET_STAGING_DB is true. Wiping data for clean seed...');
    await prisma.lead.deleteMany();
    await prisma.projectWarranty.deleteMany();
    await prisma.projectFeature.deleteMany();
    await prisma.projectGalleryImage.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.project.deleteMany();
    await prisma.service.deleteMany();
    await prisma.faq.deleteMany();
    await prisma.trackingSettings.deleteMany();
    await prisma.siteSettings.deleteMany();
    await prisma.homePageContent.deleteMany();
    await prisma.aboutPageContent.deleteMany();
    await prisma.user.deleteMany();
  }

  // 1. Admin User
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '?????? ????? (UAT)',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  }

  // 2. Site Settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {
      siteName: 'نحت العقارية - معاينة',
      contactEmail: 'info@naht-re.sa',
      contactPhone: '920000000',
      whatsappNumber: '966500000000',
      address: 'المملكة العربية السعودية، الرياض، طريق الملك فهد',
    },
    create: {
      id: 'global',
      siteName: 'نحت العقارية - معاينة',
      contactEmail: 'info@naht-re.sa',
      contactPhone: '920000000',
      whatsappNumber: '966500000000',
      address: 'المملكة العربية السعودية، الرياض، طريق الملك فهد',
    }
  });

  // 3. Home Page Content
  const homePage = await prisma.homePageContent.upsert({
    where: { id: 'global' },
    update: {
      heroTitle: 'نحت العقارية - فن البناء الحديث',
      heroSubtitle: 'نقدم لك مشاريع سكنية استثنائية ترتقي بجودة حياتك وتجسد أعلى معايير الرفاهية.',
      heroBackgroundImage: '/images/hero/hero-1.jpg',
      mapBackgroundImage: '/images/saudi-map-default.svg',
    },
    create: {
      id: 'global',
      heroTitle: 'نحت العقارية - فن البناء الحديث',
      heroSubtitle: 'نقدم لك مشاريع سكنية استثنائية ترتقي بجودة حياتك وتجسد أعلى معايير الرفاهية.',
      ctaButtonText: 'تصفح مشاريعنا',
      ctaButtonUrl: '/projects',
      statsTitle: 'أرقامنا تتحدث',
      stat1Label: 'مشروع منجز', stat1Value: '25+',
      stat2Label: 'عميل سعيد', stat2Value: '500+',
      stat3Label: 'سنوات خبرة', stat3Value: '10+',
      whyNahtTitle: 'لماذا تختار نحت العقارية؟',
      whyNahtDescription: 'لأننا نلتزم بأعلى معايير الجودة والشفافية في كل خطوة.',
      nahtFeature1Title: 'تصاميم عصرية', nahtFeature1Desc: 'نعتمد أحدث التصاميم المعمارية.',
      nahtFeature2Title: 'مواقع استراتيجية', nahtFeature2Desc: 'نختار مواقع مشاريعنا بعناية فائقة.',
      nahtFeature3Title: 'جودة البناء', nahtFeature3Desc: 'مواد بناء وفق أعلى المعايير.',
      nahtFeature4Title: 'ضمانات ممتدة', nahtFeature4Desc: 'نقدم ضمانات تصل إلى 10 سنوات.',
      showMapSection: true,
      mapSectionTitle: 'خريطة مشاريع نحت',
      mapSectionDesc: 'تصفح مشاريعنا بأسلوب تفاعلي عبر خريطة المملكة',
      mapMode: 'geographic',
      mapCenterLat: 24.7136,
      mapCenterLng: 46.6753,
      mapZoom: 5,
      mapTileStyle: 'warm',
      heroBackgroundImage: '/images/hero/hero-1.jpg',
      mapBackgroundImage: '/images/saudi-map-default.svg',
      pinLogoSize: 32,
    }
  });

  // 4. Tracking Settings
  await prisma.trackingSettings.upsert({
    where: { id: 'global' },
    update: {
      ga4MeasurementId: 'G-XXXXXXXXXX',
      isGa4Enabled: true,
      metaPixelId: '1234567890',
      isMetaPixelEnabled: true,
      snapchatPixelId: 'SNAP-XXXXX',
      isSnapchatPixelEnabled: true,
      tiktokPixelId: 'TT-XXXXX',
      isTiktokPixelEnabled: true,
    },
    create: {
      id: 'global',
      ga4MeasurementId: 'G-XXXXXXXXXX',
      isGa4Enabled: true,
      metaPixelId: '1234567890',
      isMetaPixelEnabled: true,
      snapchatPixelId: 'SNAP-XXXXX',
      isSnapchatPixelEnabled: true,
      tiktokPixelId: 'TT-XXXXX',
      isTiktokPixelEnabled: true,
    }
  });

  // 5. Projects
  const projectsData = [
    {
      slug: 'naht-demo',
      mainImage: '/images/projects/project-1.jpg',
      name: 'فيلا ديمو العرض (كاملة)',
      type: 'فيلا',
      city: 'الرياض',
      neighborhood: 'الياسمين',
      status: 'AVAILABLE',
      shortDesc: 'فيلا عرض مميزة بتفاصيل استثنائية، تستعرض قدرات نحت العقارية في بناء الفلل الفاخرة.',
      fullDesc: 'تعتبر فيلا ديمو العرض نموذجاً مثالياً لما تقدمه نحت العقارية لعملائها. تتكون الفيلا من دورين وملحق، وتضم صالات واسعة، مطبخ رئيسي ومطبخ تحضيري، غرف نوم ماستر، بالإضافة إلى حديقة خارجية ومسبح وموقف سيارتين.',
      isFeatured: true,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: 24.8150,
      mapLng: 46.6350,
      mapX: 55, mapY: 45,
      price: 2500000,
      area: 350,
      rooms: 5,
      baths: 6,
      progressPercent: 100,
      progressLabel: 'مكتمل وجاهز للتسليم',
      features: ['سمارت هوم', 'تكييف مخفي', 'مسبح خاص', 'حديقة خارجية', 'مصعد راكب'],
      warranties: ['الهيكل الإنشائي - 10 سنوات', 'السباكة والكهرباء - 5 سنوات', 'العزل المائي - 10 سنوات']
    },
    {
      slug: 'naht-15',
      mainImage: '/images/projects/project-2.jpg',
      name: 'مشروع نحت 15',
      type: 'فيلا',
      city: 'الرياض',
      neighborhood: 'النرجس',
      status: 'AVAILABLE',
      shortDesc: 'مشروع فلل فاخرة في حي النرجس بتصاميم عصرية.',
      fullDesc: 'مشروع نحت 15 يمثل نقلة نوعية في عالم العقارات، يوفر فلل سكنية بأعلى المعايير وجودة البناء العالية مع ضمانات شاملة.',
      isFeatured: true,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: 24.8350,
      mapLng: 46.6550,
      mapX: 45, mapY: 35,
      price: 3200000,
      area: 400,
      rooms: 6,
      baths: 7,
      progressPercent: 85,
      progressLabel: 'قيد التشطيب النهائي',
      features: ['واجهات مودرن', 'تكييف مركزي', 'شرفة واسعة'],
      warranties: ['الهيكل الإنشائي - 10 سنوات']
    },
    {
      slug: 'naht-tower',
      mainImage: '/images/projects/project-3.jpg',
      name: 'برج نحت (جدة)',
      type: 'شقة',
      city: 'جدة',
      neighborhood: 'الشاطئ',
      status: 'COMING_SOON',
      shortDesc: 'شقق فاخرة بإطلالة بحرية ساحرة في قلب مدينة جدة.',
      fullDesc: 'يقع برج نحت في حي الشاطئ بجدة، ويقدم شققاً سكنية بإطلالات خلابة على البحر الأحمر، مع مرافق متكاملة من نادي رياضي ومسبح مشترك وحراسة على مدار الساعة.',
      isFeatured: false,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: 21.5833,
      mapLng: 39.1333,
      mapX: 25, mapY: 65,
      price: 1800000,
      area: 220,
      rooms: 4,
      baths: 4,
      progressPercent: 40,
      progressLabel: 'مرحلة العظم',
      features: ['نادي رياضي', 'حراسة 24/7', 'إطلالة بحرية', 'مواقف تحت الأرض'],
      warranties: ['الهيكل الإنشائي - 10 سنوات', 'مصاعد - 5 سنوات']
    },
    {
      slug: 'naht-east',
      mainImage: '/images/projects/project-4.jpg',
      name: 'نحت الشرق (الدمام)',
      type: 'شقة',
      city: 'الدمام',
      neighborhood: 'الفيصلية',
      status: 'SOLD_OUT',
      shortDesc: 'مجمع سكني متكامل الخدمات في المنطقة الشرقية.',
      fullDesc: 'مشروع سكني يقدم شققاً بمساحات ذكية تناسب العائلات الحديثة.',
      isFeatured: false,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: 26.4207,
      mapLng: 50.0888,
      mapX: 75, mapY: 30,
      price: 850000,
      area: 150,
      rooms: 3,
      baths: 3,
      progressPercent: 100,
      progressLabel: 'مباع بالكامل',
      features: ['دخول ذكي', 'مواقف خاصة'],
      warranties: ['الهيكل الإنشائي - 10 سنوات']
    },
    {
      slug: 'naht-plots',
      mainImage: '/images/projects/project-5.jpg',
      name: 'مخطط نحت السكني',
      type: 'أرض',
      city: 'الرياض',
      neighborhood: 'المهدية',
      status: 'AVAILABLE',
      shortDesc: 'أراضي سكنية مطورة ومكتملة الخدمات بأسعار تنافسية.',
      fullDesc: 'مخطط سكني نموذجي يوفر أراضي جاهزة للبناء، مع توفر جميع الخدمات من كهرباء وماء وسفلتة وإنارة.',
      isFeatured: true,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: 24.6436,
      mapLng: 46.5453,
      mapX: 40, mapY: 55,
      price: 900000,
      area: 500,
      rooms: 0,
      baths: 0,
      progressPercent: 100,
      progressLabel: 'مكتمل التطوير',
      features: ['مكتمل الخدمات', 'شوارع فسيحة', 'قريب من الطرق الرئيسية'],
      warranties: []
    }
  ];

  for (const p of projectsData) {
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        type: p.type,
        city: p.city,
        neighborhood: p.neighborhood,
        status: p.status,
        shortDesc: p.shortDesc,
        fullDesc: p.fullDesc,
        isFeatured: p.isFeatured,
        isVisible: p.isVisible,
        showOnHomeMap: p.showOnHomeMap,
        mapLat: p.mapLat, mapLng: p.mapLng,
        mapX: p.mapX, mapY: p.mapY,
        price: p.price,
        area: p.area,
        rooms: p.rooms,
        baths: p.baths,
        progressPercent: p.progressPercent,
        progressLabel: p.progressLabel,
        mainImage: p.mainImage,
      },
      create: {
        slug: p.slug,
        name: p.name,
        type: p.type,
        city: p.city,
        neighborhood: p.neighborhood,
        status: p.status,
        shortDesc: p.shortDesc,
        fullDesc: p.fullDesc,
        isFeatured: p.isFeatured,
        isVisible: p.isVisible,
        showOnHomeMap: p.showOnHomeMap,
        mapLat: p.mapLat, mapLng: p.mapLng,
        mapX: p.mapX, mapY: p.mapY,
        price: p.price,
        area: p.area,
        rooms: p.rooms,
        baths: p.baths,
        progressPercent: p.progressPercent,
        progressLabel: p.progressLabel,
        mainImage: p.mainImage,
      }
    });

    await prisma.projectFeature.deleteMany({ where: { projectId: project.id } });
    await prisma.projectWarranty.deleteMany({ where: { projectId: project.id } });
    await prisma.projectGalleryImage.deleteMany({ where: { projectId: project.id } });

    if (p.features.length > 0) {
      await prisma.projectFeature.createMany({
        data: p.features.map(f => ({ projectId: project.id, title: f }))
      });
    }

    if (p.warranties.length > 0) {
      await prisma.projectWarranty.createMany({
        data: p.warranties.map(w => ({ projectId: project.id, title: w }))
      });
    }

    await prisma.projectGalleryImage.create({
      data: {
        projectId: project.id,
        url: p.mainImage,
        alt: p.name + ' - صورة 1',
        order: 1
      }
    });
  }

  // 6. Demo Units for Naht-15
  const project15 = await prisma.project.findUnique({ where: { slug: 'naht-15' } });
  if (project15) {
    await prisma.unit.deleteMany({ where: { projectId: project15.id } });
    await prisma.unit.createMany({
      data: [
        { projectId: project15.id, unitNum: 'V-1', type: 'فيلا', area: 350, rooms: 5, baths: 6, status: 'AVAILABLE', price: 3200000, isVisible: true },
        { projectId: project15.id, unitNum: 'V-2', type: 'فيلا', area: 400, rooms: 6, baths: 7, status: 'SOLD', price: 3500000, isVisible: true }
      ]
    });
  }

  // 7. FAQs
  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({
    data: [
      { question: 'هل المشاريع تقبل التمويل البنكي؟', answer: 'نعم، جميع مشاريعنا معتمدة وتقبل التمويل من كافة البنوك السعودية.', isVisible: true, order: 1 },
      { question: 'ما هي مدة الضمانات المقدمة؟', answer: 'نقدم ضمان 10 سنوات على الهيكل الإنشائي والعزل، و5 سنوات للسباكة والكهرباء.', isVisible: true, order: 2 },
      { question: 'هل يمكن تعديل المخططات الداخلية؟', answer: 'نعم، في حال كان المشروع قيد الإنشاء يمكن تخصيص بعض التفاصيل حسب الرغبة.', isVisible: true, order: 3 },
    ]
  });

  // 8. Services
  await prisma.service.deleteMany({});
  await prisma.service.createMany({
    data: [
      { title: 'التطوير العقاري', description: 'إنشاء مجمعات سكنية متكاملة.', icon: 'Building', isVisible: true, order: 1 },
      { title: 'التسويق والمبيعات', description: 'تسويق احترافي للمشاريع العقارية.', icon: 'Megaphone', isVisible: true, order: 2 },
      { title: 'إدارة الأملاك', description: 'إدارة متكاملة للأملاك تضمن راحة البال.', icon: 'Key', isVisible: true, order: 3 },
    ]
  });

  // 9. Demo Leads
  const existingLead = await prisma.lead.findFirst({ where: { phone: '0501234567' } });
  if (!existingLead) {
    await prisma.lead.create({
      data: {
        name: 'محمد عبدالله (تجريبي)',
        phone: '0501234567',
        status: 'NEW',
        formType: 'GENERAL',
        source: 'WEB_FORM',
        projectId: project15?.id,
      }
    });
  }

  console.log('Seeding task permissions...');
  const taskPermissions = [
    { module: 'TASKS', action: 'VIEW', code: 'tasks.view', description: 'عرض المهام' },
    { module: 'TASKS', action: 'CREATE', code: 'tasks.create', description: 'إنشاء مهمة' },
    { module: 'TASKS', action: 'EDIT', code: 'tasks.edit', description: 'تعديل المهام / تغيير الحالة' },
    { module: 'TASKS', action: 'ASSIGN', code: 'tasks.assign', description: 'إسناد المهام لمستخدم' },
    { module: 'TASKS', action: 'APPROVE', code: 'tasks.approve', description: 'اعتماد المهام ورفضها' },
    { module: 'TASKS', action: 'DELETE', code: 'tasks.delete', description: 'حذف / إلغاء المهام' },
    { module: 'TASKS', action: 'UPLOAD_ATTACHMENT', code: 'tasks.attachments.upload', description: 'رفع مرفقات المهام' },
    { module: 'TASKS', action: 'VIEW_ATTACHMENT', code: 'tasks.attachments.view', description: 'عرض المرفقات للمهام' },
    { module: 'TASKS', action: 'DELETE_ATTACHMENT', code: 'tasks.attachments.delete', description: 'حذف مرفقات المهام' },

    // Work Projects
    { module: 'WORK_PROJECTS', action: 'VIEW', code: 'work_projects.view', description: 'عرض مشاريع العمل' },
    { module: 'WORK_PROJECTS', action: 'CREATE', code: 'work_projects.create', description: 'إنشاء مشروع عمل' },
    { module: 'WORK_PROJECTS', action: 'EDIT', code: 'work_projects.edit', description: 'تعديل مشروع عمل' },
    { module: 'WORK_PROJECTS', action: 'MANAGE_MEMBERS', code: 'work_projects.manage_members', description: 'إدارة أعضاء مشاريع العمل' },
    { module: 'WORK_PROJECTS', action: 'TRANSFER_OWNERSHIP', code: 'work_projects.transfer_ownership', description: 'نقل ملكية مشروع العمل' },
    { module: 'WORK_PROJECTS', action: 'ARCHIVE', code: 'work_projects.archive', description: 'أرشفة مشروع العمل' },
    { module: 'WORK_PROJECTS', action: 'UPLOAD_ATTACHMENT', code: 'work_projects.attachments.upload', description: 'رفع مرفقات مشاريع العمل' },
    { module: 'WORK_PROJECTS', action: 'VIEW_ATTACHMENT', code: 'work_projects.attachments.view', description: 'عرض مرفقات مشاريع العمل' },
    { module: 'WORK_PROJECTS', action: 'DELETE_ATTACHMENT', code: 'work_projects.attachments.delete', description: 'حذف مرفقات مشاريع العمل' },
  ];

  const createdTaskPerms = [];
  for (const perm of taskPermissions) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdTaskPerms.push(p);
  }

  const adminRole = await prisma.appRole.findUnique({
    where: { code: 'ADMIN' },
  });

  if (adminRole) {
    for (const p of createdTaskPerms) {
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
    console.log('Task and WorkProject permissions seeded and assigned to ADMIN role successfully.');
  }

  const superAdminRole = await prisma.appRole.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  if (superAdminRole) {
    for (const p of createdTaskPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      });
    }
    console.log('Task and WorkProject permissions assigned to SUPER_ADMIN role successfully.');
  }

    console.log('Staging UAT Seeding finished successfully.');

  // Validation
  const projectCount = await prisma.project.count();
  const firstProject = await prisma.project.findFirst({ select: { name: true, mainImage: true }});
  const homePageCheck = await prisma.homePageContent.findUnique({ where: { id: 'global' }, select: { heroBackgroundImage: true }});

  console.log('--- DB Validation After Seed ---');
  console.log(`Total Projects: ${projectCount}`);
  console.log(`First Project: ${firstProject?.name} | mainImage: ${firstProject?.mainImage}`);
  console.log(`HomePage heroBackgroundImage: ${homePageCheck?.heroBackgroundImage}`);
  console.log('--------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


