import { HomePageContent } from "@prisma/client";

export default function StatsSection({ content }: { content: HomePageContent | null }) {
  const hasCmsStats = Boolean(
    content?.stat1Value || content?.stat2Value || content?.stat3Value
  );

  if (!hasCmsStats) return null;

  const stats = [
    content?.stat1Value ? { value: content.stat1Value, label: content.stat1Label || "" } : null,
    content?.stat2Value ? { value: content.stat2Value, label: content.stat2Label || "" } : null,
    content?.stat3Value ? { value: content.stat3Value, label: content.stat3Label || "" } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  const sectionTitle = content?.statsTitle || "إنجازات نحت العقارية";

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[#4F4949] text-white" dir="rtl">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {sectionTitle}
          </h2>
          <div className="w-16 h-0.5 bg-[#A6937C] mx-auto mt-4" />
        </div>

        <div className={`grid grid-cols-1 ${stats.length === 1 ? "max-w-md mx-auto" : stats.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-3"} gap-8`}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center py-6 px-4 ${
                i < stats.length - 1 ? "sm:border-l sm:border-white/10" : ""
              }`}
            >
              <div className="text-5xl md:text-6xl font-black leading-none mb-3 text-[#A6937C]" dir="ltr">
                {stat.value}
              </div>
              <p className="text-sm text-[#F7F3EB]/80 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
