import { prisma } from "@/lib/prisma";
import TrackingSettingsForm from "./TrackingSettingsForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "إعدادات التتبع والـ SEO | CRM",
};

export default async function TrackingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/crm");
  }

  let settings = await prisma.trackingSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await prisma.trackingSettings.create({
      data: { id: "global" },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات التتبع والـ SEO</h1>
        <p className="text-gray-500 mt-1">إدارة البيكسلات وربط الحسابات وتخصيص أكواد التتبع.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <TrackingSettingsForm initialData={settings} />
      </div>
    </div>
  );
}
