import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";

interface ProjectCardProps {
  project: Project;
}

function formatProjectType(rawType: string | null | undefined): string {
  if (!rawType) return "فلل";
  const lower = rawType.toLowerCase().trim();
  if (lower.includes("villasfloors") || (lower.includes("فلل") && lower.includes("أدوار"))) return "فلل وأدوار";
  if (lower.includes("villa") || lower.includes("فلل") || lower.includes("فيلا")) return "فلل";
  if (lower.includes("floor") || lower.includes("أدوار") || lower.includes("دور")) return "أدوار";
  if (lower.includes("apartment") || lower.includes("شقق") || lower.includes("شقة")) return "شقق";
  if (lower.includes("townhouse") || lower.includes("تاون")) return "تاون هاوس";
  return rawType;
}

function formatProjectStatus(rawStatus: string | null | undefined) {
  const status = (rawStatus || "").toUpperCase().trim();
  if (status.includes("SOLD") || status.includes("مباع")) {
    return { label: "مباع", bg: "bg-[#585252]", text: "text-white" };
  }
  if (status.includes("SOON") || status.includes("قريباً") || status.includes("COMING")) {
    return { label: "قريباً", bg: "bg-[#ab9983]", text: "text-white" };
  }
  return { label: "متاح", bg: "bg-[#b9ba99]", text: "text-white" };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const badge = formatProjectStatus(project.status);
  const typeText = formatProjectType(project.type);
  const districtText = project.neighborhood && project.neighborhood.trim() ? project.neighborhood.trim() : "غير محدد";

  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <div className="project-card bg-white rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] flex flex-col w-full h-full overflow-hidden transition-shadow duration-300 hover:shadow-md">
        {/* Top Image Container - Exact 256px Height (16rem) */}
        <div className="relative w-full h-[256px] overflow-hidden bg-gray-100 shrink-0">
          {project.mainImage ? (
            <Image
              src={project.mainImage}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-[#a4845c] text-sm font-bold">نحت العقارية</span>
            </div>
          )}

          {/* Status Badge - Inset Exactly 32px (2rem) Top & Left */}
          <div className="absolute top-[32px] left-[32px] z-10">
            <span className={`${badge.bg} ${badge.text} text-sm font-semibold px-6 py-2 rounded-[32px] shadow-sm tracking-wide inline-block`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Project Content Container - Padding 24px (1.5rem) */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          {/* Title Area - h3 font-size 20px (1.25rem), margin-bottom 15px (0.9375rem) */}
          <div>
            <h3 className="text-xl font-bold text-[#4f4949] text-right mb-[15px] group-hover:text-[#a4845c] transition-colors leading-snug">
              {project.name}
            </h3>
          </div>

          {/* Lower Metadata & Link Section */}
          <div className="mt-auto">
            {/* Inline Details Metadata Row - gap 8px (0.5rem), margin 12px 0 (0.75rem), border-color rgba(166,147,124,0.2) */}
            <div className="flex items-center justify-between text-[13px] font-bold text-[#4f4949] py-[12px] border-y border-[#a6937c]/20 my-[12px] gap-2 whitespace-nowrap overflow-hidden w-full">
              {/* Right Side (RTL Start): Project Type */}
              <div className="flex items-center gap-1.5 shrink-0">
                <svg className="w-4 h-4 text-[#8c7862] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>
                  نوع المشروع: <span className="font-semibold text-[#4f4949]">{typeText}</span>
                </span>
              </div>

              {/* Left Side (RTL End): Address */}
              <div className="flex items-center gap-1.5 shrink-0">
                <svg className="w-4 h-4 text-[#8c7862] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  العنوان: <span className="font-semibold text-[#4f4949]">حي {districtText}</span>
                </span>
              </div>
            </div>

            {/* Bottom Link - font-size 14px (0.875rem), right aligned in RTL with left arrow ‹ */}
            <div className="flex items-center justify-start text-[#a4845c] font-bold text-sm group-hover:translate-x-[-2px] transition-transform">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#a4845c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span>عرض التفاصيل</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
