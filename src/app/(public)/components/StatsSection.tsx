import { HomePageContent } from "@prisma/client";

// Fallback stats — تُستخدم فقط عند فراغ CMS
const FALLBACK_STATS = [
  { value: "+9",   label: "مشاريع" },
  { value: "+20",  label: "فرصة عقارية" },
  { value: "+100", label: "عميل ومهتم" },
];

export default function StatsSection({ content }: { content: HomePageContent | null }) {
  // بناء قائمة الإحصائيات — CMS له أولوية، fallback عند الفراغ
  const hasCmsStats =
    content?.stat1Value || content?.stat2Value || content?.stat3Value;

  const stats = hasCmsStats
    ? [
        content?.stat1Value ? { value: content.stat1Value, label: content.stat1Label || "" } : null,
        content?.stat2Value ? { value: content.stat2Value, label: content.stat2Label || "" } : null,
        content?.stat3Value ? { value: content.stat3Value, label: content.stat3Label || "" } : null,
      ].filter(Boolean) as { value: string; label: string }[]
    : FALLBACK_STATS;

  const sectionTitle =
    content?.statsTitle || "إنجازات تُبنى على الثقة";

  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-[#0D0D0D] text-white" dir="rtl">

      {/* Architectural silhouette overlay — decorative */}
      <div className="absolute inset-0 z-0 opacity-[0.07]">
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full" fill="currentColor">
          <rect x="0" y="400" width="1440" height="200" />
          <rect x="100" y="280" width="80" height="120" />
          <rect x="130" y="250" width="20" height="30" />
          <path d="M100 280 Q140 240 180 280" />
          <rect x="220" y="300" width="60" height="100" />
          <rect x="310" y="260" width="100" height="140" />
          <path d="M310 260 Q360 220 410 260" />
          <rect x="450" y="320" width="80" height="80" />
          <rect x="580" y="200" width="120" height="200" />
          <path d="M580 200 Q640 160 700 200" />
          <rect x="620" y="160" width="40" height="40" />
          <rect x="750" y="280" width="90" height="120" />
          <rect x="880" y="240" width="110" height="160" />
          <path d="M880 240 Q935 200 990 240" />
          <rect x="1040" y="300" width="70" height="100" />
          <rect x="1150" y="260" width="100" height="140" />
          <path d="M1150 260 Q1200 220 1250 260" />
          <rect x="1300" y="320" width="80" height="80" />
        </svg>
      </div>

      {/* Top accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cafe/40 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-8">

        {/* Title */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[11px] text-brand-cafe font-bold tracking-[0.3em] uppercase mb-4">
            OUR ACHIEVEMENTS
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            {sectionTitle}
          </h2>
          <div className="w-16 h-[2px] bg-brand-cafe/60 rounded-full mx-auto mt-6" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center py-8 md:py-12 px-6 ${
                i < stats.length - 1 ? "md:border-l md:border-white/10" : ""
              }`}
            >
              {/* Value */}
              <div
                className="text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-4 tracking-tighter text-white"
                dir="ltr"
              >
                <span className="text-brand-cafe">+</span>
                {stat.value.replace(/^\+/, "")}
              </div>
              <div className="w-8 h-[1px] bg-brand-cafe/60 mx-auto mb-4" />
              <p className="text-sm md:text-base text-gray-400 font-light tracking-widest uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cafe/30 to-transparent" />
    </section>
  );
}
