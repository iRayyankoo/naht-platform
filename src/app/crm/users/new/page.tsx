import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import ClientForm from "@/components/crm/ClientForm";
import { createUser } from "@/actions/users";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إضافة مستخدم جديد</h1>
        <Link href="/crm/users" className="text-sm text-gray-500 hover:text-gray-900">
          العودة للمستخدمين
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <ClientForm action={createUser} successMessage="تم إضافة المستخدم بنجاح" className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">الاسم</label>
              <div className="mt-1">
                <input type="text" name="name" id="name" required className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="mt-1">
                <input type="email" name="email" id="email" required dir="ltr" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border text-left" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">كلمة المرور</label>
              <div className="mt-1">
                <input type="password" name="password" id="password" required minLength={6} dir="ltr" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border text-left" />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">الدور والصلاحية</label>
              <div className="mt-1">
                <select id="role" name="role" defaultValue="SALES" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
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
                  <input type="checkbox" name="isActive" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">حساب فعال</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-md font-bold text-sm">
              إضافة المستخدم
            </button>
          </div>
        </ClientForm>
      </div>
    </div>
  );
}
