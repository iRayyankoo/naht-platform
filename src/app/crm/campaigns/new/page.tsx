import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignBuilderForm from "./CampaignBuilderForm";

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole || "")) {
    redirect("/crm/campaigns");
  }

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4 space-x-reverse mb-8">
        <Link href="/crm/campaigns" className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm border border-gray-100">
          <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">إنشاء رابط حملة جديد</h1>
      </div>

      <CampaignBuilderForm projects={projects} />
    </div>
  );
}
