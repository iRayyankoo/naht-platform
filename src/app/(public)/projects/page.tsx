import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getBaseMetadata } from "@/lib/seo";
import ProjectsFilter from "./ProjectsFilter";

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
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* Luxury Hero Section for Projects */}
      <div className="bg-primary pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {content?.title || "مشاريعنا العقارية"}
          </h1>
          {content?.description && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {content.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters Section (Pulls up slightly over the hero) */}
        <ProjectsFilter 
          types={uniqueTypes} 
          statuses={uniqueStatuses} 
          cities={uniqueCities} 
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <Link href={`/projects/${project.slug}`} className="relative h-56 md:h-64 bg-gray-200 block group overflow-hidden">
                {project.mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.mainImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 group-hover:scale-105 transition-transform duration-500">
                    {project.name.charAt(0)}
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    project.status === "AVAILABLE" ? "bg-green-500 text-white" :
                    project.status === "SOLD" ? "bg-red-500 text-white" :
                    "bg-blue-500 text-white"
                  }`}>
                    {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD" ? "مباع" : "قريباً"}
                  </span>
                </div>
              </Link>
              <div className="p-5 md:p-6 flex flex-col flex-1">
                <div className="text-sm text-primary font-bold mb-2">{project.type} &bull; {project.city}</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{project.shortDesc || "لا يوجد وصف مختصر لهذا المشروع."}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-base font-medium text-gray-500 self-start sm:self-center">الحي: {project.neighborhood}</span>
                  <Link href={`/projects/${project.slug}`} className="w-full sm:w-auto text-center bg-gray-50 hover:bg-primary hover:text-white text-primary border border-gray-200 hover:border-primary font-bold py-2.5 px-5 rounded-md transition-colors text-base shadow-sm">
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مشاريع مطابقة</h3>
            <p className="text-gray-600">{content?.emptyStateText || "نعمل على إضافة مشاريع جديدة قريباً."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
