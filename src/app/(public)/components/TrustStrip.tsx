// TrustStrip.tsx — شريط ثقة محسّن بتصميم مرجع Rayyan
// خلفية عاجية ناعمة مع أيقونات مميزة

export default function TrustStrip() {
  const items = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "مشاريع سكنية مختارة",
      desc: "أراضٍ ومجمعات سكنية في أبرز المواقع",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "مواقع واعدة داخل المدن",
      desc: "انتقاء دقيق للأحياء الأكثر نمواً وقيمة",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "متابعة من فريق المبيعات",
      desc: "تواصل مباشر مع مستشار متخصص لكل عميل",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "جودة مضمونة وموثوقة",
      desc: "معايير بناء عالية وضمانات فعلية بعد التسليم",
    },
  ];

  return (
    <section className="bg-brand-offwhite border-y border-brand-cafe/15 py-10 md:py-14" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-right py-2 ${
                i < items.length - 1 ? 'md:border-l md:border-brand-cafe/20 md:pl-8' : ''
              }`}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-brand-cafe/20 flex items-center justify-center text-brand-cafe shrink-0 shadow-sm">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-coal mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
