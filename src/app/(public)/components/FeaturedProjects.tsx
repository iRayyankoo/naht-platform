import Link from "next/link";
import { Project } from "@prisma/client";

// ── Helpers ─────────────────────────────────────────────────────────
const statusLabel = (s: string) =>
  s === "AVAILABLE" ? "متاح" : s === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء";

const statusStyle = (s: string) =>
  s === "AVAILABLE"
    ? "bg-white/95 text-gray-900 shadow-sm"
    : s === "SOLD_OUT"
    ? "bg-gray-900/90 text-white shadow-sm"
    : "bg-brand-cafe/90 text-white shadow-sm";

const fmt = (n: number | null) =>
  n ? `ر.س ${n.toLocaleString("ar-SA")}` : null;

// ── Small Card (light) ───────────────────────────────────────────────
function SmallCard({ project }: { project: Project }) {
  const location = [project.city, project.neighborhood].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-40 xl:h-48 overflow-hidden bg-gray-50 shrink-0">
        {project.mainImage ? (
          <img
            src={project.mainImage}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 font-light tracking-widest uppercase text-xs">Naht</span>
          </div>
        )}
        <span className={`absolute top-3 right-3 text-[10px] sm:text-xs font-bold tracking-wide rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md ${statusStyle(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
        <p className="text-[10px] sm:text-xs text-brand-cafe font-bold tracking-widest uppercase">
          {project.type}{location ? ` • ${location}` : ""}
        </p>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-cafe transition-colors leading-tight">
          {project.name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-50">
          <div className="flex flex-col gap-0.5">
            {fmt(project.price) && (
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {fmt(project.price)}
              </span>
            )}
            {project.area && (
              <span className="text-[10px] sm:text-xs text-gray-500">{project.area} م²</span>
            )}
          </div>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-brand-cafe group-hover:border-brand-cafe group-hover:text-white transition-all text-gray-400 shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  const main = projects[0];
  const curated = projects.slice(1, 5);
  const mainLocation = [main.city, main.neighborhood].filter(Boolean).join(" • ");

  return (
    <section className="py-20 md:py-32 bg-[#F9F9F7]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-xs text-brand-cafe font-bold tracking-[0.2em] uppercase mb-3">
              Luxury Real Estate
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              المشاريع المختارة
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-brand-cafe border border-gray-200 hover:border-brand-cafe/30 bg-white px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            عرض جميع المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <Link
            href={`/projects/${main.slug}`}
            className="group lg:col-span-3 flex flex-col bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-full overflow-hidden bg-gray-50 shrink-0 lg:shrink">
              {main.mainImage ? (
                <img
                  src={main.mainImage}
                  alt={main.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl text-gray-300 font-light uppercase tracking-widest">Naht</span>
                </div>
              )}
              <span className={`absolute top-5 right-5 text-xs sm:text-sm font-bold tracking-wide rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm backdrop-blur-md ${statusStyle(main.status)}`}>
                {statusLabel(main.status)}
              </span>
            </div>

            <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-1 shrink-0">
              <p className="text-xs sm:text-sm text-brand-cafe font-bold tracking-widest uppercase mb-2">
                {main.type}{mainLocation ? ` • ${mainLocation}` : ""}
              </p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-brand-cafe transition-colors leading-tight">
                {main.name}
              </h3>

              <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4 sm:pt-6">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {fmt(main.price) && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">السعر يبدأ من</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-900">{fmt(main.price)}</p>
                    </div>
                  )}
                  {main.area && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">المساحة</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-900">{main.area} م²</p>
                    </div>
                  )}
                </div>

                <span className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-brand-cafe transition-colors">
                  عرض المشروع
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {curated.length > 0 && (
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
                {curated.map((p) => (
                  <SmallCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-10 md:hidden">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-gray-200 text-gray-900 font-bold text-sm rounded-full active:bg-gray-50 transition-colors"
          >
            عرض جميع المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
