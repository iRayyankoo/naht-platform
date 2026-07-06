// ClientJourney.tsx — مسار العميل بخطوات واضحة

const steps = [
  {
    num: "01",
    title: "استعرض المشاريع",
    desc: "تصفّح مشاريعنا المتاحة واطّلع على التفاصيل الكاملة من الموقع والمساحة والسعر.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "اختر ما يناسبك",
    desc: "قارن بين المشاريع واختر الخيار الذي يتوافق مع احتياجاتك وميزانيتك.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "سجّل اهتمامك",
    desc: "أرسل استفساراً أو تواصل معنا عبر واتساب — فريقنا يرد بأسرع وقت.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "فريقنا يتابع معك",
    desc: "مستشار مبيعات مخصص يرافقك في كل خطوة حتى تجد المنزل أو الاستثمار المثالي.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function ClientJourney() {
  return (
    <section className="py-16 md:py-24 bg-[#F9F9F7]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[11px] text-primary font-bold tracking-[0.3em] uppercase mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 leading-tight tracking-tight mb-4">
            رحلتك مع نحت بخطوات واضحة
          </h2>
          <div className="w-12 h-[2px] bg-primary/60 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            من أول استعراض للمشروع حتى إتمام الصفقة — نحن معك في كل خطوة.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">

          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-10 right-[12.5%] left-[12.5%] h-[1px] bg-gray-200 z-0" />

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center text-center bg-brand-offwhite rounded-2xl border border-brand-cafe/20 p-6 md:p-8 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Step number */}
              <span className="text-xs font-black text-primary/40 tracking-[0.25em] mb-3 block">
                {step.num}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center text-primary mb-5 shrink-0">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-brand-coal mb-2 leading-snug">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-14">
          <a
            href="/projects"
            className="inline-flex items-center gap-2 bg-brand-cafe hover:bg-brand-coal text-white font-bold text-sm px-7 py-3.5 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.12)] [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
          >
            ابدأ باستعراض المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
