import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BrandSettingsForm from "./BrandSettingsForm";

export const metadata = {
  title: "إعدادات الهوية - إدارة المحتوى",
};

export default async function BrandSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" },
  });

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة الهوية البصرية</h1>
          </div>
          <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
            خصص مظهر المنصة ليعكس علامتك التجارية بأبهى صورة. من هنا يمكنك التحكم بالشعارات، لوحة الألوان، والنصوص الأساسية التي تمثل هويتك بأسلوب عصري واحترافي.
          </p>
        </div>
      </div>

      <BrandSettingsForm initialData={settings || {}} />
    </div>
  );
}
