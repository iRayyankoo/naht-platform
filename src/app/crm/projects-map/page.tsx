import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MapManagerClient from "./MapManagerClient";

export const metadata = {
  title: "إدارة الخريطة - نحت العقارية",
};

export default async function ProjectsMapPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MARKETING") {
    redirect("/crm");
  }

  // Fetch Homepage Content for map settings
  let content = await prisma.homePageContent.findFirst();
  if (!content) {
    content = await prisma.homePageContent.create({ data: {} });
  }

  // Fetch all projects with their map coordinates
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
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">خريطة المنتجات العقارية</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة إعدادات الخريطة التفاعلية وتحديد مواقع المشاريع</p>
        </div>
      </div>

      {projects.length === 0 ? (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="text-gray-300 text-6xl mb-4">📍</div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مشاريع مضافة حتى الآن لتحديد مواقعها</h3>
           <p className="text-gray-500 text-sm max-w-md">أضف مشروعاً جديداً ثم حدد إحداثياته لظهوره على الخريطة.</p>
        </div>
      ) : (
        /* --- MAP WRAPPER --- */
        <div className="bg-white shadow-sm border border-gray-100 sm:rounded-2xl overflow-hidden p-2 sm:p-6">
          <MapManagerClient content={content} projects={projects} />
        </div>
      )}
    </div>
  );
}
