import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  // Ensure default exists
  let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "global" } });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إعدادات الموقع العامة</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
