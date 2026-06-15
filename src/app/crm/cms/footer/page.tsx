import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FooterSettingsForm from "./FooterSettingsForm";

export const metadata = {
  title: "إعدادات الفوتر - إدارة المحتوى",
};

export default async function FooterSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" },
  });

  const links = await prisma.footerLink.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة تذييل الموقع (Footer)</h1>
      </div>

      <FooterSettingsForm initialSettings={settings || {}} initialLinks={links} />
    </div>
  );
}
