/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";


function formatProjectName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.startsWith("مشروع ")) {
    return trimmed;
  }
  return `مشروع ${trimmed}`;
}

function formatUnitType(type?: string | null): string {
  if (!type || type === "???" || type.includes("?")) return "وحدة عقارية";
  return type;
}

export default async function FeaturedUnits() {
  const units = await prisma.unit.findMany({
    where: {
      isVisible: true,
      project: { isVisible: true },
    },
    include: {
      project: {
        select: {
          name: true,
          city: true,
          neighborhood: true,
          mainImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (!units || units.length === 0) return null;

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "السعر عند الطلب";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20 bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2 block">
              عقارات فاخرة جاهزة
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              أحدث الوحدات العقارية المتاحة
            </h2>
          </div>

          <Link
            href="/units"
            className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 group transition-colors"
          >
            استعراض كافة الوحدات العقارية
            <span className="group-hover:translate-x-[-4px] transition-transform">➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {units.map((unit) => {
            const cardImg = unit.unitPlanImage || unit.project.mainImage || "/placeholder-unit.jpg";

            return (
              <div
                key={unit.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-cafe/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cardImg}
                    alt={unit.unitNum}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-brand-cafe text-white text-xs font-bold px-3 py-1 rounded-full">
                    {formatUnitType(unit.type)}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg">
                    {unit.project.city} — حي {unit.project.neighborhood}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">وحدة رقم {unit.unitNum}</h3>
                    <p className="text-xs text-gray-400">{formatProjectName(unit.project.name)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center text-xs text-gray-300">
                    <div>
                      <span className="block font-bold text-white text-sm">{unit.area} م²</span>
                      <span>المساحة</span>
                    </div>
                    <div>
                      <span className="block font-bold text-white text-sm">{unit.rooms || "-"}</span>
                      <span>الغرف</span>
                    </div>
                    <div>
                      <span className="block font-bold text-white text-sm">{unit.baths || "-"}</span>
                      <span>الحمامات</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="block text-[10px] text-gray-400">السعر المطلوب</span>
                      <span className="text-base font-bold text-brand-gold">{formatPrice(unit.price)}</span>
                    </div>

                    <Link
                      href={`/units/${unit.id}`}
                      className="px-4 py-2 bg-white/10 hover:bg-brand-cafe text-white font-bold text-xs rounded-xl transition-all"
                    >
                      التفاصيل ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
