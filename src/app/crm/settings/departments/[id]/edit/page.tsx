import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentCard from "@/components/platform/layout/ContentCard";
import { updateDepartment } from "../../actions";

export default async function EditDepartmentPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN"]);

  const department = await prisma.department.findUnique({
    where: { id: params.id },
  });

  if (!department) {
    notFound();
  }

  // Pass id to the server action
  const updateDepartmentWithId = updateDepartment.bind(null, department.id);

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">تعديل القسم</h1>
          <p className="text-sm text-gray-500 mt-1">تحديث بيانات القسم {department.name}</p>
        </div>
        <Link 
          href="/crm/settings/departments" 
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          العودة للأقسام
        </Link>
      </div>

      <ContentCard title="بيانات القسم">
        <form action={updateDepartmentWithId} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                اسم القسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={department.name}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                الكود المرجعي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                defaultValue={department.code}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono text-left"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                الوصف (اختياري)
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={department.description || ""}
                rows={3}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                الترتيب
              </label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                defaultValue={department.sortOrder}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div className="flex items-center pt-6">
              <div className="flex items-center h-5">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={department.isActive}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
              </div>
              <div className="mr-3 text-sm">
                <label htmlFor="isActive" className="font-medium text-gray-900">
                  قسم فعال
                </label>
                <p className="text-gray-500 text-xs">إلغاء التفعيل سيخفي القسم من القوائم (بديل الحذف)</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
            >
              تحديث القسم
            </button>
          </div>
        </form>
      </ContentCard>
    </div>
  );
}
