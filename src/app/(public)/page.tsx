import { prisma } from "@/lib/prisma";
import { getBaseMetadata } from "@/lib/seo";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import AboutBrief from "./components/AboutBrief";
import FeaturedProjects from "./components/FeaturedProjects";
import ProjectTypes from "./components/ProjectTypes";
import WhyChooseUs from "./components/WhyChooseUs";
import HomeFaq from "./components/HomeFaq";
import HomeContact from "./components/HomeContact";

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
    take: 6,
    orderBy: { createdAt: 'desc' }
  });

  if (featuredProjects.length === 0) {
    featuredProjects = await prisma.project.findMany({ 
      where: { isVisible: true }, 
      take: 6,
      orderBy: { createdAt: 'desc' }
    });
  }
  
  const projectTypes = await prisma.project.findMany({
    where: { isVisible: true },
    select: { type: true },
    distinct: ['type']
  });

  const faqs = await prisma.faq.findMany({ 
    where: { isVisible: true }, 
    orderBy: { order: "asc" },
    take: 5 // Just top 5 for home page
  });

  return (
    <div className="bg-white">
      <HeroSection content={content} />
      <FeaturedProjects projects={featuredProjects} />
      <AboutBrief content={content} />
      <ProjectTypes types={projectTypes} />
      <StatsSection content={content} />
      <WhyChooseUs content={content} />
      <HomeFaq faqs={faqs} />
      <HomeContact settings={settings} />
    </div>
  );
}
