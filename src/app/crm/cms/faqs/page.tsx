import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FaqForm from "./FaqForm";
import { deleteFaq } from "@/actions/cms";

export default async function FaqsCMS() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  const faqs = await prisma.faq.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة الأسئلة الشائعة</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">إضافة سؤال جديد</h2>
            <FaqForm />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="pr-2">
                  <h3 className="font-bold text-gray-900">
                    <span className="text-primary ml-2 font-black">؟</span>
                    {faq.question}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                    {faq.answer}
                  </div>
                  <div className="mt-3 flex items-center space-x-3 space-x-reverse text-xs text-gray-500">
                    {faq.category && <span className="bg-gray-100 px-2 py-1 rounded">القسم: {faq.category}</span>}
                    <span>الترتيب: {faq.order}</span>
                    {!faq.isVisible && <span className="text-red-600">مخفي</span>}
                  </div>
                </div>
                <form action={async () => {
                  "use server";
                  await deleteFaq(faq.id);
                }}>
                  <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-1 rounded">حذف</button>
                </form>
              </div>
            </div>
          ))}
          
          {faqs.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              لا توجد أسئلة شائعة مضافة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
