import React from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isSuperAdmin } from "@/lib/rbac-helpers";
import { isImpersonationEnabled } from "@/lib/impersonation-helpers";
import AccessDenied from "@/components/crm/AccessDenied";

export default async function ImpersonationPage() {
  const user = await getCurrentUser();
  if (!user) return <AccessDenied />;

  const isSuper = await isSuperAdmin(user.id);
  if (!isSuper) return <AccessDenied />;

  const enabled = isImpersonationEnabled();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">اختبار الوصول والتقمص</h1>
          <p className="mt-1 text-sm text-gray-500">
            أدوات متقدمة لاختبار النظام بصلاحيات أدوار أو مستخدمين محددين. مخصصة للسوبر أدمن فقط.
          </p>
        </div>
      </div>

      {!enabled && (
        <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-amber-800">ميزة التقمص غير مفعلة حالياً في هذه البيئة</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  سيتم استخدام هذه الصفحة لاحقاً لاختبار تجربة الأدوار والمستخدمين. الخيارات أدناه للعرض فقط ولا تقوم بتشغيل تقمص فعلي.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* View as Role Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden opacity-75">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mr-3 text-lg font-medium text-gray-900">اختبار دور (View as Role)</h2>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              تصفح النظام وكأنك تملك صلاحيات دور معين (مثل: المبيعات، التسويق) دون تغيير حسابك الأساسي.
            </p>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">اختر الدور</label>
              <select disabled className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-gray-500 py-2">
                <option>VIEWER</option>
                <option>SALES</option>
                <option>MARKETING</option>
              </select>
            </div>
            
            <div className="mt-6">
              <button disabled className="w-full bg-gray-100 text-gray-400 py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium cursor-not-allowed">
                بدء التقمص
              </button>
            </div>
          </div>
        </div>

        {/* Impersonate User Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden opacity-75">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-rose-50 rounded-lg">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="mr-3 text-lg font-medium text-gray-900">تقمص مستخدم (Impersonate)</h2>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              اختبر النظام تماماً كما يراه مستخدم محدد (بما في ذلك الصلاحيات والبيانات المرئية له).
            </p>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للمستخدم</label>
              <input 
                type="email" 
                disabled 
                placeholder="user@example.com"
                className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-gray-500 py-2 px-3"
              />
            </div>
            
            <div className="mt-6">
              <button disabled className="w-full bg-gray-100 text-gray-400 py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium cursor-not-allowed">
                دخول كالمستخدم
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
