import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import TrackedButton from "@/components/TrackedButton";
import ProjectViewTracker from "@/components/tracking/ProjectViewTracker";
import { getBaseMetadata } from "@/lib/seo";
import Image from "next/image";

function UnitCard({ unit }: { unit: any }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-3">
        <div>
          <h4 className="font-bold text-lg md:text-xl text-gray-900">وحدة {unit.unitNum}</h4>
          {unit.type && <p className="text-sm text-gray-500 mt-0.5">{unit.type}</p>}
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-sm ${
          unit.status === 'AVAILABLE' ? 'bg-[#25D366]/10 text-[#1ebd5b]' :
          unit.status === 'SOLD' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {unit.status === 'AVAILABLE' ? 'متاح' : unit.status === 'SOLD' ? 'مباع' : 'محجوز'}
        </span>
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
        {!!unit.area && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            <span className="text-xs md:text-sm font-bold">{unit.area} م²</span>
          </div>
        )}
        {!!unit.rooms && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-xs md:text-sm font-bold">{unit.rooms} غرف</span>
          </div>
        )}
        {!!unit.baths && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
            <span className="text-xs md:text-sm font-bold">{unit.baths} حمامات</span>
          </div>
        )}
        {!!unit.floor && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span className="text-xs md:text-sm font-bold">الدور {unit.floor}</span>
          </div>
        )}
        {!!unit.facade && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            <span className="text-xs md:text-sm font-bold">الواجهة {unit.facade}</span>
          </div>
        )}
      </div>
      
      {/* unitPlanImage */}
      {!!unit.unitPlanImage && (
        <div className="mb-4">
          <a href={unit.unitPlanImage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-gray-900 font-bold text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            عرض مخطط الوحدة
          </a>
        </div>
      )}

      {/* Price / Bottom Section */}
      {!!unit.price && (
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="text-xs md:text-sm text-gray-500 font-bold">السعر</span>
          <span className="font-black text-lg md:text-xl text-[#D4AF37]">
            {unit.price.toLocaleString()} ر.س
          </span>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = await prisma.project.findUnique({ where: { slug: slug } });
  if (!project) return getBaseMetadata();

  return getBaseMetadata({
    title: `${project.name} | مشاريعنا`,
    description: project.shortDesc || undefined,
    openGraph: project.mainImage ? { images: [project.mainImage] } : undefined,
  });
}

export default async function PublicProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = await prisma.project.findUnique({
    where: { slug: slug },
    include: { 
      models: {
        where: { isVisible: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          units: {
            orderBy: [{ sortOrder: 'asc' }, { unitNum: 'asc' }],
          }
        }
      },
      units: { where: { isVisible: true }, orderBy: [{ sortOrder: 'asc' }, { unitNum: 'asc' }] },
      features: { orderBy: { order: 'asc' } },
      warranties: { orderBy: { order: 'asc' } },
      galleryImages: { orderBy: { order: 'asc' } },
    },
  });
  
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

  if (!project || !project.isVisible) notFound();

  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return { label: "متاح", className: "bg-[#25D366] text-white border-white/20" };
      case "SOLD": return { label: "مباع", className: "bg-red-500 text-white border-white/20" };
      case "UNDER_CONSTRUCTION": return { label: "تحت الإنشاء", className: "bg-orange-500 text-white border-white/20" };
      case "COMING_SOON": return { label: "قريباً", className: "bg-blue-500 text-white border-white/20" };
      default: return { label: status || "غير محدد", className: "bg-gray-800 text-white border-white/20" };
    }
  };

  const statusObj = getStatusBadge(project.status || "");

  return (
    <div className="bg-[#fafafa] min-h-screen relative pb-20 lg:pb-12 font-sans selection:bg-[#D4AF37] selection:text-white">
      <ProjectViewTracker projectData={{ projectId: project.id, projectName: project.name }} />
      
      {/* Premium Hero Section - Brighter Gradient */}
      <div className="relative h-[60vh] lg:h-[70vh] bg-[#050505] overflow-hidden">
        {project.mainImage && (
          <Image 
            src={project.mainImage} 
            alt={project.name} 
            fill
            className="absolute inset-0 w-full h-full object-cover opacity-75" 
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent opacity-60"></div>
        
        {/* Top Navbar Offset (if any) or Back Button */}
        <div className="absolute top-20 right-6 lg:right-12 z-20">
           <Link href="/projects" className="inline-flex items-center gap-2 text-white hover:text-[#D4AF37] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all text-sm font-medium shadow-sm">
             <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
             الرجوع للمشاريع
           </Link>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col items-start relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border ${statusObj.className}`}>
                {statusObj.label}
              </span>
              {project.type && (
                <span className="px-4 py-1.5 bg-black/30 text-white backdrop-blur-md rounded-full text-xs font-bold border border-white/20 shadow-sm">
                  {project.type}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
              {project.name}
            </h1>
            
            <div className="flex items-center gap-2 text-base md:text-xl text-gray-100 drop-shadow-md mb-6">
              <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>{project.city} {project.neighborhood ? `- ${project.neighborhood}` : ''}</span>
            </div>

            {/* Hero Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="#interest-form" className="bg-[#D4AF37] hover:bg-[#b5952f] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm md:text-base">
                سجل اهتمامك
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
              </Link>
              {project.pdfUrl && (
                <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  تحميل البروفايل
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Desktop Layout: Main Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3 space-y-8 lg:space-y-10">
            
            {/* Quick Specs Grid (Premium Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {project.price && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">السعر يبدأ من</span>
                  <span className="text-sm md:text-base font-bold text-gray-900">{project.price.toLocaleString()} ر.س</span>
                </div>
              )}
              {project.area && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">المساحة</span>
                  <span className="text-sm md:text-base font-bold text-gray-900">{project.area} م²</span>
                </div>
              )}
              {project.rooms && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">الغرف</span>
                  <span className="text-sm md:text-base font-bold text-gray-900">{project.rooms}</span>
                </div>
              )}
              {project.baths && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">دورات المياه</span>
                  <span className="text-sm md:text-base font-bold text-gray-900">{project.baths}</span>
                </div>
              )}
              {/* Progress Card merged into specs if present */}
              {project.progressPercent !== null && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center col-span-2 lg:col-span-4">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">{project.progressLabel || "نسبة الإنجاز"}</span>
                    <span className="text-xl font-black text-gray-900">{project.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#D4AF37] h-full rounded-full transition-all duration-1000" style={{ width: `${project.progressPercent}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* About Product */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                عن المنتج العقاري
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 prose prose-sm md:prose-base text-gray-600 max-w-none leading-relaxed">
                {project.fullDesc ? (
                  <p className="whitespace-pre-wrap">{project.fullDesc}</p>
                ) : (
                  <p>{project.shortDesc || "لا يوجد وصف متوفر حالياً."}</p>
                )}
              </div>
            </section>

            {/* Master Plan */}
            {project.planImage && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                  مخطط المشروع العام
                </h2>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <p className="text-sm md:text-base text-gray-500 mb-6 text-center">
                    يوضح توزيع المشروع أو الوحدات الرئيسية
                  </p>
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-6">
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
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-[#D4AF37] text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    فتح المخطط
                  </a>
                </div>
              </section>
            )}

            {/* Gallery (Fixed Premium Grid) */}
            {project.galleryImages.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                  معرض الصور
                </h2>
                {project.galleryImages.length === 1 ? (
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image src={project.galleryImages[0].url} alt={project.galleryImages[0].alt || project.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {project.galleryImages.map((img, idx) => (
                      <div 
                        key={img.id} 
                        className={`relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 group shadow-sm ${
                          idx === 0 
                            ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' // Main image takes 2x2 area
                            : 'aspect-square' // Side images are squares
                        }`}
                      >
                        <Image 
                          src={img.url} 
                          alt={img.alt || project.name} 
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Features */}
            {project.features.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                  المميزات والمرافق
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map((feature) => (
                    <div key={feature.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#D4AF37] shrink-0 border border-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">{feature.title}</h4>
                        {feature.desc && <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{feature.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Warranties */}
            {project.warranties.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                  الضمانات
                </h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {project.warranties.map((warranty) => (
                      <div key={warranty.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-900 text-sm md:text-base">{warranty.title}</h4>
                             {warranty.desc && <p className="text-xs md:text-sm text-gray-500 mt-1">{warranty.desc}</p>}
                           </div>
                        </div>
                        {warranty.duration && (
                          <div className="text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-4 py-2 rounded-lg text-xs shrink-0 whitespace-nowrap self-start sm:self-auto">
                            {warranty.duration}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Models and Units */}
            {project.models && project.models.length > 0 ? (
              <>
                <section className="space-y-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                    نماذج المشروع والوحدات
                  </h2>
                  {project.models.map((model) => (
                    <div key={model.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                      {/* Model Header */}
                      <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {model.planImage && (
                          <div className="w-full md:w-48 aspect-[4/3] md:aspect-square relative rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                            <Image src={model.planImage} alt={`مخطط نموذج ${model.name}`} fill className="object-contain p-2" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                            {model.code && <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{model.code}</span>}
                            {model.status && (
                              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                model.status === 'AVAILABLE' ? 'bg-[#25D366]/10 text-[#1ebd5b]' :
                                model.status === 'SOLD' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {model.status === 'AVAILABLE' ? 'متاح' : model.status === 'SOLD' ? 'مباع' : 'محجوز'}
                              </span>
                            )}
                          </div>
                          {model.description && <p className="text-sm text-gray-500 mb-4">{model.description}</p>}
                          
                          <div className="flex flex-wrap items-center gap-4">
                            {!!model.area && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                {model.area} م²
                              </div>
                            )}
                            {!!model.rooms && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                {model.rooms} غرف
                              </div>
                            )}
                            {!!model.baths && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                                {model.baths} حمامات
                              </div>
                            )}
                            {model.units.length > 0 && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                {model.units.length} وحدة تابعة
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Model Units */}
                      {model.units.length > 0 && (
                        <div className="p-6 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {model.units.map((unit: any) => <UnitCard key={unit.id} unit={unit} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
                
                {/* Unassigned Units */}
                {project.units.filter(u => u.modelId === null).length > 0 && (
                  <section className="mt-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                      وحدات إضافية
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.units.filter(u => u.modelId === null).map((unit) => (
                        <UnitCard key={unit.id} unit={unit} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              project.units.length > 0 && (
                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                    الوحدات المتاحة
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.units.map(unit => (
                      <UnitCard key={unit.id} unit={unit} />
                    ))}
                  </div>
                </section>
              )
            )}

            {/* Location Button Only */}
            {project.googleMapsUrl && (
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    موقع المشروع
                  </h3>
                  {project.locationText && <p className="text-gray-500 text-sm">{project.locationText}</p>}
                </div>
                <a href={project.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-gray-900 hover:bg-[#D4AF37] text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2">
                  خرائط جوجل
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </section>
            )}

          </div>

          {/* Sidebar / Sticky Lead Form */}
          <div className="w-full lg:w-1/3" id="interest-form">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:sticky lg:top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-100 pb-3">سجل اهتمامك</h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">اترك بياناتك وسيتواصل معك مستشارنا العقاري قريباً.</p>
              
              <LeadForm projectId={project.id} projectSlug={project.slug} formType="PROJECT_SPECIFIC" />
              
              {settings?.whatsappNumber && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <TrackedButton 
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أنا مهتم بالمنتج العقاري: ${project.name}`)}`}
                    actionType="WHATSAPP"
                    targetContact={settings.whatsappNumber}
                    projectId={project.id}
                    className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm text-sm"
                  >
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    تواصل عبر واتساب
                  </TrackedButton>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Sticky Mobile Anchor for Interest Form - Quieter */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] flex justify-center">
        <Link href="#interest-form" className="w-full max-w-sm bg-gray-900 hover:bg-black text-white text-center font-bold py-3 rounded-lg shadow-sm transition-colors text-sm">
          سجل اهتمامك الآن
        </Link>
      </div>
    </div>
  );
}
