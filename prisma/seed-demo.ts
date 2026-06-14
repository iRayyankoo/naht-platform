import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Demo Seeding...");

  // 1. Seed HomePageContent (Upsert and update missing fields)
  const existingHome = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  const homeData = {
    id: "global",
    heroTitle: "مستقبلك يبدأ من هنا",
    heroSubtitle: "نحت الأصول العقارية تقدم لك خيارات سكنية واستثمارية فريدة، صُممت بعناية لتناسب تطلعاتك وأسلوب حياتك.",
    heroBackgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80\nhttps://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80\nhttps://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ctaButtonText: "استكشف مشاريعنا",
    ctaButtonUrl: "/projects",
    statsTitle: "أرقامنا تتحدث",
    stat1Label: "مشروع منجز",
    stat1Value: "+45",
    stat2Label: "عميل سعيد",
    stat2Value: "+1,200",
    stat3Label: "شراكة استراتيجية",
    stat3Value: "15",
    whyNahtTitle: "لماذا تختار نحت الأصول؟",
    whyNahtDescription: "نلتزم بتقديم أعلى معايير الجودة والشفافية في كافة تعاملاتنا. نحن لا نبني مجرد مساكن، بل نؤسس مجتمعات تنبض بالحياة وتوفر بيئة مستدامة تلبي احتياجات الأجيال القادمة.",
    aboutBriefTitle: "من نحن",
    aboutBriefText: "شركة سعودية رائدة في مجال التطوير والاستثمار العقاري، نسعى للريادة من خلال الابتكار في تصميم وتطوير مشاريع سكنية وتجارية متكاملة تساهم في تحقيق جودة الحياة.",
    aboutBriefImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  };

  if (!existingHome) {
    await prisma.homePageContent.create({ data: homeData });
  } else if (!existingHome.heroBackgroundImage || existingHome.heroBackgroundImage.trim() === "") {
    // If the record exists but heroBackgroundImage is missing/empty, update it
    await prisma.homePageContent.update({
      where: { id: "global" },
      data: { heroBackgroundImage: homeData.heroBackgroundImage }
    });
  }

  // 2. Seed AboutPageContent
  const existingAbout = await prisma.aboutPageContent.findUnique({ where: { id: "global" } });
  await prisma.aboutPageContent.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      title: "قصتنا",
      shortDescription: "نحت الأصول العقارية هي أكثر من مجرد شركة تطوير عقاري، نحن شركاء في بناء مستقبلك.",
      fullDescription: "منذ تأسيسها، التزمت شركة نحت الأصول بتقديم مفاهيم مبتكرة في عالم العقار. نؤمن بأن السكن ليس مجرد جدران، بل مساحات تعكس أسلوب الحياة وتلهم الإبداع. نعمل بشغف لتطوير مجتمعات توفر الرفاهية والأمان والتكامل الخدمي.",
      vision: "أن نكون الخيار الأول والرواد في تقديم حلول عقارية مبتكرة ومستدامة على مستوى المنطقة.",
      mission: "تطوير مشاريع عقارية استثنائية تفوق توقعات عملائنا، من خلال دمج الجودة، والتصميم العصري، والتقنية الذكية.",
      values: "الشفافية، الجودة، الابتكار، الاستدامة، العميل أولاً",
      mediaUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
      companyStats: "خبرة تمتد لأكثر من 10 سنوات في سوق العقار السعودي.",
      seoTitle: "من نحن | نحت الأصول العقارية",
      seoDescription: "تعرف على شركة نحت الأصول العقارية، رؤيتنا، رسالتنا، وقيمنا التي نرتكز عليها في مسيرتنا لتطوير القطاع العقاري."
    }
  });

  // 3. Seed ContactPageContent
  await prisma.contactPageContent.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      title: "تواصل معنا",
      description: "يسعدنا تواصلكم معنا للإجابة على كافة استفساراتكم",
      formTitle: "كيف يمكننا مساعدتك؟",
      submitButtonText: "إرسال رسالتك الآن",
      helperText: "سنقوم بالرد عليك خلال 24 ساعة كحد أقصى.",
      heroImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1600&q=80"
    }
  });

  // 4. Seed Services (Check first)
  const existingServicesCount = await prisma.service.count();
  if (existingServicesCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          title: "التطوير العقاري",
          slug: "real-estate-development",
          description: "تصميم وتنفيذ مشاريع سكنية وتجارية بمعايير عالمية.",
          fullDescription: "ندير دورة حياة التطوير العقاري بالكامل، بدءاً من دراسة الجدوى واختيار الموقع، مروراً بالتصميم المعماري والهندسي، وصولاً إلى التنفيذ والتسليم. نضمن استخدام أفضل المواد وتطبيق أحدث أساليب البناء.",
          order: 1,
          isVisible: true
        },
        {
          title: "التسويق والمبيعات",
          slug: "marketing-and-sales",
          description: "خطط تسويقية متكاملة وإدارة مبيعات احترافية للمشاريع.",
          fullDescription: "نقدم حلولاً تسويقية مبتكرة تضمن وصول مشاريعك للجمهور المستهدف بشكل فعال. فريقنا من الخبراء يمتلك معرفة عميقة بسوق العقار المحلي ويطبق استراتيجيات مبيعات تحقق أعلى العوائد.",
          order: 2,
          isVisible: true
        },
        {
          title: "إدارة الأملاك",
          slug: "property-management",
          description: "رعاية شاملة لعقاراتك لضمان استدامتها وزيادة عوائدها.",
          fullDescription: "خدماتنا في إدارة الأملاك تشمل التأجير، التحصيل، الصيانة الدورية، وإدارة المرافق. نهدف إلى إراحة المالك من عناء المتابعة وتوفير بيئة ممتازة للمستأجرين.",
          order: 3,
          isVisible: true
        }
      ]
    });
  }

  // 5. Seed FAQs (Check first)
  const existingFaqsCount = await prisma.faq.count();
  if (existingFaqsCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "هل تقدمون ضمانات على البناء؟",
          answer: "نعم، جميع مشاريعنا تأتي مع ضمانات شاملة تصل إلى 10 سنوات على الهيكل الإنشائي، وضمانات متعددة على السباكة والكهرباء والتشطيبات.",
          category: "المشاريع والضمانات",
          order: 1,
          isVisible: true
        },
        {
          question: "هل يمكنني حجز وحدة سكنية قبل اكتمال المشروع؟",
          answer: "بالتأكيد، نوفر خيار البيع على الخارطة للعديد من مشاريعنا مع خطط سداد مرنة تتناسب مع مراحل الإنجاز.",
          category: "المبيعات",
          order: 2,
          isVisible: true
        },
        {
          question: "كيف يمكنني التواصل مع خدمة العملاء؟",
          answer: "يمكنكم التواصل معنا عبر الرقم الموحد، الواتساب، أو من خلال تعبئة نموذج الاتصال في الموقع وسيقوم فريقنا بالرد عليكم في أقرب وقت.",
          category: "التواصل",
          order: 3,
          isVisible: true
        }
      ]
    });
  }

  // 6. Seed Projects
  const projectsData = [
    {
      name: "مشروع إيليت ريزيدنس",
      slug: "elite-residence",
      shortDesc: "مجمع سكني فاخر يقع في قلب العاصمة، يتميز بتصاميم عصرية ومرافق متكاملة.",
      fullDesc: "نقدم لكم مشروع إيليت ريزيدنس، الخيار الأمثل لحياة الرفاهية والهدوء.",
      status: "AVAILABLE",
      type: "سكنية",
      city: "الرياض",
      neighborhood: "حي الملقا",
      mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      isFeatured: true,
      isVisible: true
    },
    {
      name: "مجمع الصفوة التجاري",
      slug: "alsafwa-commercial",
      shortDesc: "مركز تجاري حيوي يضم مساحات مكتبية راقية ومعارض تجارية حديثة.",
      fullDesc: "مجمع الصفوة هو وجهتك المثالية لتأسيس أو تطوير أعمالك.",
      status: "AVAILABLE",
      type: "تجارية",
      city: "جدة",
      neighborhood: "حي الشاطئ",
      mainImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      isFeatured: true,
      isVisible: true
    },
    {
      name: "برج المستقبل",
      slug: "future-tower",
      shortDesc: "برج سكني شاهق يطل على معالم المدينة، يقدم أسلوب حياة استثنائي.",
      fullDesc: "تجربة سكنية لا مثيل لها في برج المستقبل.",
      status: "SOLD",
      type: "سكنية",
      city: "الدمام",
      neighborhood: "حي الشاطئ",
      mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      isFeatured: false,
      isVisible: true
    }
  ];

  for (const projData of projectsData) {
    const existing = await prisma.project.findUnique({ where: { slug: projData.slug } });
    if (!existing) {
      const project = await prisma.project.create({
        data: projData
      });

      // Add Units
      await prisma.unit.createMany({
        data: [
          {
            projectId: project.id,
            unitNum: "A-101",
            type: "شقة سكنية",
            rooms: 3,
            baths: 2,
            area: 150,
            price: 850000,
            status: "AVAILABLE",
            isVisible: true
          },
          {
            projectId: project.id,
            unitNum: "A-102",
            type: "شقة سكنية",
            rooms: 4,
            baths: 3,
            area: 210,
            price: 1200000,
            status: "SOLD",
            isVisible: true
          }
        ]
      });
    }
  }

  console.log("Demo Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
