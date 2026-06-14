import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getBaseMetadata({
    title: "مشاريعنا | نحت العقارية",
    description: "تصفح أحدث المشاريع العقارية والاستثمارية التي تقدمها شركة نحت الأصول العقارية.",
  });
}

export default async function PublicProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مشاريعنا العقارية</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف أحدث مشاريع شركة نحت الأصول العقارية في أرقى أحياء المملكة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <Link href={`/projects/${project.slug}`} className="relative h-56 md:h-64 bg-gray-200 block group">
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
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مشاريع حالياً</h3>
            <p className="text-gray-600">نعمل على إضافة مشاريع جديدة قريباً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
