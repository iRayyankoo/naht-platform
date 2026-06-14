import { HomePageContent } from "@prisma/client";

export default function WhyChooseUs({ content }: { content: HomePageContent | null }) {
  if (!content?.whyNahtTitle && !content?.whyNahtDescription) {
    return null;
  }

  const features = [
    { title: "مواقع مختارة", desc: "ننتقي أفضل المواقع الاستراتيجية لضمان قيمة استثمارية مستدامة." },
    { title: "مشاريع متنوعة", desc: "خيارات سكنية وتجارية تلبي مختلف التطلعات والاحتياجات." },
    { title: "جودة التنفيذ", desc: "نلتزم بأعلى معايير الجودة في جميع مراحل البناء والتطوير." },
    { title: "سهولة التواصل", desc: "فريق مبيعات احترافي وجاهز لخدمتكم على مدار الساعة." }
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="sticky top-24">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">{content.whyNahtTitle}</h2>
            <div className="w-16 h-[2px] bg-primary mb-8"></div>
            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line font-light">{content.whyNahtDescription}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="text-4xl font-bold text-gray-200 mb-4 font-serif group-hover:text-primary transition-colors duration-500">0{index + 1}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
