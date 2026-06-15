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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الهوية البصرية</h1>
      </div>

      <BrandSettingsForm initialData={settings || {}} />
    </div>
  );
}
