import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClientForm from "@/components/crm/ClientForm";
import { updateUser, resetUserPassword } from "@/actions/users";
import ContentCard from "@/components/platform/layout/ContentCard";
import PasswordInput from "@/components/crm/PasswordInput";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  
  const id = (await params).id;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  });

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  if (!user) {
    notFound();
  }

  const updateAction = updateUser.bind(null, user.id);
  const resetAction = resetUserPassword.bind(null, user.id);

  return (
    <div className="space-y-4 xl:space-y-6 max-w-4xl mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">تعديل مستخدم</h1>
          <p className="text-sm text-gray-500 mt-1">تحديث بيانات وصلاحيات المستخدم: {user.name}</p>
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

      <ContentCard title="البيانات الأساسية">
        <ClientForm action={updateAction} successMessage="تم تحديث بيانات المستخدم بنجاح" className="p-2 sm:p-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">الاسم الكامل</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  defaultValue={user.name || ""} 
                  required 
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
                  defaultValue={user.email || ""} 
                  required 
                  dir="ltr" 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border text-left transition-colors" 
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700">الدور والصلاحية</label>
              <div className="mt-2">
                <select 
                  id="role" 
                  name="role" 
                  defaultValue={user.role} 
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border bg-white transition-colors cursor-pointer"
                >
                  <option value="ADMIN">مدير نظام (ADMIN)</option>
                  <option value="MARKETING">تسويق (MARKETING)</option>
                  <option value="SALES">مبيعات (SALES)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="departmentId" className="block text-sm font-semibold text-gray-700">القسم (Department)</label>
              <div className="mt-2">
                <select 
                  id="departmentId" 
                  name="departmentId" 
                  defaultValue={user.departmentId || ""}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-4 border bg-white transition-colors cursor-pointer"
                >
                  <option value="">بدون قسم</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700">المسمى الوظيفي</label>
              <div className="mt-2">
                <input 
                  type="text" 
                  name="jobTitle" 
                  id="jobTitle" 
                  defaultValue={user.jobTitle || ""}
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
                  defaultValue={user.phone || ""}
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
                  defaultValue={user.status || "ACTIVE"} 
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
                  <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الأدوار الجديدة (AppRoles) - قراءة فقط</label>
              <div className="mt-2 bg-gray-50/50 p-4 rounded-lg border border-gray-100 min-h-[60px] flex flex-wrap gap-2 items-center">
                {user.userRoles.length > 0 ? (
                  user.userRoles.map(ur => (
                    <span key={ur.roleId} className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary">
                      {ur.role.name} ({ur.role.code})
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">لا يوجد أدوار جديدة مرتبطة حالياً.</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              حفظ التعديلات
            </button>
          </div>
        </ClientForm>
      </ContentCard>

      <ContentCard title="تغيير كلمة المرور">
        <div className="p-2 sm:p-4">
          <div className="mb-6">
            <p className="text-sm text-gray-500 leading-relaxed">
              بصفتك مدير للنظام، يمكنك تعيين كلمة مرور جديدة لهذا المستخدم مباشرة دون الحاجة لمعرفة كلمة المرور القديمة.
            </p>
          </div>
          <ClientForm action={resetAction} successMessage="تم تغيير كلمة المرور بنجاح">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700">كلمة المرور الجديدة</label>
                <div className="mt-2">
                  <PasswordInput 
                    name="password" 
                    id="new_password" 
                    required 
                    minLength={6} 
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    يجب أن تتكون من 6 أحرف على الأقل.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-8 mt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                تعيين كلمة المرور
              </button>
            </div>
          </ClientForm>
        </div>
      </ContentCard>

    </div>
  );
}
