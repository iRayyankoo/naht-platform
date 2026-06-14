import { prisma } from "@/lib/prisma";
import { updateProject } from "@/actions/projects";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageUpload from "@/components/crm/ImageUpload";
import ClientForm from "@/components/crm/ClientForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const project = await prisma.project.findUnique({
    where: { id: id }
  });

  if (!project) {
    notFound();
  }

  // We bind the id to the updateProject action so it receives it as the first argument
  const updateAction = updateProject.bind(null, project.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">تعديل المشروع: {project.name}</h1>
        <Link href="/crm/projects" className="text-sm text-gray-500 hover:text-gray-900">
          العودة للمشاريع
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <ClientForm action={updateAction} successMessage="تم تحديث المشروع بنجاح" className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم المشروع</label>
              <div className="mt-1">
                <input type="text" name="name" id="name" defaultValue={project.name} required className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">الرابط (Slug)</label>
              <div className="mt-1">
                <input type="text" name="slug" id="slug" defaultValue={project.slug} required placeholder="مثال: naht-14" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">نوع المشروع</label>
              <div className="mt-1">
                <select id="type" name="type" defaultValue={project.type} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
                  <option value="فيلا">فيلا</option>
                  <option value="شقة">شقة</option>
                  <option value="تاون هاوس">تاون هاوس</option>
                  <option value="أرض">أرض</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">المدينة</label>
              <div className="mt-1">
                <input type="text" name="city" id="city" defaultValue={project.city} required className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">الحي</label>
              <div className="mt-1">
                <input type="text" name="neighborhood" id="neighborhood" defaultValue={project.neighborhood} required className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">الحالة</label>
              <div className="mt-1">
                <select id="status" name="status" defaultValue={project.status} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
                  <option value="AVAILABLE">متاح</option>
                  <option value="SOLD">مباع</option>
                  <option value="COMING_SOON">قريباً</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <ImageUpload name="mainImage" defaultValue={project.mainImage || ""} label="صورة الغلاف (Main Image)" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="shortDesc" className="block text-sm font-medium text-gray-700">وصف مختصر</label>
              <div className="mt-1">
                <textarea id="shortDesc" name="shortDesc" defaultValue={project.shortDesc || ""} rows={3} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3"></textarea>
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="isFeatured" name="isFeatured" type="checkbox" defaultChecked={project.isFeatured} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                </div>
                <div className="ml-3 mr-3 text-sm">
                  <label htmlFor="isFeatured" className="font-medium text-gray-700">مشروع مميز</label>
                  <p className="text-gray-500">سيظهر في الصفحة الرئيسية للموقع العام.</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="isVisible" name="isVisible" type="checkbox" defaultChecked={project.isVisible} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                </div>
                <div className="ml-3 mr-3 text-sm">
                  <label htmlFor="isVisible" className="font-medium text-gray-700">مرئي في الموقع العام</label>
                  <p className="text-gray-500">إلغاء التحديد سيخفي المشروع عن الزوار.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
            <Link href="/crm/projects" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              إلغاء
            </Link>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
              حفظ التعديلات
            </button>
          </div>
        </ClientForm>
      </div>
    </div>
  );
}
