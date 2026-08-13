import { prisma } from "@/lib/prisma";
import { getBaseMetadata } from "@/lib/seo";
import PublicHeroRenderer from "./components/PublicHeroRenderer";
import FeaturedProjects from "./components/FeaturedProjects";
import InteractiveMap from "./components/InteractiveMap";
import ModernAbout from "./components/ModernAbout";
import ModernServices from "./components/ModernServices";
import ModernContact from "./components/ModernContact";

export async function generateMetadata() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  return getBaseMetadata({
    title: content?.heroTitle ? `${content.heroTitle} | الرئيسية` : undefined,
    description: content?.heroSubtitle || undefined,
    openGraph: content?.heroBackgroundImage ? { images: [content.heroBackgroundImage] } : undefined,
  });
}

export default async function HomePage() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

  const notDemoFilter = {
    NOT: [
      { slug: "naht-demo" },
      { slug: "naht-plots" },
      { name: { contains: "ديمو" } },
    ],
  };

  // Featured projects (top 6 official projects)
  let featuredProjects = await prisma.project.findMany({
    where: { isVisible: true, isFeatured: true, ...notDemoFilter },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  if (featuredProjects.length === 0) {
    featuredProjects = await prisma.project.findMany({
      where: { isVisible: true, ...notDemoFilter },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  }

  const mapProjects = await prisma.project.findMany({
    where: {
      isVisible: true,
      showOnHomeMap: true,
      mapLat: { not: null },
      mapLng: { not: null },
      ...notDemoFilter,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      status: true,
      city: true,
      neighborhood: true,
      mainImage: true,
      mapLat: true,
      mapLng: true,
      isVisible: true,
      showOnHomeMap: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Services
  const services = await prisma.service.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="bg-[#F7F3EB]">
      {/* Hero */}
      <PublicHeroRenderer content={content} projects={featuredProjects} settings={settings} />

      {/* Featured Projects Catalog */}
      <FeaturedProjects projects={featuredProjects} />

      {/* Homepage Interactive Map */}
      <InteractiveMap content={content} projects={mapProjects} />

      {/* About */}
      <ModernAbout content={content} />

      {/* Services */}
      <ModernServices services={services} />

      {/* Contact Form */}
      <ModernContact
        contactPhone={settings?.contactPhone}
        contactEmail={settings?.contactEmail}
        address={settings?.address}
      />
    </div>
  );
}
