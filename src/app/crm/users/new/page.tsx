import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import ClientForm from "@/components/crm/ClientForm";
import { createUser } from "@/actions/users";
import ContentCard from "@/components/platform/layout/ContentCard";
import PasswordInput from "@/components/crm/PasswordInput";

import { prisma } from "@/lib/prisma";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-4xl mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إضافة مستخدم جديد</h1>
          <p className="text-sm text-gray-500 mt-1">إنشاء حساب جديد للموظف وإعداد صلاحيات الدخول للنظام</p>
        </div>
        <Link 
          href="/crm/users" 
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          العودة للمستخدمين
        </Link>
      </div>

      <ContentCard title="بيانات المستخدم">
        <ClientForm action={createUser} successMessage="تم إضافة المستخدم بنجاح" className="p-2 sm:p-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">الاسم الكامل</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  placeholder="مثال: أحمد محمد"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
              <div className="mt-2">
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  required 
                  dir="ltr" 
                  placeholder="name@naht-re.sa"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border text-left transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">كلمة المرور</label>
              <div className="mt-2">
                <PasswordInput 
                  name="password" 
                  id="password" 
                  required 
                  minLength={6} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700">الدور والصلاحية</label>
              <div className="mt-2">
                <select 
                  id="role" 
                  name="role" 
                  defaultValue="SALES" 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border bg-white transition-colors cursor-pointer"
                >
                  <option value="ADMIN">مدير نظام (ADMIN)</option>
                  <option value="MARKETING">تسويق (MARKETING)</option>
                  <option value="SALES">مبيعات (SALES)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700">القسم (Department)</label>
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                تتم إدارة الأقسام والنقل عبر لوحة الهيكل التنظيمي.
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700">المسمى الوظيفي</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="jobTitle" 
                  id="jobTitle" 
                  placeholder="مثال: مدير تسويق"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">رقم الهاتف</label>
              <div className="mt-2">
                <input 
                  type="tel" 
                  name="phone" 
                  id="phone" 
                  dir="ltr"
                  placeholder="+966..."
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border text-left transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700">حالة المستخدم (Status)</label>
              <div className="mt-2">
                <select 
                  id="status" 
                  name="status" 
                  defaultValue="ACTIVE" 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border bg-white transition-colors cursor-pointer"
                >
                  <option value="ACTIVE">نشط (ACTIVE)</option>
                  <option value="INACTIVE">غير نشط (INACTIVE)</option>
                  <option value="SUSPENDED">موقوف (SUSPENDED)</option>
                  <option value="PENDING">معلق (PENDING)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">تسجيل الدخول (Login Access)</label>
              <div className="mt-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">تفعيل حساب المستخدم</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              إضافة المستخدم
            </button>
          </div>
        </ClientForm>
      </ContentCard>
    </div>
  );
}
