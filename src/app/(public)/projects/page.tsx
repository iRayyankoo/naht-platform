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
    description: content?.seoDescription || "استعرض مشاريعنا السكنية المتاحة واختر ما يناسبك — مشاريع مختارة بعناية في مواقع واعدة.",
  });
}

export default async function PublicProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  let content = null;
  if (prisma.projectsPageContent) {
    content = await prisma.projectsPageContent.findUnique({ where: { id: "global" } });
  }

  const params = await searchParams;
  const q = params.q || "";
  const type = params.type || "";
  const status = params.status || "";
  const city = params.city || "";

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

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const allVisibleProjects = await prisma.project.findMany({
    where: { isVisible: true },
    select: { type: true, status: true, city: true },
  });

  const uniqueTypes = Array.from(new Set(allVisibleProjects.map(p => p.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(allVisibleProjects.map(p => p.status).filter(Boolean)));
  const uniqueCities = Array.from(new Set(allVisibleProjects.map(p => p.city).filter(Boolean)));

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20">

      {/* ── Page Hero ── */}
      <div className="bg-[#050505] pt-36 pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-[1px] w-8 bg-brand-cafe" />
            <span className="text-brand-cafe text-xs font-bold tracking-[0.3em] uppercase">نحت العقارية</span>
            <span className="h-[1px] w-8 bg-brand-cafe" />
          </div>
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight drop-shadow-md">
            {content?.title || "مشاريع نحت العقارية"}
          </h1>
          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed mb-4">
            {content?.description || "استعرض مشاريعنا السكنية المتاحة واختر ما يناسبك."}
          </p>
          {/* Trust line */}
          <p className="text-sm text-brand-cafe font-medium tracking-wide">
            مشاريع مختارة بعناية في مواقع واعدة
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Filters ── */}
        <ProjectsFilter
          types={uniqueTypes}
          statuses={uniqueStatuses}
          cities={uniqueCities}
        />

        {/* ── Results count ── */}
        {projects.length > 0 && (
          <p className="text-sm text-gray-500 mb-6 font-medium">
            يعرض <span className="text-gray-900 font-bold">{projects.length}</span> مشروع
          </p>
        )}

        {/* ── Projects Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project as any} />
          ))}
        </div>

        {/* ── Empty State ── */}
        {projects.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد مشاريع مطابقة</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed text-sm">
              {content?.emptyStateText || "جرّب تعديل الفلاتر أو مسحها لعرض جميع المشاريع المتاحة."}
            </p>
            <Link href="/projects" className="inline-block bg-brand-cafe hover:bg-brand-coal text-white font-bold py-2.5 px-8 transition-colors shadow-md text-sm [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]">
              عرض كل المشاريع
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
