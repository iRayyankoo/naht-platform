import { HomePageContent } from "@prisma/client";

// Fallback vision points — تُستخدم فقط عند فراغ CMS
const FALLBACK_VISION = [
  {
    num: "01",
    title: "إحياء التراث بلمسة عصرية",
    desc: "تنطلق نحت من عمق الهوية السعودية لتقديم مشاريع تجمع بين أصالة المعمار التراثي وجماليات التصميم الحديث، مساحات تعكس الانتماء وتصنع مستقبل البيئة العمرانية.",
  },
  {
    num: "02",
    title: "ريادة الاستثمار العقاري المستدام",
    desc: "نؤمن بأن الاستثمار الحقيقي يبدأ من الاختيار الصحيح للموقع، ولهذا نقدّم فرصاً استثمارية مدروسة تحقق عوائد متوازنة على المدى البعيد في أفضل المدن السعودية.",
  },
  {
    num: "03",
    title: "الرفاهية في أدقّ التفاصيل",
    desc: "الجودة في نحت ليست خياراً — هي التزام. نُعنى بكل تفصيل في التصميم الداخلي والخارجي لنقدّم مساحات معيشية راقية تستحق أن تُسمّى بيتاً.",
  },
];

export default function WhyChooseUs({ content }: { content: HomePageContent | null }) {
  // CMS له أولوية — fallback عند الفراغ
  const sectionTitle = content?.whyNahtTitle || "رؤيتنا في نحت";

  // نقاط الرؤية: دائماً من FALLBACK (مبرمجة)، CMS يمكن إضافة overrides مستقبلاً
  const visionPoints = FALLBACK_VISION;

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">

        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="text-[11px] text-brand-cafe font-bold tracking-[0.3em] uppercase mb-4">
            OUR VISION
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-950 leading-tight tracking-tight">
            {sectionTitle}
          </h2>
          <div className="w-16 h-[2px] bg-brand-cafe/60 rounded-full mx-auto mt-6" />
        </div>

        {/* Vision Points - Alternating Layout like reference */}
        <div className="flex flex-col gap-0">
          {visionPoints.map((point, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 min-h-[320px] md:min-h-[380px] ${
                  index < visionPoints.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Text side */}
                <div
                  className={`flex flex-col justify-center px-8 md:px-12 py-12 md:py-16 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <span
                    className="text-7xl md:text-8xl font-black text-gray-100 leading-none mb-6 block select-none"
                    dir="ltr"
                  >
                    {point.num}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-snug tracking-tight">
                    {point.title}
                  </h3>
                  <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg max-w-md">
                    {point.desc}
                  </p>
                </div>

                {/* Decorative side */}
                <div
                  className={`relative overflow-hidden bg-brand-offwhite min-h-[240px] ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  {/* Large number background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-[10rem] md:text-[14rem] font-black text-brand-cafe/10 leading-none select-none"
                      dir="ltr"
                    >
                      {point.num}
                    </span>
                  </div>

                  {/* Architectural SVG pattern */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <rect x="50" y="50" width="300" height="300" />
                      <rect x="80" y="80" width="240" height="240" />
                      <rect x="110" y="110" width="180" height="180" />
                      <line x1="200" y1="50" x2="200" y2="350" />
                      <line x1="50" y1="200" x2="350" y2="200" />
                      <circle cx="200" cy="200" r="80" />
                      <circle cx="200" cy="200" r="40" />
                      <path d="M140 280 L140 160 Q200 100 260 160 L260 280 Z" />
                    </svg>
                  </div>

                  {/* Corner accents */}
                  <div className={`absolute top-0 ${isEven ? "right-0" : "left-0"} w-24 h-24 bg-brand-cafe/10`} />
                  <div className={`absolute bottom-0 ${isEven ? "left-0" : "right-0"} w-16 h-16 bg-brand-pastel/20`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
