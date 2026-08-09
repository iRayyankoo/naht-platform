/* eslint-disable @next/next/no-img-element */
"use client";


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

// ── Small Card ───────────────────────────────────────────────────────
function SmallCard({ project }: { project: Project }) {
  const location = [project.city, project.neighborhood].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative flex-1 min-h-[150px] bg-gray-50 overflow-hidden">
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
        <span className={`absolute top-3 right-3 text-xs font-bold tracking-wide rounded-full px-3 py-1.5 backdrop-blur-md ${statusStyle(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>
      <div className="flex-none p-5 flex flex-col gap-2">
        <p className="text-xs text-brand-cafe font-bold tracking-widest uppercase line-clamp-1">
          {project.type}{location ? ` • ${location}` : ""}
        </p>
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-cafe transition-colors leading-tight">
          {project.name}
        </h3>
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
          <div className="flex flex-col gap-0.5">
            {fmt(project.price) && (
              <span className="text-sm font-bold text-gray-900">{fmt(project.price)}</span>
            )}
            {project.area && (
              <span className="text-xs text-gray-500">{project.area} م²</span>
            )}
          </div>
          <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-brand-cafe group-hover:border-brand-cafe group-hover:text-white transition-all text-gray-400 shrink-0">
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function NewFeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  const main = projects[0];
  const sideProjects = projects.slice(1, 3);
  const mainLocation = [main.city, main.neighborhood].filter(Boolean).join(" • ");

  return (
    <section id="projects" className="py-20 md:py-32 bg-[#F9F9F7]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">

        {/* Header */}
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

        {/* Grid: Main + Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">

          {/* Main Card */}
          <Link
            href={`/projects/${main.slug}`}
            className="group lg:col-span-8 flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="relative flex-1 min-h-[250px] overflow-hidden bg-gray-50">
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
              <span className={`absolute top-5 right-5 text-sm font-bold tracking-wide rounded-full px-4 py-2 shadow-sm backdrop-blur-md ${statusStyle(main.status)}`}>
                {statusLabel(main.status)}
              </span>
            </div>

            <div className="flex-none p-6 md:p-8">
              <p className="text-sm text-brand-cafe font-bold tracking-widest uppercase mb-2">
                {main.type}{mainLocation ? ` • ${mainLocation}` : ""}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-brand-cafe transition-colors leading-tight">
                {main.name}
              </h3>
              <div className="flex items-end justify-between border-t border-gray-100 pt-6">
                <div className="flex flex-wrap items-center gap-6">
                  {fmt(main.price) && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">السعر يبدأ من</p>
                      <p className="text-lg font-bold text-gray-900">{fmt(main.price)}</p>
                    </div>
                  )}
                  {main.area && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">المساحة</p>
                      <p className="text-lg font-bold text-gray-900">{main.area} م²</p>
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-brand-cafe transition-colors">
                  عرض المشروع
                  <svg className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Side Cards */}
          {sideProjects.length > 0 && (
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
              {sideProjects.map((p) => (
                <SmallCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-gray-200 text-gray-900 font-bold text-sm rounded-full transition-colors"
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
