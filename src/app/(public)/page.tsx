import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TrackedButton from "@/components/TrackedButton";
import { getBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  return getBaseMetadata({
    title: content?.heroTitle ? `${content.heroTitle} | الرئيسية` : undefined,
    description: content?.heroSubtitle || undefined,
    openGraph: content?.heroBackgroundImage ? { images: [content.heroBackgroundImage] } : undefined,
  });
}

export default async function HomePage() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  const featuredProjects = await prisma.project.findMany({ where: { isVisible: true, isFeatured: true }, take: 3 });
  const services = await prisma.service.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 4 });
  const faqs = await prisma.faq.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white min-h-[90vh] md:min-h-[80vh] flex items-center pt-16 md:pt-0">
        {content?.heroBackgroundImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={content.heroBackgroundImage} alt="Hero Background" className="w-full h-full object-cover opacity-40" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16 md:py-20 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 max-w-3xl leading-tight">
            {content?.heroTitle || "نحت الأصول العقارية"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-2xl text-gray-200">
            {content?.heroSubtitle || "نبني مستقبل الإسكان بأعلى معايير الجودة"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href={content?.ctaButtonUrl || "/projects"} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-md font-bold text-lg text-center transition-colors shadow-lg">
              {content?.ctaButtonText || "تصفح مشاريعنا"}
            </Link>
            <Link href="/about" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-md font-bold text-lg text-center transition-colors">
              اكتشف المزيد عنا
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(content?.stat1Value || content?.stat2Value || content?.stat3Value) && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            {content.statsTitle && <h2 className="text-3xl font-bold text-center mb-12 text-primary">{content.statsTitle}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {content.stat1Value && (
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <div className="text-5xl font-black text-secondary mb-2" dir="ltr">{content.stat1Value}</div>
                  <div className="text-lg font-medium text-gray-600">{content.stat1Label}</div>
                </div>
              )}
              {content.stat2Value && (
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <div className="text-5xl font-black text-secondary mb-2" dir="ltr">{content.stat2Value}</div>
                  <div className="text-lg font-medium text-gray-600">{content.stat2Label}</div>
                </div>
              )}
              {content.stat3Value && (
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <div className="text-5xl font-black text-secondary mb-2" dir="ltr">{content.stat3Value}</div>
                  <div className="text-lg font-medium text-gray-600">{content.stat3Label}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About Brief Section */}
      {(content?.aboutBriefTitle || content?.aboutBriefText) && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{content.aboutBriefTitle}</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8 whitespace-pre-line">{content.aboutBriefText}</p>
              <Link href="/about" className="text-secondary font-bold hover:underline flex items-center">
                اقرأ المزيد عن شركتنا
                <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
            {content.aboutBriefImage && (
              <div className="rounded-2xl overflow-hidden shadow-xl h-96 relative">
                <img src={content.aboutBriefImage} alt="About Us" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services Preview */}
      {services.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">خدماتنا المتميزة</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">نقدم حلولاً عقارية متكاملة تلبي كافة احتياجاتك بأعلى معايير الاحترافية.</p>
            </div>
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 snap-x snap-mandatory md:pb-0 md:snap-none hide-scrollbar">
              {services.map(service => (
                <div key={service.id} className="min-w-[85vw] md:min-w-0 flex-shrink-0 snap-center bg-white border border-gray-100 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-shadow group">
                  {service.icon && (
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary group-hover:text-white transition-colors" dangerouslySetInnerHTML={{__html: service.icon}} />
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{service.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 line-clamp-3">{service.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/services" className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md font-bold transition-colors">
                عرض كافة الخدمات
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-8 md:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-4">مشاريعنا المميزة</h2>
                <p className="text-lg md:text-xl text-gray-600">اكتشف أحدث مشاريعنا المصممة لأسلوب حياة عصري.</p>
              </div>
              <Link href="/projects" className="hidden md:inline-block border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-6 py-2 rounded-md font-bold transition-colors">
                كل المشاريع
              </Link>
            </div>
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-6 snap-x snap-mandatory md:pb-0 md:snap-none hide-scrollbar">
              {featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="min-w-[85vw] md:min-w-0 flex-shrink-0 snap-center group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all block">
                  <div className="relative h-56 md:h-64 bg-gray-200">
                    <img src={project.mainImage || "https://placehold.co/600x400/png"} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-primary shadow">
                      {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء"}
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{project.shortDesc}</p>
                    <div className="flex items-center text-secondary font-bold text-sm md:text-base">
                      التفاصيل <svg className="w-4 h-4 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6 md:hidden">
              <Link href="/projects" className="inline-block w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-6 py-3 rounded-md font-bold transition-colors">
                عرض كل المشاريع
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Naht Section */}
      {(content?.whyNahtTitle || content?.whyNahtDescription) && (
        <section className="py-24 bg-primary text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">{content.whyNahtTitle}</h2>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-200 whitespace-pre-line">{content.whyNahtDescription}</p>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-16">الأسئلة الشائعة</h2>
            <div className="space-y-6">
              {faqs.map(faq => (
                <div key={faq.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start">
                    <span className="text-secondary ml-3 text-2xl leading-none">؟</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mr-8">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
