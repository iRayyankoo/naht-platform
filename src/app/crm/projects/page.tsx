import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FilterBar from "@/components/crm/FilterBar";

// Map type to Arabic label
const getProjectTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    "RESIDENTIAL": "سكني",
    "COMMERCIAL": "تجاري",
    "MIXED_USE": "متعدد الاستخدامات",
    "LAND": "أراضي"
  };
  return map[type] || type;
};

export default async function ProjectsPage({ searchParams }: { searchParams: { status?: string, type?: string, city?: string } }) {
  const session = await getServerSession(authOptions);
  
  const params = await Promise.resolve(searchParams);
  const statusFilter = typeof params.status === 'string' ? params.status : (Array.isArray(params.status) ? params.status[0] : undefined);
  const typeFilter = typeof params.type === 'string' ? params.type : (Array.isArray(params.type) ? params.type[0] : undefined);
  const cityFilter = typeof params.city === 'string' ? params.city : (Array.isArray(params.city) ? params.city[0] : undefined);

  // STRICT DATA FETCHING LOGIC PRESERVED
  const projects = await prisma.project.findMany({
    where: {
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { type: typeFilter }),
      ...(cityFilter && { city: cityFilter }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { units: true },
      },
    },
  });

  const allProjectsForFilter = await prisma.project.findMany({ select: { city: true } });
  const uniqueCities = Array.from(new Set(allProjectsForFilter.map(p => p.city).filter(Boolean))) as string[];

  const filterFields = [
    {
      key: "status",
      label: "الحالة",
      options: [
        { value: "AVAILABLE", label: "متاح" },
        { value: "SOLD", label: "مباع" },
        { value: "COMING_SOON", label: "قريباً" }
      ]
    },
    {
      key: "type",
      label: "نوع المشروع",
      options: [
        { value: "RESIDENTIAL", label: "سكني" },
        { value: "COMMERCIAL", label: "تجاري" },
        { value: "MIXED_USE", label: "متعدد الاستخدامات" },
        { value: "LAND", label: "أراضي" }
      ]
    },
    {
      key: "city",
      label: "المدينة",
      options: uniqueCities.map(c => ({ value: c, label: c }))
    }
  ];

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">المشاريع العقارية</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة محفظة المشاريع والوحدات العقارية بفعالية</p>
        </div>
        <Link
          href="/crm/projects/new"
          className="inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm"
        >
          إضافة مشروع جديد
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar fields={filterFields} />

      {/* Projects Grid Area */}
      {projects.length === 0 ? (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="text-gray-300 text-6xl mb-4">🏢</div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مشاريع مطابقة للفلاتر الحالية</h3>
           <p className="text-gray-500 text-sm max-w-md">جرّب تغيير الفلاتر المحددة أعلاه، أو قم بإضافة مشروع جديد إلى النظام.</p>
        </div>
      ) : (
        /* --- GRID CARDS VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
             <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col group hover:-translate-y-1">
                
                {/* Image Section */}
                <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                   {project.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.mainImage} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                      /* ── Styled placeholder for projects without a cover image ── */
                      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
                        !(project as any).isVisible
                          ? "bg-gradient-to-br from-gray-100 to-gray-200"
                          : "bg-gradient-to-br from-amber-50 to-amber-100"
                      }`}>
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          !(project as any).isVisible ? "bg-gray-300/60" : "bg-amber-200/60"
                        }`}>
                          {!(project as any).isVisible ? (
                            /* Lock icon for hidden internal projects */
                            <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            /* Building icon for visible projects */
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                        {/* Label */}
                        <span className={`text-xs font-semibold ${
                          !(project as any).isVisible ? "text-gray-500" : "text-amber-700"
                        }`}>
                          {!(project as any).isVisible ? "مشروع داخلي" : "لا توجد صورة"}
                        </span>
                      </div>
                   )}
                   
                   {/* Image Overlay Gradient for better badge visibility */}
                   <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30"></div>

                   {/* Top Badges */}
                   <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <span className={`px-3 py-1.5 text-[11px] font-bold rounded-full shadow-md backdrop-blur-md text-white ${
                        project.status === "AVAILABLE" ? "bg-green-600/90" :
                        project.status === "SOLD" ? "bg-red-600/90" :
                        "bg-blue-600/90"
                     }`}>
                       {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD" ? "مباع" : "قريباً"}
                     </span>
                     {project.isFeatured && (
                       <span className="px-3 py-1.5 text-[11px] font-bold rounded-full shadow-md backdrop-blur-md bg-yellow-400/90 text-yellow-900">
                         مميز
                       </span>
                     )}
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                   <div className="mb-2">
                      <Link href={`/crm/projects/${project.id}/units`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </Link>
                   </div>
                   
                   <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-5 font-medium line-clamp-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {project.city} - {project.neighborhood}
                   </div>
                   
                   {/* Metrics Grid */}
                   <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                         <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">النوع</span>
                         <span className="block text-sm font-bold text-gray-700 truncate">{getProjectTypeLabel(project.type)}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                         <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">إجمالي الوحدات</span>
                         <span className="block text-sm font-bold text-gray-700">{project._count.units}</span>
                      </div>
                   </div>

                   {/* Footer Actions */}
                   <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex gap-2 w-full">
                         <Link href={`/crm/projects/${project.id}/units`} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-center font-bold text-xs py-2.5 rounded-lg transition-colors">
                            الوحدات
                         </Link>
                         <Link href={`/crm/projects/${project.id}/edit`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-bold text-xs py-2.5 rounded-lg transition-colors">
                            تعديل
                         </Link>
                      </div>
                      
                      {/* ADMIN ONLY DELETE FORM */}
                      {session?.user && (session.user as any).role === "ADMIN" && (
                        <form action={async () => {
                          "use server";
                          const { deleteProject } = await import("@/actions/projects");
                          await deleteProject(project.id);
                        }}>
                          <button type="submit" title="حذف المشروع" className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </form>
                      )}
                   </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
