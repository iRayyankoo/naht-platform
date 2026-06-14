import { HomePageContent } from "@prisma/client";

export default function StatsSection({ content }: { content: HomePageContent | null }) {
  if (!content?.stat1Value && !content?.stat2Value && !content?.stat3Value) {
    return null;
  }

  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
          <div className="md:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {content.statsTitle || "أرقام تلخص مسيرتنا"}
            </h2>
            <div className="w-12 h-1 bg-primary mt-6"></div>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {content.stat1Value && (
              <div className="text-center sm:text-right border-r-0 sm:border-r-2 border-gray-100 pr-0 sm:pr-8">
                <div className="text-5xl md:text-7xl font-bold text-gray-900 mb-2 font-serif tracking-tighter" dir="ltr">{content.stat1Value}</div>
                <div className="text-lg font-bold text-gray-400 tracking-wide">{content.stat1Label}</div>
              </div>
            )}
            {content.stat2Value && (
              <div className="text-center sm:text-right border-r-0 sm:border-r-2 border-gray-100 pr-0 sm:pr-8">
                <div className="text-5xl md:text-7xl font-bold text-gray-900 mb-2 font-serif tracking-tighter" dir="ltr">{content.stat2Value}</div>
                <div className="text-lg font-bold text-gray-400 tracking-wide">{content.stat2Label}</div>
              </div>
            )}
            {content.stat3Value && (
              <div className="text-center sm:text-right">
                <div className="text-5xl md:text-7xl font-bold text-gray-900 mb-2 font-serif tracking-tighter" dir="ltr">{content.stat3Value}</div>
                <div className="text-lg font-bold text-gray-400 tracking-wide">{content.stat3Label}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
