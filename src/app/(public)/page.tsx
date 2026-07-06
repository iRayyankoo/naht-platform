import { prisma } from "@/lib/prisma";
import { getBaseMetadata } from "@/lib/seo";
import PublicHeroRenderer from "./components/PublicHeroRenderer";
import StatsSection from "./components/StatsSection";
import AboutBrief from "./components/AboutBrief";
import FeaturedProjects from "./components/FeaturedProjects";
import InteractiveMap from "./components/InteractiveMap";
import WhyChooseUs from "./components/WhyChooseUs";
import HomeFaq from "./components/HomeFaq";
import HomeContact from "./components/HomeContact";
import NahtStandard from "./components/NahtStandard";
import StickyMobileCta from "./components/StickyMobileCta";
import TrustStrip from "./components/TrustStrip";
import ClientJourney from "./components/ClientJourney";

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
  
  let featuredProjects = await prisma.project.findMany({ 
    where: { isVisible: true, isFeatured: true }, 
    take: 5, // We take 5 for the new layout (1 signature + 4 curated)
    orderBy: { createdAt: 'desc' }
  });

  if (featuredProjects.length === 0) {
    featuredProjects = await prisma.project.findMany({ 
      where: { isVisible: true }, 
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
  }
  
  const mapProjects = await prisma.project.findMany({
    where: { isVisible: true, showOnHomeMap: true },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      price: true,
      area: true,
      mainImage: true,
      mapX: true,
      mapY: true,
      mapLat: true,
      mapLng: true,
      type: true,
      city: true
    }
  });

  const faqs = await prisma.faq.findMany({ 
    where: { isVisible: true }, 
    orderBy: { order: "asc" },
    take: 5 // Just top 5 for home page
  });

  return (
    <div className="bg-[#050505]"> {/* Main luxury background */}
      <PublicHeroRenderer content={content} projects={featuredProjects} settings={settings} />
      <FeaturedProjects projects={featuredProjects} />
      <TrustStrip />
      <NahtStandard content={content} />
      <div className="bg-[#F9F9F7]"> {/* Light background for the rest */}
        <AboutBrief content={content} />
        <InteractiveMap content={content} projects={mapProjects} />
        <StatsSection content={content} />
        <WhyChooseUs content={content} />
        <ClientJourney />
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="order-1">
                <HomeFaq faqs={faqs} />
              </div>
              <div className="order-2">
                <HomeContact settings={settings} />
              </div>
            </div>
          </div>
        </section>
      </div>
      <StickyMobileCta whatsappNumber={settings?.whatsappNumber} contactPhone={settings?.contactPhone} />
    </div>
  );
}
