import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatUnitType, formatProjectName } from "@/lib/contact-helpers";
import UnitDetailClientView from "./UnitDetailClientView";

interface UnitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: UnitDetailPageProps) {
  const resolvedParams = await params;
  const unit = await prisma.unit.findUnique({
    where: { id: resolvedParams.id },
    include: { project: true },
  });

  if (!unit) return { title: "الوحدة غير موجودة | نحت العقارية" };

  const unitTypeLabel = formatUnitType(unit.type);
  const formattedProjectName = formatProjectName(unit.project.name);

  return {
    title: `وحدة رقم ${unit.unitNum} - ${unitTypeLabel} في ${unit.project.city} | نحت العقارية`,
    description: `تفاصيل وحدة رقم ${unit.unitNum} بمساحة ${unit.area} م² في ${formattedProjectName} بحي ${unit.project.neighborhood} - ${unit.project.city}.`,
  };
}


export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const resolvedParams = await params;
  const unit = await prisma.unit.findUnique({
    where: { id: resolvedParams.id },
    include: {
      project: {
        include: {
          features: true,
          warranties: true,
          galleryImages: true,
        },
      },
      model: true,
    },
  });

  if (!unit || !unit.isVisible) {
    notFound();
  }

  // Fetch similar units from the same project or city
  const similarUnits = await prisma.unit.findMany({
    where: {
      isVisible: true,
      id: { not: unit.id },
      OR: [
        { projectId: unit.projectId },
        { project: { city: unit.project.city } },
      ],
    },
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
    },

    take: 3,
  });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-cafe">الرئيسية</Link>
          <span>/</span>
          <Link href="/units" className="hover:text-brand-cafe">الوحدات العقارية</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">وحدة رقم {unit.unitNum}</span>
        </nav>

        <UnitDetailClientView
          unit={unit}
          similarUnits={similarUnits}
          whatsappNumber={settings?.whatsappNumber}
          contactPhone={settings?.contactPhone}
        />
      </div>
    </div>
  );
}
