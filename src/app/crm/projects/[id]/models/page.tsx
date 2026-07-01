import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import Image from "next/image";

export default async function ProjectModelsReadOnlyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "MARKETING"]);
  const id = (await params).id;
  
  const project = await prisma.project.findUnique({
    where: { id: id },
    include: {
      models: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          units: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      units: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!project) {
    notFound();
  }

  // Filter unassigned units
  const unassignedUnits = project.units.filter(u => u.modelId === null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-gray-900">إدارة مخططات ونماذج المشروع</h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">قراءة فقط حالياً</span>
          </div>
          <p className="text-sm text-gray-500">المشروع: <span className="font-bold text-gray-900">{project.name}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/crm/projects/${project.id}/edit`} className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors">
            تعديل المشروع
          </Link>
          <Link href="/crm/projects" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            العودة للمنتجات
          </Link>
        </div>
      </div>

      {/* Master Plan Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
          المخطط العام للمشروع
        </h2>
        
        {project.planImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-4xl aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-200 mb-4">
              <Image 
                src={project.planImage} 
                alt="مخطط المشروع العام" 
                fill 
                className="object-contain p-2"
              />
            </div>
            <a 
              href={project.planImage} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-[#D4AF37] text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              فتح المخطط
            </a>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-3 text-sm">لا يوجد مخطط عام مرفوع لهذا المشروع.</p>
            <Link href={`/crm/projects/${project.id}/edit`} className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-sm">
              إضافة المخطط من تبويب الوسائط في صفحة التعديل &larr;
            </Link>
          </div>
        )}
      </section>

      {/* Models Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          نماذج المشروع
        </h2>

        {project.models.length > 0 ? (
          <div className="space-y-6">
            {project.models.map((model) => (
              <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Model Header */}
                <div className="p-4 md:p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {model.planImage ? (
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden relative shrink-0">
                        <Image src={model.planImage} alt={model.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{model.name}</h3>
                        {model.code && <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold">{model.code}</span>}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-lg">{model.description || "لا يوجد وصف"}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600 font-medium">
                        {model.area && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>{model.area} م²</span>}
                        {model.rooms !== null && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>{model.rooms} غرف</span>}
                        {model.baths !== null && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>{model.baths} حمامات</span>}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-200">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold rounded-lg border border-blue-100">قريباً: تعديل النموذج</span>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">الوحدات: {model.units.length}</span>
                  </div>
                </div>

                {/* Model Units */}
                <div className="p-4 md:p-5 bg-white">
                  {model.units.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {model.units.map(unit => (
                        <div key={unit.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm text-gray-900">وحدة {unit.unitNum}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                              unit.status === 'SOLD' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {unit.status === 'AVAILABLE' ? 'متاح' : unit.status === 'SOLD' ? 'مباع' : 'محجوز'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 space-y-1">
                            {unit.price && <div className="text-[#D4AF37] font-bold mb-1">{unit.price.toLocaleString()} ر.س</div>}
                            <div className="flex justify-between"><span>النوع:</span> <span className="text-gray-800 font-medium">{unit.type || '-'}</span></div>
                            <div className="flex justify-between"><span>المساحة:</span> <span className="text-gray-800 font-medium">{unit.area ? `${unit.area} م²` : '-'}</span></div>
                            {unit.floor && <div className="flex justify-between"><span>الدور:</span> <span className="text-gray-800 font-medium">{unit.floor}</span></div>}
                            {unit.facade && <div className="flex justify-between"><span>الواجهة:</span> <span className="text-gray-800 font-medium">{unit.facade}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">لا توجد وحدات مرتبطة بهذا النموذج.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد نماذج مضافة</h3>
            <p className="text-gray-500 text-sm">سيتم تفعيل إضافة النماذج في المرحلة القادمة.</p>
          </div>
        )}
      </section>

      {/* Unassigned Units Section */}
      {unassignedUnits.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              وحدات غير مصنفة
            </h2>
            <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg border border-yellow-200 text-center">
              سيتم تفعيل ربط الوحدات بالنماذج لاحقاً
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">هذه الوحدات تم إضافتها سابقاً ولم يتم ربطها بنموذج محدد بعد. ({unassignedUnits.length} وحدة)</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 md:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {unassignedUnits.map(unit => (
                <div key={unit.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-center flex flex-col justify-between h-full hover:border-gray-300 transition-colors">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">وحدة {unit.unitNum}</h4>
                    {unit.type && <div className="text-[10px] text-gray-500 mb-2">{unit.type}</div>}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold mx-auto ${
                    unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    unit.status === 'SOLD' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {unit.status === 'AVAILABLE' ? 'متاح' : unit.status === 'SOLD' ? 'مباع' : 'محجوز'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
