import { prisma } from "@/lib/prisma";
import { updateProject } from "@/actions/projects";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClientForm from "@/components/crm/ClientForm";
import { requireRole } from "@/lib/auth-helpers";
import ProjectFormFields from "../../ProjectFormFields";
import ProjectModelsUnitsManager from "./ProjectModelsUnitsManager";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE:          { label: "متاح",           color: "bg-green-100 text-green-800 border-green-200" },
  UNDER_CONSTRUCTION: { label: "تحت الإنشاء",    color: "bg-orange-100 text-orange-800 border-orange-200" },
  COMING_SOON:        { label: "قريباً",          color: "bg-blue-100 text-blue-800 border-blue-200" },
  SOLD:               { label: "مباع",            color: "bg-red-100 text-red-800 border-red-200" },
};

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "MARKETING"]);
  const id = (await params).id;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      features:      { orderBy: { order: "asc" } },
      warranties:    { orderBy: { order: "asc" } },
      galleryImages: { orderBy: { order: "asc" } },
    },
  });

  if (!project) notFound();

  const updateAction = updateProject.bind(null, project.id);
  const status = STATUS_LABELS[project.status] ?? { label: project.status, color: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <div className="space-y-5 max-w-4xl mx-auto" dir="rtl">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">

          {/* Title + Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Preview */}
            {project.slug && (
              <a
                href={`/projects/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 bg-white rounded-lg py-1.5 px-3 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                معاينة
              </a>
            )}

            {/* Scroll to Models & Units section via anchor */}
            <a
              href="#models-units"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg py-2 px-4 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              النماذج والوحدات ↓
            </a>

            {/* Back */}
            <Link href="/crm/projects" className="text-sm text-gray-400 hover:text-gray-700 py-1.5 px-2 transition">
              ← العودة
            </Link>
          </div>
        </div>
      </div>

      {/* ── Project Form ── */}
      {/* NOTE: ProjectModelsUnitsManager is OUTSIDE this ClientForm to prevent nested forms */}
      <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100">
        <ClientForm action={updateAction} successMessage="تم تحديث المشروع بنجاح" className="space-y-0 p-6">
          <ProjectFormFields initialData={project} />

          {/* Save bar */}
          <div className="pt-5 mt-8 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/crm/projects"
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              إلغاء
            </Link>
            <button type="submit"
              className="inline-flex justify-center items-center gap-2 py-2 px-5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-[#D4AF37] hover:bg-[#b5952f] transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
              حفظ التعديلات
            </button>
          </div>
        </ClientForm>
      </div>

      {/* ── Models & Units Manager ── OUTSIDE project form ── */}
      <ProjectModelsUnitsManager projectId={project.id} />

    </div>
  );
}
