import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getBaseMetadata } from "@/lib/seo";
import ProjectsFilter from "./ProjectsFilter";
import ProjectCard from "./ProjectCard";

export async function generateMetadata() {
  let content = null;
  if (prisma.projectsPageContent) {
    content = await prisma.projectsPageContent.findUnique({ where: { id: "global" } });
  }
  return getBaseMetadata({
    title: content?.seoTitle || "مشاريعنا | نحت العقارية",
    description: content?.seoDescription || "تصفح أحدث المشاريع العقارية والاستثمارية التي تقدمها شركة نحت الأصول العقارية.",
  });
}

export default async function PublicProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  let content = null;
  if (prisma.projectsPageContent) {
    content = await prisma.projectsPageContent.findUnique({ where: { id: "global" } });
  }

  // Next.js 15 requires awaiting searchParams
  const params = await searchParams;
  const q = params.q || "";
  const type = params.type || "";
  const status = params.status || "";
  const city = params.city || "";

  // Build where clause based on filters
  const where: any = { isVisible: true };
  
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { neighborhood: { contains: q } },
      { city: { contains: q } },
    ];
  }
  if (type) where.type = type;
  if (status) where.status = status;
  if (city) where.city = city;

  // Fetch filtered projects
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Fetch unique values for dropdowns (using all visible projects)
  const allVisibleProjects = await prisma.project.findMany({
    where: { isVisible: true },
    select: { type: true, status: true, city: true },
  });

  const uniqueTypes = Array.from(new Set(allVisibleProjects.map(p => p.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(allVisibleProjects.map(p => p.status).filter(Boolean)));
  const uniqueCities = Array.from(new Set(allVisibleProjects.map(p => p.city).filter(Boolean)));

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20">
      
      {/* Clean Premium Hero Section for Projects */}
      <div className="bg-[#050505] pt-36 pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0,transparent_100%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
            <span className="text-[#D4AF37] text-sm font-bold tracking-wider uppercase">نحت العقارية</span>
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
            {content?.title || "منتجاتنا العقارية"}
          </h1>
          {content?.description && (
            <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow">
              {content.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Filters Section (Pulls up slightly over the hero) */}
        <ProjectsFilter 
          types={uniqueTypes} 
          statuses={uniqueStatuses} 
          cities={uniqueCities} 
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project as any} />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد منتجات عقارية مطابقة</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              {content?.emptyStateText || "نعمل على إضافة منتجات عقارية جديدة قريباً، يرجى مسح الفلاتر أو المحاولة لاحقاً."}
            </p>
            <Link href="/projects" className="inline-block bg-[#D4AF37] hover:bg-[#b5952f] text-white font-bold py-2.5 px-8 rounded-xl transition-colors shadow-md">
              عرض كل المشاريع
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
