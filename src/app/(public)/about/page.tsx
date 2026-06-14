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
      <section className="bg-primary text-white py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">{content?.title || "من نحن"}</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-light">
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
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">رؤيتنا</h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">{content.vision}</p>
              </div>
            )}
            {content.mission && (
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">رسالتنا</h2>
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
            <h2 className="text-3xl font-bold text-primary mb-10">قيمنا</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {content.values.split("،").map((val, idx) => (
                <div key={idx} className="bg-primary/5 border border-primary/10 text-primary px-6 py-3 rounded-full text-lg font-bold">
                  {val.trim()}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Media & Stats */}
      {(content?.mediaUrl || content?.companyStats) && (
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">حقائق وأرقام</h2>
              <p className="text-xl text-gray-300 leading-relaxed">{content.companyStats}</p>
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
