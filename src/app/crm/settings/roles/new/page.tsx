import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import ClientForm from "@/components/crm/ClientForm";
import ContentCard from "@/components/platform/layout/ContentCard";
import { createRole } from "../actions";

export default async function NewRolePage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-4 xl:space-y-6 max-w-4xl mx-auto w-full pb-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إضافة دور جديد</h1>
          <p className="text-sm text-gray-500 mt-1">إنشاء دور (AppRole) جديد لتنظيم الصلاحيات</p>
        </div>
        <Link 
          href="/crm/settings/roles" 
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          العودة للأدوار
        </Link>
      </div>

      <ContentCard title="بيانات الدور الأساسية">
        <ClientForm action={createRole} successMessage="تم إضافة الدور بنجاح" className="p-2 sm:p-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            
            <div className="sm:col-span-1">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">اسم الدور</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  placeholder="مثال: مدير الموارد البشرية"
                  required 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700">كود الدور (English/Unique)</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="code" 
                  id="code" 
                  dir="ltr"
                  placeholder="مثال: HR_MANAGER"
                  required 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border text-left transition-colors uppercase" 
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700">الوصف</label>
              <div className="mt-2">
                <textarea 
                  name="description" 
                  id="description" 
                  rows={3}
                  placeholder="وصف لمهام ومسؤوليات هذا الدور..."
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border transition-colors resize-none" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">حالة الدور</label>
              <div className="mt-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">تفعيل الدور للاستخدام</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={true} className="sr-only peer" />
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
              إضافة الدور
            </button>
          </div>
        </ClientForm>
      </ContentCard>
    </div>
  );
}
