import { prisma } from "@/lib/prisma";
import { getBaseMetadata } from "@/lib/seo";
import PublicHeroRenderer from "./components/PublicHeroRenderer";
import NewFeaturedProjects from "./components/NewFeaturedProjects";
import ModernAbout from "./components/ModernAbout";
import ModernServices from "./components/ModernServices";
import ModernContact from "./components/ModernContact";

import TrustStrip from "./components/TrustStrip";
import StickyMobileCta from "./components/StickyMobileCta";
import FeaturedUnits from "./components/FeaturedUnits";

export async function generateMetadata() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  return getBaseMetadata({
    title: content?.heroTitle ? `${content.heroTitle} | الرئيسية` : undefined,
    description: content?.heroSubtitle || undefined,
    openGraph: content?.heroBackgroundImage ? { images: [content.heroBackgroundImage] } : undefined,
  });
}

export default async function HomePage() {
  const content  = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

  // Featured projects (top 3)
  let featuredProjects = await prisma.project.findMany({
    where: { isVisible: true, isFeatured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  if (featuredProjects.length === 0) {
    featuredProjects = await prisma.project.findMany({
      where: { isVisible: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  }

  // Services
  const services = await prisma.service.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="bg-[#050505]">
      {/* Hero */}
      <PublicHeroRenderer content={content} projects={featuredProjects} settings={settings} />

      {/* Featured Projects */}
      <NewFeaturedProjects projects={featuredProjects} />

      {/* Featured Units */}
      <FeaturedUnits />

      {/* About */}
      <ModernAbout content={content} />

      {/* Services */}
      <ModernServices services={services} />

      {/* Trust Strip */}
      <TrustStrip />

      {/* Contact */}

      <ModernContact
        contactPhone={settings?.contactPhone}
        contactEmail={settings?.contactEmail}
        address={settings?.address}
      />


      {/* Sticky Mobile CTA */}
      <StickyMobileCta
        whatsappNumber={settings?.whatsappNumber}
        contactPhone={settings?.contactPhone}
      />
    </div>
  );
}
