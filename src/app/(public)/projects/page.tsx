import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getBaseMetadata } from "@/lib/seo";
import { Prisma } from "@prisma/client";
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

  const where: Prisma.ProjectWhereInput = {
    isVisible: true,
    NOT: [
      { slug: "naht-demo" },
      { slug: "naht-plots" },
      { name: { contains: "ديمو" } },
    ],
  };

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
    where: {
      isVisible: true,
      NOT: [
        { slug: "naht-demo" },
        { slug: "naht-plots" },
        { name: { contains: "ديمو" } },
      ],
    },
    select: { type: true, status: true, city: true },
  });

  const uniqueTypes = Array.from(new Set(allVisibleProjects.map(p => p.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(allVisibleProjects.map(p => p.status).filter(Boolean)));
  const uniqueCities = Array.from(new Set(allVisibleProjects.map(p => p.city).filter(Boolean)));

  return (
    <div className="bg-[#F7F3EB] min-h-screen pb-20">
      {/* Page Hero */}
      <div className="bg-[#4F4949] pt-32 pb-20 relative overflow-hidden text-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {content?.title || "مشاريع نحت العقارية"}
          </h1>
          <p className="text-base md:text-lg text-[#F7F3EB]/80 max-w-xl mx-auto font-light">
            {content?.description || "استعرض مشاريعنا السكنية المتاحة في مدينة الرياض."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters */}
        <ProjectsFilter
          types={uniqueTypes}
          statuses={uniqueStatuses}
          cities={uniqueCities}
        />

        {projects.length > 0 && (
          <p className="text-xs text-[#4F4949]/70 mb-6 font-medium">
            يعرض <span className="text-[#4F4949] font-bold">{projects.length}</span> مشروع
          </p>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#A6937C]/20 mt-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-[#4F4949] mb-2">لا توجد مشاريع مطابقة</h3>
            <p className="text-sm text-[#4F4949]/70 mb-6">
              {content?.emptyStateText || "جرّب تعديل الفلاتر أو مسحها لعرض جميع المشاريع المتاحة."}
            </p>
            <Link
              href="/projects"
              className="inline-block bg-[#4F4949] hover:bg-[#A6937C] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
            >
              عرض كل المشاريع
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
