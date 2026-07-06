import { prisma } from "@/lib/prisma";
import { getBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await prisma.aboutPageContent.findUnique({ where: { id: "global" } });
  return getBaseMetadata({
    title: content?.seoTitle || content?.title || "من نحن",
    description: content?.seoDescription || content?.shortDescription || undefined,
    openGraph: content?.mediaUrl ? { images: [content.mediaUrl] } : undefined,
  });
}

export default async function AboutPage() {
  const content = await prisma.aboutPageContent.findUnique({ where: { id: "global" } });

  return (
    <div>
      {/* Header */}
      <section className="bg-brand-cafe text-white py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">{content?.title || "من نحن"}</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-brand-offwhite">
            {content?.shortDescription || "نحت الأصول العقارية، نبني لك المستقبل"}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-lg text-gray-700 leading-relaxed space-y-8 whitespace-pre-line">
          {content?.fullDescription}
        </div>
      </section>

      {/* Vision & Mission */}
      {(content?.vision || content?.mission) && (
        <section className="py-16 md:py-20 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {content.vision && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 hover:border-brand-cafe/20 transition-all duration-300">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-cafe/10 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-brand-cafe" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-brand-cafe mb-4">رؤيتنا</h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">{content.vision}</p>
              </div>
            )}
            {content.mission && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 hover:border-brand-cafe/20 transition-all duration-300">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-coal/10 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-brand-coal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-brand-coal mb-4">رسالتنا</h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">{content.mission}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Values */}
      {content?.values && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-brand-cafe" />
              <h2 className="text-2xl md:text-3xl font-bold text-brand-cafe uppercase tracking-wider">قيمنا</h2>
              <span className="h-[1px] w-8 bg-brand-cafe" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {content.values.split("،").map((val, idx) => (
                <div key={idx} className="bg-brand-cafe/5 border border-brand-cafe/20 text-brand-cafe hover:bg-brand-cafe hover:text-white transition-colors px-6 py-3 rounded-full text-base md:text-lg font-bold">
                  {val.trim()}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Media & Stats */}
      {(content?.mediaUrl || content?.companyStats) && (
        <section className="py-20 bg-brand-coal text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-5"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cafe rounded-full blur-[100px] opacity-20"></div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-3xl font-bold mb-6">حقائق وأرقام</h2>
              <p className="text-xl text-gray-300 leading-relaxed whitespace-pre-line">{content.companyStats}</p>
            </div>
            {content.mediaUrl && (
              <div className="rounded-2xl overflow-hidden shadow-2xl h-80 relative bg-black">
                {content.mediaUrl.includes("youtube.com") || content.mediaUrl.includes("youtu.be") ? (
                  <iframe className="w-full h-full" src={content.mediaUrl} title="Company Video" allowFullScreen></iframe>
                ) : (
                  <img src={content.mediaUrl} alt="Company Media" className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
