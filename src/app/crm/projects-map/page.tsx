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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">خريطة المنتجات العقارية</h1>
      </div>
      
      <p className="text-gray-500">
        من هذه الصفحة يمكنك إدارة إعدادات الخريطة في الصفحة الرئيسية وتحديد مواقع المشاريع.
      </p>

      <MapManagerClient content={content} projects={projects} />
    </div>
  );
}
