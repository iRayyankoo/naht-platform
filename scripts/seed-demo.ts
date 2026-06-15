import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Demo Real Estate Product...");

  const demoProject = await prisma.project.upsert({
    where: { slug: "demo-villa-1" },
    update: {},
    create: {
      name: "فيلا Demo - منتج اختباري",
      slug: "demo-villa-1",
      type: "فيلا",
      city: "الرياض",
      neighborhood: "الرمال",
      status: "AVAILABLE",
      area: 350,
      price: 1500000,
      rooms: 5,
      baths: 6,
      progressPercent: 75,
      progressLabel: "نسبة إنجاز البيع",
      locationText: "تقع الفيلا في قلب حي الرمال وتتميز بقربها من الطرق الرئيسية والخدمات.",
      googleMapsUrl: "https://maps.google.com/?q=24.8396,46.7844",
      shortDesc: "فيلا عصرية بتصميم حديث ومساحات واسعة تناسب العائلة السعودية في أرقى أحياء الرياض.",
      fullDesc: "نقدم لكم فيلا ديمو الاختبارية، والتي تمثل نموذجاً عصرياً للسكن المريح بتصميم يجمع بين الفخامة والعملية. تقع الفيلا في موقع استراتيجي وتوفر كافة الخدمات الأساسية لضمان حياة هادئة ومريحة. تم بناء الفيلا بأعلى معايير الجودة مع توفير باقة متكاملة من الضمانات الشاملة.",
      isFeatured: true,
      isVisible: true,
      mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      features: {
        create: [
          { title: "تصميم عصري", order: 1 },
          { title: "موقع حيوي", order: 2 },
          { title: "مساحات واسعة", order: 3 },
          { title: "تشطيبات عالية الجودة", order: 4 },
          { title: "مواقف خاصة", order: 5 },
          { title: "قرب الخدمات", order: 6 },
        ]
      },
      warranties: {
        create: [
          { title: "ضمان الهيكل الإنشائي", duration: "10 سنوات", order: 1 },
          { title: "ضمان السباكة", duration: "5 سنوات", order: 2 },
          { title: "ضمان الكهرباء", duration: "5 سنوات", order: 3 },
          { title: "ضمان العزل", duration: "10 سنوات", order: 4 },
          { title: "ضمان خزانات المياه", duration: "3 سنوات", order: 5 },
          { title: "ضمان التشطيبات", duration: "سنة واحدة", order: 6 },
        ]
      },
      galleryImages: {
        create: [
          { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800", order: 1, alt: "الواجهة" },
          { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800", order: 2, alt: "الصالون" },
          { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800", order: 3, alt: "المطبخ" },
          { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800", order: 4, alt: "غرفة النوم" },
        ]
      }
    }
  });

  console.log("Demo Product seeded successfully!");
  console.log("Product Title:", demoProject.name);
  console.log("Product Slug:", demoProject.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
