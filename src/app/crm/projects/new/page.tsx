import { createProject } from "@/actions/projects";
import Link from "next/link";
import ClientForm from "@/components/crm/ClientForm";
import { requireRole } from "@/lib/auth-helpers";
import ProjectFormFields from "../ProjectFormFields";

export default async function NewProjectPage() {
  await requireRole(["ADMIN", "MARKETING"]);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">إضافة مشروع جديد</h1>
          <Link href="/crm/projects" className="text-sm text-gray-400 hover:text-gray-700 transition">
            ← العودة للمشاريع
          </Link>
        </div>
        {/* Guidance note */}
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800">
          💡 بعد إنشاء المشروع يمكنك إضافة <strong>النماذج والوحدات</strong> من صفحة التعديل.
        </div>
      </div>

      {/* ── Form ── */}
      <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100">
        <ClientForm action={createProject} successMessage="تم إضافة المشروع بنجاح" className="space-y-0 p-6">
          <ProjectFormFields />

          <div className="pt-5 mt-8 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/crm/projects"
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              إلغاء
            </Link>
            <button type="submit"
              className="inline-flex justify-center items-center gap-2 py-2 px-5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-[#D4AF37] hover:bg-[#b5952f] transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              إضافة المشروع
            </button>
          </div>
        </ClientForm>
      </div>

    </div>
  );
}
