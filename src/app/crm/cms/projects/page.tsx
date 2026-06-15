import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ProjectsPageForm from "./ProjectsPageForm";
import Link from "next/link";

export const metadata = {
  title: "إدارة صفحة المشاريع - CMS",
};

export default async function CmsProjectsPage() {
  await requireRole(["ADMIN", "MARKETING"]);
  const content = await prisma.projectsPageContent.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">إعدادات صفحة المشاريع (Projects Page)</h1>
          <p className="text-gray-500 text-sm">تحكم في نصوص وعناوين صفحة معرض المشاريع العامة.</p>
        </div>
        <Link href="/projects" target="_blank" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-md">
          <span>معاينة الصفحة العامة</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </Link>
      </div>

      <ProjectsPageForm content={content || {}} />
    </div>
  );
}
