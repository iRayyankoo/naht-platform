import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import ContentCard from "@/components/platform/layout/ContentCard";

export default async function UsersPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      department: true,
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  const getRoleLabel = (r: string) => {
    switch (r) {
      case "ADMIN": return "مدير نظام";
      case "MARKETING": return "تسويق";
      case "SALES": return "مبيعات";
      default: return r;
    }
  };
  
  const getRoleColor = (r: string) => {
    switch (r) {
      case "ADMIN": return "bg-purple-100 text-purple-800";
      case "MARKETING": return "bg-blue-100 text-blue-800";
      case "SALES": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة فريق العمل، الصلاحيات، وحسابات الدخول للنظام</p>
        </div>
        <Link 
          href="/crm/users/new" 
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          مستخدم جديد
        </Link>
      </div>

      {/* Data Presentation Area */}
      <ContentCard title="قائمة المستخدمين">
        {users.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="text-gray-300 text-6xl mb-4">👥</div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">لا يوجد مستخدمون حالياً</h3>
             <p className="text-gray-500 text-sm max-w-md">ابدأ بإضافة مستخدم جديد لإدارة صلاحيات الفريق.</p>
          </div>
        ) : (
          <>
            {/* --- DESKTOP TABLE VIEW --- */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-right text-gray-600 min-w-[900px]">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">المستخدم</th>
                    <th className="px-6 py-4 font-medium text-center">الإيميل</th>
                    <th className="px-6 py-4 font-medium text-center">القسم</th>
                    <th className="px-6 py-4 font-medium text-center">الدور القديم</th>
                    <th className="px-6 py-4 font-medium text-center">الأدوار الجديدة</th>
                    <th className="px-6 py-4 font-medium text-center">تاريخ الإضافة</th>
                    <th className="px-6 py-4 font-medium text-center">الحالة</th>
                    <th className="px-6 py-4 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${!user.isActive ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{user.name || "بدون اسم"}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500" dir="ltr">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-900">{user.department?.name || "-"}</div>
                        {user.jobTitle && <div className="text-xs text-gray-500 mt-1">{user.jobTitle}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.userRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {user.userRoles.map(ur => (
                              <span key={ur.roleId} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800" title={ur.role.name}>
                                {ur.role.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? "فعال" : "معطل"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 justify-end">
                          <Link 
                            href={`/crm/users/${user.id}/roles`} 
                            className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-semibold text-gray-500 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                            title="إدارة أدوار النظام"
                          >
                            الأدوار
                          </Link>
                          <Link 
                            href={`/crm/users/${user.id}/edit`} 
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="تعديل المستخدم"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARDS VIEW --- */}
            <div className="grid grid-cols-1 gap-4 lg:hidden p-4 bg-gray-50/50">
              {users.map((user) => (
                <div key={user.id} className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm ${!user.isActive ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900 text-base">{user.name || "بدون اسم"}</div>
                      <div className="text-sm text-gray-500 mt-0.5" dir="ltr">{user.email}</div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? "فعال" : "معطل"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-semibold w-fit ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.department && (
                        <span className="text-xs text-gray-500 font-medium">
                          {user.department.name} {user.jobTitle ? `- ${user.jobTitle}` : ''}
                        </span>
                      )}
                      {user.userRoles.length > 0 && (
                        <span className="text-[10px] text-gray-400">
                          {user.userRoles.length} أدوار نظام
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/crm/users/${user.id}/roles`}
                        className="text-gray-500 text-sm font-semibold flex items-center gap-1 hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        الأدوار
                      </Link>
                      <Link 
                        href={`/crm/users/${user.id}/edit`}
                        className="text-primary text-sm font-semibold flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        تعديل
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </ContentCard>
    </div>
  );
}
