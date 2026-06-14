import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomePageForm from "./HomePageForm";

export default async function HomePageCMS() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  let content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  if (!content) {
    content = await prisma.homePageContent.create({ data: { id: "global" } });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة الصفحة الرئيسية</h1>
      <HomePageForm content={content} />
    </div>
  );
}
