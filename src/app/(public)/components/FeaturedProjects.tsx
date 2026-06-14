import Link from "next/link";
import { Project } from "@prisma/client";

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  const mainProject = projects[0];
  const otherProjects = projects.slice(1, 5); // Up to 4 other projects

  return (
    <section className="py-32 bg-[#FAFAFA]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight font-serif">المشاريع المميزة</h2>
            <div className="w-24 h-[2px] bg-primary mb-8"></div>
            <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed">
              مختارات من أحدث مشاريعنا المصممة بعناية لتقديم أسلوب حياة استثنائي في أرقى المواقع الجغرافية.
            </p>
          </div>
          <Link href="/projects" className="hidden md:inline-flex items-center gap-4 text-gray-900 hover:text-primary font-bold transition-colors group uppercase tracking-widest pb-2">
            <span className="border-b border-gray-300 group-hover:border-primary pb-1 transition-colors">استكشف جميع المشاريع</span>
            <svg className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:-translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>

        {/* Main Featured Project - Massive Portfolio Style */}
        <Link href={`/projects/${mainProject.slug}`} className="group block mb-12 relative overflow-hidden bg-gray-900">
          <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden">
            <img 
              src={mainProject.mainImage || "https://placehold.co/1600x900/111111/333333?text=Project"} 
              alt={mainProject.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90" 
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="text-white max-w-4xl">
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-bold tracking-widest text-gray-300 uppercase">
                  <span>{mainProject.type}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                  <span>{mainProject.city}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                  <span className={
                    mainProject.status === "AVAILABLE" ? "text-white" : 
                    mainProject.status === "SOLD_OUT" ? "text-gray-400" : "text-white"
                  }>
                    {mainProject.status === "AVAILABLE" ? "متاح" : mainProject.status === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء"}
                  </span>
                </div>
                <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none drop-shadow-lg">{mainProject.name}</h3>
                <p className="text-xl md:text-2xl text-gray-300 line-clamp-2 md:line-clamp-3 font-light max-w-3xl leading-relaxed">{mainProject.shortDesc}</p>
              </div>
              <div className="hidden md:flex shrink-0 w-20 h-20 bg-white items-center justify-center text-gray-900 group-hover:bg-primary group-hover:text-white transition-all duration-500 hover:scale-110">
                <svg className="w-8 h-8 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Other Featured Projects - Sleek Grid */}
        {otherProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {otherProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-gray-100 mb-8">
                  <img 
                    src={project.mainImage || "https://placehold.co/800x800/111111/333333?text=Project"} 
                    alt={project.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out grayscale-[20%] group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
                  <div className="absolute top-6 right-6 bg-white px-5 py-2 text-xs font-bold text-gray-900 tracking-widest uppercase shadow-xl">
                    {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD_OUT" ? "مباع" : "تحت الإنشاء"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-400 mb-3 tracking-widest uppercase">
                    <span>{project.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{project.neighborhood}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors tracking-tight">{project.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-16 md:hidden">
          <Link href="/projects" className="inline-flex items-center justify-center w-full gap-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-5 font-bold tracking-widest uppercase transition-colors">
            عرض كل المشاريع
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
