import Link from "next/link";
import { Project } from "@prisma/client";

// ── Helpers ─────────────────────────────────────────────────────────
const statusLabel = (s: string) =>
  s === "AVAILABLE" ? "متاح" : s === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء";

const statusStyle = (s: string) =>
  s === "AVAILABLE"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : s === "SOLD_OUT"
    ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";

const fmt = (n: number | null) =>
  n ? `ر.س ${n.toLocaleString("ar-SA")}` : null;

// ── Small Card (light) ───────────────────────────────────────────────
function SmallCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-50 shrink-0">
        {project.mainImage ? (
          <img
            src={project.mainImage}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 ${statusStyle(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] text-primary/80 font-bold tracking-widest uppercase">
          {project.type} • {project.neighborhood || project.city}
        </p>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
          {project.name}
        </h3>
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 flex-wrap">
          {fmt(project.price) && (
            <span className="text-xs text-gray-500">
              من <span className="text-primary font-bold">{fmt(project.price)}</span>
            </span>
          )}
          {project.area && (
            <span className="text-xs text-gray-400">{project.area} م²</span>
          )}
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

  return (
    <section className="py-16 md:py-24 bg-[#F9F9F7] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 md:mb-14">
          <div>
            <p className="text-[11px] text-brand-cafe font-bold tracking-[0.3em] uppercase mb-2">
              NAHT REAL ESTATE
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-950 leading-tight tracking-tight">
              المشاريع المختارة
            </h2>
            <div className="w-12 h-[2px] bg-brand-cafe/60 rounded-full mt-4 mb-3" />
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-lg">
              انتقاء حصري لأبرز مشاريعنا، تجمع بين التصميم المعماري الراقي وأفضل المواقع الاستراتيجية.
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-brand-coal hover:text-brand-cafe border border-brand-cafe/20 hover:border-brand-cafe/40 px-5 py-2.5 transition-all duration-300 hover:bg-brand-cafe/5 whitespace-nowrap [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
          >
            عرض جميع المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* ── Desktop: Signature (3/5) + Cards column (2/5) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Signature Card */}
          <Link
            href={`/projects/${main.slug}`}
            className="group lg:col-span-3 relative block rounded-3xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-[0_16px_56px_rgba(0,0,0,0.12)] transition-all duration-500"
          >
            <div className="relative h-[58vw] md:h-[500px] lg:h-full min-h-[380px] max-h-[620px]">
              {main.mainImage ? (
                <img
                  src={main.mainImage}
                  alt={main.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-400 font-bold">{main.name.charAt(0)}</span>
                </div>
              )}

              {/* Soft gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/10 to-transparent" />

              {/* Status badge */}
              <span className={`absolute top-5 right-5 text-xs font-bold tracking-wide rounded-full px-3 py-1.5 ${statusStyle(main.status)}`}>
                {statusLabel(main.status)}
              </span>

              {/* Info panel at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[11px] text-brand-cafe font-bold tracking-[0.25em] uppercase mb-2">
                  {main.type} • {main.neighborhood || main.city}
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight drop-shadow">
                  {main.name}
                </h3>
                {main.shortDesc && (
                  <p className="text-gray-200/85 text-sm line-clamp-2 mb-4 font-light leading-relaxed max-w-lg">
                    {main.shortDesc}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mb-5">
                  {fmt(main.price) && (
                    <span className="text-sm text-gray-200">
                      يبدأ من <span className="text-brand-cafe font-bold">{fmt(main.price)}</span>
                    </span>
                  )}
                  {main.area && (
                    <span className="text-sm text-gray-300">{main.area} م²</span>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white/90 group-hover:text-brand-cafe transition-colors tracking-wide">
                  استعرض التفاصيل
                  <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Small Cards Column */}
          {curated.length > 0 && (
            <div className="lg:col-span-2">
              {/* Desktop: vertical stack filling full height */}
              <div className="hidden lg:flex flex-col gap-4 h-full">
                {curated.slice(0, 4).map((p) => (
                  <SmallCard key={p.id} project={p} />
                ))}
              </div>

              {/* Mobile: 2-column grid for better use of space */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                {curated.map((p) => (
                  <SmallCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-8 md:hidden">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-brand-cafe/20 text-brand-coal font-bold text-sm hover:border-brand-cafe/40 hover:text-brand-cafe hover:bg-brand-cafe/5 transition-colors [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
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
