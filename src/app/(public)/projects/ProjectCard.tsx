import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";

interface ProjectCardProps {
  project: Project;
}

// ── Status helpers ───────────────────────────────────────────────────
const getStatusBadge = (status: string) => {
  switch (status) {
    case "AVAILABLE":        return { label: "متاح للحجز",    bg: "bg-emerald-500",  text: "text-white" };
    case "SOLD":             return { label: "مباع بالكامل", bg: "bg-red-500",       text: "text-white" };
    case "SOLD_OUT":         return { label: "مباع بالكامل", bg: "bg-red-500",       text: "text-white" };
    case "UNDER_CONSTRUCTION": return { label: "قيد الإنشاء", bg: "bg-amber-500",    text: "text-white" };
    case "COMING_SOON":      return { label: "قريباً",        bg: "bg-blue-500",     text: "text-white" };
    default:                 return { label: status || "غير محدد", bg: "bg-gray-500", text: "text-white" };
  }
};

// ── Component ────────────────────────────────────────────────────────
export default function ProjectCard({ project }: ProjectCardProps) {
  const badge = getStatusBadge(project.status || "");

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 flex flex-col hover:-translate-y-1">

      {/* ── Image ── */}
      <Link href={`/projects/${project.slug}`} className="relative aspect-[16/10] block overflow-hidden bg-gray-100 shrink-0">
        {project.mainImage ? (
          <Image
            src={project.mainImage}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-400" />

        {/* Status Badge — top right */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`${badge.bg} ${badge.text} text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md`}>
            {badge.label}
          </span>
        </div>

        {/* Type badge — top left */}
        {project.type && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/60">
              {project.type}
            </span>
          </div>
        )}
      </Link>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-brand-cafe font-semibold mb-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{project.city}{project.neighborhood ? ` — ${project.neighborhood}` : ""}</span>
        </div>

        {/* Project Name */}
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-lg font-bold text-brand-coal group-hover:text-brand-cafe transition-colors mb-3 leading-snug line-clamp-2">
            {project.name}
          </h3>
        </Link>

        {/* Short description */}
        {project.shortDesc && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 font-light">
            {project.shortDesc}
          </p>
        )}

        {/* ── Specs row ── */}
        <div className="flex flex-wrap gap-3 mb-5 mt-auto">
          {project.price && (
            <div className="flex flex-col bg-brand-offwhite px-3 py-2 rounded-lg border border-brand-cafe/20 min-w-[80px]">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">السعر</span>
              <span className="text-sm font-bold text-brand-coal">
                {project.price.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">ر.س</span>
              </span>
            </div>
          )}
          {project.area && (
            <div className="flex flex-col bg-brand-offwhite px-3 py-2 rounded-lg border border-brand-cafe/20 min-w-[80px]">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">المساحة</span>
              <span className="text-sm font-bold text-brand-coal">
                {project.area} <span className="text-[10px] font-normal text-gray-500">م²</span>
              </span>
            </div>
          )}
          {project.rooms && (
            <div className="flex flex-col bg-brand-offwhite px-3 py-2 rounded-lg border border-brand-cafe/20">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">الغرف</span>
              <span className="text-sm font-bold text-brand-coal">{project.rooms}</span>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            href={`/projects/${project.slug}`}
            className="flex items-center justify-center gap-2 w-full bg-brand-cafe hover:bg-brand-coal text-white font-bold py-3 px-4 transition-all duration-300 text-sm shadow-sm [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
          >
            عرض التفاصيل
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
