import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@naht-re.sa" },
    update: {},
    create: {
      email: "admin@naht-re.sa",
      name: "المدير العام",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@naht-re.sa" },
    update: {},
    create: {
      email: "sales@naht-re.sa",
      name: "موظف مبيعات",
      password: hashedPassword,
      role: "SALES",
    },
  });

  const p1 = await prisma.project.upsert({
    where: { slug: "naht-15" },
    update: {},
    create: {
      name: "مشروع نحت 15",
      slug: "naht-15",
      type: "فيلا",
      city: "الرياض",
      neighborhood: "النرجس",
      status: "AVAILABLE",
      shortDesc: "مشروع فلل فاخرة في حي النرجس بتصاميم عصرية",
      fullDesc: "مشروع نحت 15 يمثل نقلة نوعية في عالم العقارات، يوفر فلل سكنية بأعلى المعايير وجودة البناء العالية مع ضمانات شاملة تصل إلى 10 سنوات.",
      isFeatured: true,
      isVisible: true,
      units: {
        create: [
          { unitNum: "V-1", type: "فيلا", area: 350, rooms: 5, baths: 6, status: "AVAILABLE" },
          { unitNum: "V-2", type: "فيلا", area: 400, rooms: 6, baths: 7, status: "SOLD" },
        ]
      }
    }
  });

  const p2 = await prisma.project.upsert({
    where: { slug: "naht-tower" },
    update: {},
    create: {
      name: "برج نحت",
      slug: "naht-tower",
      type: "شقة",
      city: "جدة",
      neighborhood: "الشاطئ",
      status: "COMING_SOON",
      shortDesc: "شقق فاخرة بإطلالة بحرية",
      isFeatured: false,
      isVisible: true,
      showOnHomeMap: true,
      mapX: 45,
      mapY: 65,
    }
  });

  const p3 = await prisma.project.upsert({
    where: { slug: "naht-demo" },
    update: {},
    create: {
      name: "فيلا ديمو العرض",
      slug: "naht-demo",
      type: "فيلا",
      city: "الرياض",
      neighborhood: "الياسمين",
      status: "AVAILABLE",
      shortDesc: "فيلا العرض المميزة بتفاصيل استثنائية",
      isFeatured: true,
      isVisible: true,
      showOnHomeMap: true,
      mapX: 55,
      mapY: 45,
    }
  });

  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      siteName: "نحت العقارية - Staging",
      contactEmail: "info@naht-re.sa",
      contactPhone: "920000000",
      whatsappNumber: "966500000000",
    }
  });

  const homePage = await prisma.homePageContent.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      heroTitle: "مرحباً بكم في مسودة نحت العقارية",
      heroSubtitle: "هذه النسخة التجريبية مخصصة للعرض الإداري",
      showMapSection: true,
      mapSectionTitle: "خريطة المشاريع",
      mapSectionDesc: "تصفح مشاريعنا بأسلوب تفاعلي",
      mapMode: "geographic",
      mapCenterLat: 24.7136,
      mapCenterLng: 46.6753,
      mapZoom: 5,
      mapTileStyle: "warm",
      mapBackgroundImage: "/images/saudi-map-default.svg"
    }
  });

  console.log("Seeding finished.");
  console.log({ admin, sales, p1, p2, p3, siteSettings, homePage });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
