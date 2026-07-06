import Link from "next/link";
import { Project } from "@prisma/client";

// ── Status helpers ──────────────────────────────────────────────────
const statusLabel = (s: string) =>
  s === "AVAILABLE" ? "متاح" : s === "SOLD_OUT" ? "مباع بالكامل" : "قيد الإنشاء";

const statusColor = (s: string) =>
  s === "AVAILABLE"
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
    : s === "SOLD_OUT"
    ? "bg-red-500/20 text-red-300 border-red-400/30"
    : "bg-amber-500/20 text-amber-300 border-amber-400/30";

// ── Price formatter ─────────────────────────────────────────────────
const fmt = (n: number | null) =>
  n ? `ر.س ${n.toLocaleString("ar-SA")}` : null;

// ── Small Card ──────────────────────────────────────────────────────
function SmallCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 hover:border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(212,175,55,0.12)]"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900 shrink-0">
        {project.mainImage ? (
          <img
            src={project.mainImage}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Status badge */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wider border rounded-full px-2.5 py-1 backdrop-blur-sm ${statusColor(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[11px] text-[#D4AF37]/70 font-semibold tracking-widest uppercase">
          {project.type} • {project.neighborhood || project.city}
        </p>
        <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-1">
          {project.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/8">
          {fmt(project.price) && (
            <span className="text-xs text-gray-300 font-medium">
              يبدأ من <span className="text-[#D4AF37] font-bold">{fmt(project.price)}</span>
            </span>
          )}
          {project.area && (
            <span className="text-xs text-gray-500">{project.area} م²</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  const main = projects[0];
  const curated = projects.slice(1, 5);

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Top gradient blend from hero */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-10" />

      {/* Subtle gold ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37]/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12 md:mb-16">
          <div>
            <p className="text-[11px] text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-3">
              NAHT REAL ESTATE
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              مشاريع مختارة بعناية
            </h2>
            <div className="w-12 h-[2px] bg-[#D4AF37] rounded-full mt-4 mb-3" />
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-lg">
              استعرض أبرز مشاريع نحت المتاحة والمميزة، مصممة لأعلى معايير الجودة والموقع.
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-[#D4AF37] hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-[#D4AF37]/10 whitespace-nowrap"
          >
            عرض جميع المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* ── Desktop: Signature + Grid | Mobile: full-width signature + scroll ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6">

          {/* Signature Card — spans 3 cols on desktop */}
          <Link
            href={`/projects/${main.slug}`}
            className="group lg:col-span-3 relative block rounded-3xl overflow-hidden bg-gray-900 border border-white/8 hover:border-[#D4AF37]/30 transition-all duration-700 hover:shadow-[0_24px_80px_rgba(212,175,55,0.15)]"
          >
            <div className="relative h-[60vw] md:h-[460px] lg:h-full min-h-[350px] max-h-[600px]">
              {main.mainImage ? (
                <img
                  src={main.mainImage}
                  alt={main.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-4xl text-gray-600 font-bold">{main.name.charAt(0)}</span>
                </div>
              )}
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent" />

              {/* Status badge */}
              <span className={`absolute top-5 right-5 text-xs font-bold tracking-wider border rounded-full px-3 py-1.5 backdrop-blur-md ${statusColor(main.status)}`}>
                {statusLabel(main.status)}
              </span>

              {/* Info panel */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[11px] text-[#D4AF37]/80 font-bold tracking-[0.25em] uppercase mb-2">
                  {main.type} • {main.neighborhood || main.city}
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-sm">
                  {main.name}
                </h3>
                {main.shortDesc && (
                  <p className="text-gray-300/80 text-sm line-clamp-2 mb-4 font-light leading-relaxed max-w-lg">
                    {main.shortDesc}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mb-5">
                  {fmt(main.price) && (
                    <span className="text-sm text-gray-300">
                      يبدأ من <span className="text-[#D4AF37] font-bold">{fmt(main.price)}</span>
                    </span>
                  )}
                  {main.area && (
                    <span className="text-sm text-gray-400">{main.area} م²</span>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors tracking-wide">
                  استعرض التفاصيل
                  <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Small Cards — desktop: vertical stack | mobile: horizontal scroll */}
          {curated.length > 0 && (
            <div className="lg:col-span-2">
              {/* Desktop 2-row vertical */}
              <div className="hidden lg:flex flex-col gap-5 h-full">
                {curated.slice(0, 4).map((p) => (
                  <SmallCard key={p.id} project={p} />
                ))}
              </div>

              {/* Mobile: horizontal scroll-snap */}
              <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">
                {curated.map((p) => (
                  <div key={p.id} className="flex-none w-[78vw] snap-center">
                    <SmallCard project={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: "View all" button */}
        <div className="mt-8 md:hidden">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-sm hover:bg-[#D4AF37]/10 transition-colors"
          >
            عرض جميع المشاريع
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>

      {/* Bottom gradient blend to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}

