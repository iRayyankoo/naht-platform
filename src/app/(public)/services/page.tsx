import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getBaseMetadata({
    title: "خدماتنا | نحت العقارية",
    description: "اكتشف مجموعة الخدمات المتكاملة التي نقدمها في التطوير العقاري وإدارة الأملاك والتسويق الاستراتيجي.",
  });
}

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ 
    where: { isVisible: true }, 
    orderBy: { order: "asc" } 
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-brand-cafe text-white py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">خدماتنا المتميزة</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-brand-offwhite">
            حلول عقارية متكاملة لضمان نجاح استثماراتك وراحتك
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-cafe/20 transition-all group flex flex-col">
                <div className="flex items-center mb-6 md:mb-8">
                  {service.icon && (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-cafe/10 text-brand-cafe rounded-2xl flex items-center justify-center ml-4 md:ml-6 group-hover:bg-brand-cafe group-hover:text-white transition-colors" dangerouslySetInnerHTML={{__html: service.icon}} />
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{service.title}</h2>
                </div>
                
                <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 font-medium leading-relaxed">
                  {service.description}
                </p>
                
                {service.fullDescription && (
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed whitespace-pre-line mb-6 md:mb-8 flex-1">
                    {service.fullDescription}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-gray-100 mt-auto">
                  <Link href="/contact" className="text-brand-cafe font-bold hover:text-brand-coal flex items-center text-base md:text-lg transition-colors">
                    طلب الخدمة
                    <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </Link>
                  {service.slug && (
                    <span className="text-xs md:text-sm text-gray-400">#{service.slug}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-500">لا توجد خدمات متاحة حالياً</h2>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-brand-coal text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cafe rounded-full blur-[100px] opacity-20"></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">هل تبحث عن حل عقاري مخصص؟</h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 text-gray-300">فريقنا من الخبراء جاهز لتصميم الحل الأنسب لمتطلباتك الخاصة.</p>
          <Link href="/contact" className="w-full sm:w-auto inline-block bg-brand-cafe text-white hover:bg-white hover:text-brand-coal px-10 py-4 font-bold text-lg transition-colors shadow-lg [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]">
            تواصل مع المستشار العقاري
          </Link>
        </div>
      </section>
    </div>
  );
}
