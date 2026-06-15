import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import TrackedButton from "@/components/TrackedButton";
import ProjectViewTracker from "@/components/tracking/ProjectViewTracker";
import { getBaseMetadata } from "@/lib/seo";

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
      units: { where: { isVisible: true } },
      features: { orderBy: { order: 'asc' } },
      warranties: { orderBy: { order: 'asc' } },
      galleryImages: { orderBy: { order: 'asc' } },
    },
  });
  
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

  if (!project || !project.isVisible) notFound();

  // Fetch related projects (same type or city, excluding current)
  const relatedProjects = await prisma.project.findMany({
    where: {
      isVisible: true,
      id: { not: project.id },
      OR: [
        { type: project.type },
        { city: project.city }
      ]
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-gray-50 min-h-screen relative pb-20 md:pb-0">
      <ProjectViewTracker projectData={{ projectId: project.id, projectName: project.name }} />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
        {project.mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.mainImage} alt={project.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <span className={`px-3 py-1 text-white rounded-full text-xs md:text-sm font-bold mb-4 inline-block ${
              project.status === "AVAILABLE" ? "bg-green-600" :
              project.status === "SOLD" ? "bg-red-600" :
              project.status === "UNDER_CONSTRUCTION" ? "bg-orange-600" :
              "bg-blue-600"
            }`}>
              {project.status === "AVAILABLE" ? "متاح للبيع" : 
               project.status === "SOLD" ? "مباع" : 
               project.status === "UNDER_CONSTRUCTION" ? "تحت الإنشاء" : "قريباً"}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">{project.name}</h1>
            <p className="text-xl md:text-2xl text-gray-200 drop-shadow-md">{project.type} &bull; {project.city} - {project.neighborhood}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 md:gap-12 items-center justify-between md:justify-start">
          {project.price && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">السعر</span>
              <span className="text-lg md:text-xl font-bold text-primary">{project.price.toLocaleString()} ر.س</span>
            </div>
          )}
          {project.area && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">المساحة</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">{project.area} م²</span>
            </div>
          )}
          {project.rooms && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">الغرف</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">{project.rooms}</span>
            </div>
          )}
          {project.baths && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">دورات المياه</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">{project.baths}</span>
            </div>
          )}
          <div className="md:ml-auto hidden md:block">
             <Link href="#interest-form" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md shadow-md transition-colors">
               سجل اهتمامك
             </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-12 md:space-y-16">
          
          {/* About Product */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              عن المنتج العقاري
            </h2>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-base md:prose-lg text-gray-600 max-w-none leading-relaxed">
              <p>{project.shortDesc || "لا يوجد وصف حالياً."}</p>
              {project.fullDesc && <p className="mt-4 whitespace-pre-wrap">{project.fullDesc}</p>}
            </div>
          </section>

          {/* Features */}
          {project.features.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                مميزات المنتج
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.features.map((feature) => (
                  <div key={feature.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{feature.title}</h4>
                      {feature.desc && <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Warranties */}
          {project.warranties.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                الضمانات
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {project.warranties.map((warranty) => (
                    <div key={warranty.id} className="p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{warranty.title}</h4>
                        {warranty.desc && <p className="text-sm text-gray-500 mt-1">{warranty.desc}</p>}
                      </div>
                      {warranty.duration && (
                        <div className="text-primary font-bold bg-primary/10 px-4 py-2 rounded-full text-sm shrink-0 whitespace-nowrap">
                          {warranty.duration}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Location & Progress */}
          {(project.googleMapsUrl || project.progressPercent !== null) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.progressPercent !== null && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{project.progressLabel || "نسبة الإنجاز"}</h3>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-4xl font-bold text-primary">{project.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div className="bg-primary h-3 rounded-full" style={{ width: `${project.progressPercent}%` }}></div>
                  </div>
                </div>
              )}
              {project.googleMapsUrl && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الموقع</h3>
                  {project.locationText && <p className="text-gray-600 mb-4 text-sm">{project.locationText}</p>}
                  <a href={project.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 font-medium py-3 px-4 rounded-lg transition-colors">
                    <svg className="w-5 h-5 ml-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    فتح في خرائط جوجل
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Gallery */}
          {project.galleryImages.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                معرض الصور
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.galleryImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 border border-gray-100 shadow-sm group">
                    <img src={img.url} alt={img.alt || project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PDF Download */}
          {project.pdfUrl && (
            <section>
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white text-center md:text-right">
                  <h3 className="text-2xl font-bold mb-2">ملف المنتج العقاري</h3>
                  <p className="text-gray-300">حمل الملف التعريفي للتعرف على كامل التفاصيل والمخططات.</p>
                </div>
                <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center whitespace-nowrap">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  تحميل الملف
                </a>
              </div>
            </section>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات عقارية قد تهمك</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map(rp => (
                  <Link key={rp.id} href={`/projects/${rp.slug}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                      {rp.mainImage && <img src={rp.mainImage} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1">{rp.name}</h4>
                      <p className="text-sm text-gray-500">{rp.city} - {rp.neighborhood}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar Lead Form */}
        <div id="interest-form" className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 md:p-8 sticky top-24 border border-gray-100 shadow-xl shadow-gray-200/50">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">سجل اهتمامك</h3>
            <p className="text-sm text-gray-500 mb-6">اترك بياناتك وسيتواصل معك مستشارنا العقاري في أقرب وقت.</p>
            <LeadForm projectId={project.id} projectSlug={project.slug} formType="PROJECT_SPECIFIC" />
            
            {settings?.whatsappNumber && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <TrackedButton 
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أنا مهتم بالمنتج العقاري: ${project.name}`)}`}
                  actionType="WHATSAPP"
                  targetContact={settings.whatsappNumber}
                  projectId={project.id}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  تواصل عبر واتساب
                </TrackedButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Anchor for Interest Form */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link href="#interest-form" className="w-full max-w-sm bg-primary hover:bg-primary-dark text-white text-center font-bold py-3 rounded-md shadow-lg transition-colors">
          سجل اهتمامك الآن
        </Link>
      </div>
    </div>
  );
}
