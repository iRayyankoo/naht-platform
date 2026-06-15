import { createProject } from "@/actions/projects";
import Link from "next/link";
import ImageUpload from "@/components/crm/ImageUpload";
import ClientForm from "@/components/crm/ClientForm";
import { requireRole } from "@/lib/auth-helpers";
import ProjectFormFields from "../ProjectFormFields";
export default async function NewProjectPage() {
  await requireRole(["ADMIN", "MARKETING"]);
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إضافة مشروع جديد</h1>
        <Link href="/crm/projects" className="text-sm text-gray-500 hover:text-gray-900">
          العودة للمشاريع
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <ClientForm action={createProject} successMessage="تم إضافة المشروع بنجاح" className="space-y-6 p-6">
          <ProjectFormFields />

          <div className="pt-5 mt-8 border-t border-gray-200 flex justify-end gap-3">
            <Link href="/crm/projects" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              إلغاء
            </Link>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
              إضافة المنتج العقاري
            </button>
          </div>
        </ClientForm>
      </div>
    </div>
  );
}
