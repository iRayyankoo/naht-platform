"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@prisma/client";
import ProjectCard from "@/app/(public)/projects/ProjectCard";

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  if (!projects || projects.length === 0) return null;

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === "ALL") return true;
    const status = (p.status || "").toUpperCase();
    if (activeFilter === "AVAILABLE") return status === "AVAILABLE" || status === "متاح";
    if (activeFilter === "SOLD") return status === "SOLD" || status === "SOLD_OUT" || status === "مباع";
    if (activeFilter === "UPCOMING") return status.includes("SOON") || status.includes("قريباً");
    return true;
  });

  const filterTabs = [
    { key: "ALL", label: "الكل" },
    { key: "AVAILABLE", label: "متاح" },
    { key: "SOLD", label: "مباع" },
    { key: "UPCOMING", label: "قريباً" },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#3b3b3b] mb-4">
            المشاريع العقارية
          </h2>
          <p className="text-base text-[#4a4a4a] leading-relaxed font-light">
            استكشف مجموعة مشاريعنا السكنية المتميزة في أفضل أحياء مدينة الرياض.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                  isActive
                    ? "bg-[#3b3b3b] text-white border-[#3b3b3b] shadow-sm"
                    : "bg-white text-[#4a4a4a] border-gray-200 hover:border-[#a4845c]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Projects Grid with Unified ProjectCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#a4845c] hover:bg-[#8c6d48] text-white font-bold text-base transition-colors duration-200 shadow-sm"
          >
            <span>عرض كافة المشاريع ({projects.length})</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
