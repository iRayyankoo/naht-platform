import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClientForm from "@/components/crm/ClientForm";
import { updateUser, resetUserPassword } from "@/actions/users";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  
  const id = (await params).id;
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    notFound();
  }

  const updateAction = updateUser.bind(null, user.id);
  const resetAction = resetUserPassword.bind(null, user.id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">تعديل المستخدم: {user.name}</h1>
        <Link href="/crm/users" className="text-sm text-gray-500 hover:text-gray-900">
          العودة للمستخدمين
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <ClientForm action={updateAction} successMessage="تم تحديث بيانات المستخدم بنجاح" className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">الاسم</label>
              <div className="mt-1">
                <input type="text" name="name" id="name" defaultValue={user.name || ""} required className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="mt-1">
                <input type="email" name="email" id="email" defaultValue={user.email || ""} required dir="ltr" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border text-left" />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">الدور والصلاحية</label>
              <div className="mt-1">
                <select id="role" name="role" defaultValue={user.role} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
                  <option value="ADMIN">مدير نظام (ADMIN)</option>
                  <option value="MARKETING">تسويق (MARKETING)</option>
                  <option value="SALES">مبيعات (SALES)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">حالة الحساب</label>
              <div className="mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">حساب فعال</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-md font-bold text-sm">
              حفظ التعديلات
            </button>
          </div>
        </ClientForm>
      </div>

      <div className="bg-white shadow sm:rounded-lg mt-8 border border-red-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-red-600">إعادة تعيين كلمة المرور</h3>
        </div>
        <ClientForm action={resetAction} successMessage="تم تغيير كلمة المرور بنجاح" className="p-6 space-y-4">
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
            <input type="password" name="password" id="new_password" required minLength={6} dir="ltr" className="mt-1 shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border text-left" />
            <p className="text-xs text-gray-500 mt-1">يجب أن تتكون من 6 أحرف على الأقل.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold text-sm">
              تغيير كلمة المرور
            </button>
          </div>
        </ClientForm>
      </div>
    </div>
  );
}
