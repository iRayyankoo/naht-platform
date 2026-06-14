import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-primary">نحت العقارية</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/crm" className="block px-3 py-2 rounded-md bg-gray-100 text-gray-900 font-medium">
            الرئيسية
          </Link>
          <div className="px-3 py-2 text-sm text-gray-500 font-medium mt-4">إدارة النظام (قريباً)</div>
          <Link href="/crm/projects" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mb-2">
            <svg className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            المشاريع والوحدات
          </Link>
          <Link href="/crm/leads" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mb-2">
            <svg className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            العملاء المحتملين (Leads)
          </Link>
          <div className="px-3 py-2 text-sm text-gray-500 font-medium mt-4">التسويق والتتبع</div>
          <Link href="/crm/campaigns" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mb-2">
            <svg className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            روابط الحملات
          </Link>
          <Link href="/crm/tracking" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mb-2">
            <svg className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            إحصائيات النقرات
          </Link>
          <div className="px-3 py-2 text-sm text-gray-500 font-medium mt-4">إدارة الموقع (CMS)</div>
          <Link href="/crm/cms/homepage" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            الصفحة الرئيسية
          </Link>
          <Link href="/crm/cms/about" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            صفحة من نحن
          </Link>
          <Link href="/crm/cms/services" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            إدارة الخدمات
          </Link>
          <Link href="/crm/cms/faqs" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            الأسئلة الشائعة
          </Link>
          <Link href="/crm/cms/social-links" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            السوشال ميديا
          </Link>
          <Link href="/crm/cms/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            الإعدادات والفوتر
          </Link>

          <div className="px-3 py-2 text-sm text-gray-500 font-medium mt-4">الطلبات والموارد</div>
          <Link href="/crm/requests/maintenance" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            طلبات الصيانة
          </Link>
          <Link href="/crm/requests/vendors" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            المقاولين والموردين
          </Link>
          <Link href="/crm/requests/careers" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-1 text-sm">
            التوظيف والسير الذاتية
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
              <p className="text-xs font-medium text-gray-500 truncate">{(session.user as any)?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center md:hidden">
            <h1 className="text-xl font-bold text-primary">نحت العقارية</h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center">
            <Link href="/api/auth/signout" className="text-sm text-gray-600 hover:text-red-600 font-medium">
              تسجيل الخروج
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
