import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";

export default async function UsersPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const getRoleLabel = (r: string) => {
    switch (r) {
      case "ADMIN": return "مدير نظام";
      case "MARKETING": return "تسويق";
      case "SALES": return "مبيعات";
      default: return r;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <Link href="/crm/users/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm">
          + مستخدم جديد
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">تعديل</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={!user.isActive ? "bg-gray-50 opacity-75" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || "بدون اسم"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? "فعال" : "معطل"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <Link href={`/crm/users/${user.id}/edit`} className="text-primary hover:text-primary-dark">
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
