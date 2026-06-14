import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AboutPageForm from "./AboutPageForm";

export default async function AboutPageCMS() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  let content = await prisma.aboutPageContent.findUnique({ where: { id: "global" } });
  if (!content) {
    content = await prisma.aboutPageContent.create({ data: { id: "global" } });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة صفحة من نحن</h1>
      <AboutPageForm content={content} />
    </div>
  );
}
