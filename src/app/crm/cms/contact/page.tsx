import { prisma } from "@/lib/prisma";
import ContactPageForm from "./ContactPageForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "إدارة صفحة تواصل معنا | CRM",
};

export default async function ManageContactPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MARKETING"].includes((session.user as any)?.role)) {
    redirect("/crm");
  }

  let content = await prisma.contactPageContent.findUnique({
    where: { id: "global" }
  });

  if (!content) {
    content = {
      id: "global",
      title: "تواصل معنا",
      description: "نحن هنا لخدمتك والإجابة على كافة استفساراتك",
      formTitle: "أرسل رسالتك",
      submitButtonText: "إرسال الرسالة",
      helperText: "",
      heroImage: "",
      seoTitle: "",
      seoDescription: "",
      updatedAt: new Date(),
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة صفحة تواصل معنا</h1>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm border border-blue-100">
        <p className="font-bold mb-1">معلومة:</p>
        <p>بيانات الاتصال الفعلية مثل (رقم الهاتف، البريد الإلكتروني، رابط خرائط جوجل) يتم إدارتها من خلال <strong><a href="/crm/cms/settings" className="underline text-blue-600">إعدادات الموقع العامة</a></strong>، وليس من هنا. هذه الصفحة مخصصة للنصوص والصور الخاصة بصفحة التواصل.</p>
      </div>

      <ContactPageForm content={content} />
    </div>
  );
}
