import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import type { HomePageContent } from "@prisma/client";
import MapManagerClient from "./MapManagerClient";

export const metadata = {
  title: "إدارة الخريطة - نحت العقارية",
};

export default async function ProjectsMapPage() {
  // DB-backed authentication guard (Fail-Closed)
  try {
    await requireRole(["ADMIN", "MARKETING"]);
  } catch {
    redirect("/crm");
  }

  const dbContent = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  const content = (dbContent || {
    id: "global",
    updatedAt: new Date(),
    heroDisplayMode: "SLIDER",
    heroTitle: "شركة نحت العقارية",
    heroSubtitle: "تطوير عقاري متميز في الرياض",
    heroBackgroundImage: null,
    ctaButtonText: "استكشف المشاريع",
    ctaButtonUrl: "/projects",
    showMapSection: true,
    mapSectionTitle: "تواجدنا في المملكة",
    mapSectionDesc: "تصفح مشاريعنا العقارية المنتشرة في أفضل أحياء المملكة والمختارة بعناية.",
    mapMode: "geographic",
    mapCenterLat: 24.7136,
    mapCenterLng: 46.6753,
    mapZoom: 11,
  }) as unknown as HomePageContent;

  // Fetch ALL 30 projects (including unpositioned and inactive projects for complete management)
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      neighborhood: true,
      status: true,
      isVisible: true,
      showOnHomeMap: true,
      mapLat: true,
      mapLng: true,
      mapX: true,
      mapY: true,
      mainImage: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة خريطة المشاريع العقارية</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة إعدادات الخريطة التفاعلية وتعيين المواقع بالسحب والنقر وتعديل الحالات بربط حي مع الموقع العام
          </p>
        </div>
      </div>

      <MapManagerClient initialContent={content} initialProjects={projects} />
    </div>
  );
}
