import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing content data
  await prisma.homePageContent.deleteMany({});
  await prisma.aboutPageContent.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.faq.deleteMany({});
  
  // 1. Seed HomePageContent
  await prisma.homePageContent.create({
    data: {
      id: "global",
      heroTitle: "مستقبلك يبدأ من هنا",
      heroSubtitle: "نحت الأصول العقارية تقدم لك خيارات سكنية واستثمارية فريدة، صُممت بعناية لتناسب تطلعاتك وأسلوب حياتك.",
      heroBackgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
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
      whyNahtDescription: "نلتزم بتقديم أعلى معايير الجودة والشفافية في كافة تعاملاتنا. نحن لا نبني مجرد مساكن، بل نؤسس مجتمعات تنبض بالحياة ותوفر بيئة مستدامة تلبي احتياجات الأجيال القادمة.",
      aboutBriefTitle: "من نحن",
      aboutBriefText: "شركة سعودية رائدة في مجال التطوير والاستثمار العقاري، نسعى للريادة من خلال الابتكار في تصميم وتطوير مشاريع سكنية وتجارية متكاملة تساهم في تحقيق جودة الحياة.",
      aboutBriefImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    }
  });

  // 2. Seed AboutPageContent
  await prisma.aboutPageContent.create({
    data: {
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

  // 3. Seed Services
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

  // 4. Seed FAQs
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
