import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return { label: "متاح", className: "bg-[#25D366]/90 text-white border-white/20" };
      case "SOLD": return { label: "مباع", className: "bg-red-500/90 text-white border-white/20" };
      case "UNDER_CONSTRUCTION": return { label: "تحت الإنشاء", className: "bg-orange-500/90 text-white border-white/20" };
      case "COMING_SOON": return { label: "قريباً", className: "bg-blue-500/90 text-white border-white/20" };
      default: return { label: status || "غير محدد", className: "bg-gray-800/90 text-white border-white/20" };
    }
  };

  const statusObj = getStatusBadge(project.status || "");

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/projects/${project.slug}`} className="relative aspect-[4/3] block overflow-hidden bg-gray-100">
        {project.mainImage ? (
          <Image 
            src={project.mainImage} 
            alt={project.name} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
            {project.name.charAt(0)}
          </div>
        )}
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border ${statusObj.className}`}>
            {statusObj.label}
          </span>
        </div>
        
        {/* Top left type */}
        {project.type && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-black/40 text-white backdrop-blur-md rounded-lg text-xs font-medium border border-white/10 shadow-sm">
              {project.type}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative z-10 bg-white">
        {/* Title & Location */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-[#D4AF37] mb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {project.city} {project.neighborhood ? `- ${project.neighborhood}` : ''}
          </div>
          <Link href={`/projects/${project.slug}`}>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors line-clamp-1">{project.name}</h3>
          </Link>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          {project.price && (
            <div className="flex flex-col bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">السعر</span>
              <span className="font-bold text-gray-900">{project.price.toLocaleString()} ر.س</span>
            </div>
          )}
          {project.area && (
            <div className="flex flex-col bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">المساحة</span>
              <span className="font-bold text-gray-900">{project.area} م²</span>
            </div>
          )}
          {project.rooms && (
            <div className="flex flex-col bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">الغرف</span>
              <span className="font-bold text-gray-900">{project.rooms}</span>
            </div>
          )}
          {project.baths && (
            <div className="flex flex-col bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">دورات المياه</span>
              <span className="font-bold text-gray-900">{project.baths}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed flex-1">
          {project.shortDesc || "لا يوجد وصف مختصر لهذا المنتج العقاري."}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-5 border-t border-gray-100">
          <Link 
            href={`/projects/${project.slug}`} 
            className="flex-1 text-center bg-[#050505] hover:bg-[#D4AF37] text-white hover:text-[#050505] font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
          >
            عرض التفاصيل
          </Link>
          <a 
            href={`/projects/${project.slug}#interest-form`}
            className="flex items-center justify-center w-[46px] h-[46px] bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl transition-colors border border-gray-200 shadow-sm"
            title="سجل اهتمامك"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
