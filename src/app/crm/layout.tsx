import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import CrmSidebar from "@/components/crm/CrmSidebar";

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
      <CrmSidebar 
        userName={session.user?.name || "المستخدم"} 
        userRole={(session.user as any)?.role || "ADMIN"} 
      />

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
