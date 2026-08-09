import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import UnitsClientView from "./UnitsClientView";

export const metadata = {
  title: "الوحدات العقارية المميزة | نحت العقارية",
  description: "استعرض أفضل شقق، فيلات، ودور سكني وتجاري متاحة للبيع والاستثمار لدى شركة نحت العقارية في الرياض والمملكة.",
};

interface UnitsPageProps {
  searchParams: Promise<{
    search?: string;
    city?: string;
    neighborhood?: string;
    type?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    page?: string;
  }>;
}

export default async function UnitsPage({ searchParams }: UnitsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1") || 1;
  const pageSize = 12;

  // Build filter condition
  const projectWhere: Prisma.ProjectWhereInput = {
    isVisible: true,
  };

  if (params.city) {
    projectWhere.city = params.city;
  }

  if (params.neighborhood) {
    projectWhere.neighborhood = params.neighborhood;
  }

  const where: Prisma.UnitWhereInput = {
    isVisible: true,
    project: projectWhere,
  };

  if (params.search) {
    where.OR = [
      { unitNum: { contains: params.search, mode: "insensitive" } },
      { type: { contains: params.search, mode: "insensitive" } },
      { project: { name: { contains: params.search, mode: "insensitive" } } },
      { project: { city: { contains: params.search, mode: "insensitive" } } },
      { project: { neighborhood: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  if (params.minArea || params.maxArea) {
    where.area = {};
    if (params.minArea) where.area.gte = parseFloat(params.minArea);
    if (params.maxArea) where.area.lte = parseFloat(params.maxArea);
  }

  const [units, totalCount, projects] = await Promise.all([
    prisma.unit.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            neighborhood: true,
            mainImage: true,
          },
        },
        model: {
          select: {
            name: true,
            planImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.unit.count({ where }),
    prisma.project.findMany({
      where: { isVisible: true },
      select: { city: true, neighborhood: true, type: true },
    }),
  ]);

  // Extract distinct filter options
  const cities = Array.from(new Set(projects.map((p) => p.city).filter(Boolean)));
  const neighborhoods = Array.from(new Set(projects.map((p) => p.neighborhood).filter(Boolean)));
  const unitTypes = Array.from(new Set(projects.map((p) => p.type).filter(Boolean)));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      {/* Header Banner */}
      <div className="bg-[#2A2624] text-white py-16 px-6 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cafe/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-brand-cafe/20 text-brand-gold text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-brand-gold/30">
            عروض عقارية حصريّة
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            الوحدات العقارية المتاحة
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg font-light">
            مجموعة مختارة من الفلل والشقق والأدوار السكنية والتجارية المصممة وفق أعلى معايير الجودة والمواصفات السعودية.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <UnitsClientView
          initialUnits={units}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          cities={cities}
          neighborhoods={neighborhoods}
          unitTypes={unitTypes}
          searchParams={params}
        />
      </div>
    </div>
  );
}
