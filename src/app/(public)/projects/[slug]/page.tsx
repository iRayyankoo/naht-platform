import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import TrackedButton from "@/components/TrackedButton";
import ProjectViewTracker from "@/components/tracking/ProjectViewTracker";
import { getBaseMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = await prisma.project.findUnique({ where: { slug: slug } });
  if (!project) return getBaseMetadata();

  return getBaseMetadata({
    title: `${project.name} | مشاريعنا`,
    description: project.shortDesc || undefined,
    openGraph: project.mainImage ? { images: [project.mainImage] } : undefined,
  });
}

export default async function PublicProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = await prisma.project.findUnique({
    where: { slug: slug },
    include: { units: { where: { isVisible: true } } },
  });

  if (!project || !project.isVisible) notFound();

  return (
    <div className="bg-white min-h-screen relative pb-20 md:pb-0">
      <ProjectViewTracker projectData={{ projectId: project.id, projectName: project.name }} />
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-96 bg-gray-900">
        {project.mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.mainImage} alt={project.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 mt-10 md:mt-0">
            <span className="px-3 py-1 bg-primary text-white rounded-full text-xs md:text-sm font-bold mb-4 inline-block">{project.type}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">{project.name}</h1>
            <p className="text-lg md:text-xl text-gray-200">{project.city} - {project.neighborhood}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-10 md:space-y-12">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">عن المشروع</h2>
            <div className="prose prose-base md:prose-lg text-gray-600 max-w-none">
              <p>{project.shortDesc || "لا يوجد وصف حالياً."}</p>
              {project.fullDesc && <p className="mt-4">{project.fullDesc}</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">الوحدات السكنية</h2>
            {project.units.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">الوحدة</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">النوع</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">المساحة</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">الغرف</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.units.map(unit => (
                      <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{unit.unitNum}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-600 whitespace-nowrap">{unit.type}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-600 whitespace-nowrap">{unit.area} م²</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-600 whitespace-nowrap">{unit.rooms}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm whitespace-nowrap">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                            unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                            unit.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {unit.status === 'AVAILABLE' ? 'متاحة' : unit.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">لا توجد وحدات معروضة حالياً.</p>
            )}
          </section>
        </div>

        <div id="interest-form">
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 sticky top-24 border border-gray-100 shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">سجل اهتمامك</h3>
            <LeadForm projectId={project.id} projectSlug={project.slug} formType="PROJECT_SPECIFIC" />
            <div className="mt-6 pt-6 border-t border-gray-200">
              <TrackedButton 
                href={`https://wa.me/966500000000?text=${encodeURIComponent(`مرحباً، أنا مهتم بمشروع ${project.name}`)}`}
                actionType="WHATSAPP"
                targetContact="966500000000"
                projectId={project.id}
                className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                تواصل عبر واتساب
              </TrackedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Anchor for Interest Form */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link href="#interest-form" className="w-full max-w-sm bg-primary hover:bg-primary-dark text-white text-center font-bold py-3 rounded-md shadow-lg transition-colors">
          سجل اهتمامك الآن
        </Link>
      </div>
    </div>
  );
}
