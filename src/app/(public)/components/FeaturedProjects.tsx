import Link from "next/link";
import { Project } from "@prisma/client";

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  const mainProject = projects[0];
  const curatedProjects = projects.slice(1, 5); // Take up to 4 curated projects

  return (
    <section className="py-24 md:py-32 bg-[#F9F9F7] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-950 mb-6 tracking-tight font-serif leading-tight">المشاريع<br className="hidden md:block"/> المختارة</h2>
            <div className="w-16 h-[2px] bg-primary/70 mb-8 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed">
              انتقاء حصري لأرقى مشاريعنا، تعكس شغفنا بالتفاصيل وروعة التصميم المعماري الحديث في أفضل المواقع.
            </p>
          </div>
          <Link href="/projects" className="hidden md:inline-flex items-center gap-4 text-gray-950 hover:text-primary font-bold transition-all group uppercase tracking-widest pb-2 opacity-80 hover:opacity-100">
            <span className="border-b border-gray-300/50 group-hover:border-primary pb-1 transition-colors">عرض المجموعة كاملة</span>
            <svg className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:-translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>

        {/* The Signature Project (Editorial Style) */}
        <div className="mb-20 md:mb-32">
          <Link href={`/projects/${mainProject.slug}`} className="group block relative w-full h-[60vh] md:h-[80vh] overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            {mainProject.mainImage ? (
              <img 
                src={mainProject.mainImage} 
                alt={mainProject.name} 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center transition-transform duration-[2s] ease-out group-hover:scale-105">
                <span className="text-4xl text-gray-400 font-serif opacity-50">{mainProject.name}</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent"></div>
            
            {/* Floating Information Panel */}
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-auto bg-white/10 backdrop-blur-2xl border border-white/10 p-8 md:p-10 max-w-xl text-white transform transition-all duration-700 group-hover:translate-y-[-10px] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-gray-300/90 mb-4 tracking-widest uppercase">
                <span>{mainProject.type}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
                <span>{mainProject.neighborhood || mainProject.city}</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-serif drop-shadow-sm">{mainProject.name}</h3>
              <p className="text-gray-200/90 font-light line-clamp-2 md:line-clamp-3 mb-8 leading-relaxed">
                {mainProject.shortDesc}
              </p>
              <div className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-white/90 group-hover:text-primary transition-colors">
                استعرض التفاصيل
                <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/95 backdrop-blur-md text-gray-950 px-6 py-2.5 text-xs font-bold tracking-widest uppercase shadow-xl rounded-full">
              {mainProject.status === "AVAILABLE" ? "متاح" : mainProject.status === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء"}
            </div>
          </Link>
        </div>

        {/* Curated Collection (Horizontal Mobile Carousel / Desktop Grid) */}
        {curatedProjects.length > 0 && (
          <div className="relative">
            {/* Hide scrollbar but keep functionality for mobile */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
              {curatedProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group flex-none w-[85vw] md:w-auto snap-center">
                  <div className="relative h-[450px] md:h-[500px] overflow-hidden rounded-3xl bg-gray-100 mb-6 shadow-sm group-hover:shadow-xl transition-shadow duration-700">
                    {project.mainImage ? (
                      <img 
                        src={project.mainImage} 
                        alt={project.name} 
                        className="w-full h-full object-cover transition-all duration-[1.5s] ease-out filter sepia-[0.05] contrast-[1.05] group-hover:scale-105 group-hover:sepia-0" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-transform duration-[1.5s] ease-out group-hover:scale-105">
                        <span className="text-2xl text-gray-400 font-serif opacity-50">{project.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                  </div>
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                        {project.type}
                      </div>
                      <div className={`text-xs font-bold tracking-widest uppercase ${project.status === 'AVAILABLE' ? 'text-primary/90' : 'text-gray-400/80'}`}>
                        {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD_OUT" ? "مباع" : "تحت الإنشاء"}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950 mb-2 font-serif group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-sm text-gray-500/80 font-light truncate">{project.neighborhood || project.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-6 md:hidden">
          <Link href="/projects" className="inline-flex items-center justify-center w-full gap-3 bg-white text-gray-950 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-full px-8 py-5 font-bold tracking-widest uppercase transition-all hover:-translate-y-1">
            عرض كل المشاريع
          </Link>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
