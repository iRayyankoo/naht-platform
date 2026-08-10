import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RequestStatusForm from "@/components/RequestStatusForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaintenanceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role;

  if (!session || userRole !== "ADMIN") {
    redirect("/crm");
  }

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: id }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/crm/requests/maintenance" className="text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب الصيانة</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">العميل</h3>
            <p className="text-lg font-bold text-gray-900">{request.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">رقم الجوال</h3>
            <p className="text-lg font-bold text-gray-900"><a href={`tel:${request.phone}`} className="hover:text-primary dir-ltr inline-block">{request.phone}</a></p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">البريد الإلكتروني</h3>
            <p className="text-base text-gray-900">{request.email || "لا يوجد"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">تاريخ الإرسال</h3>
            <p className="text-base text-gray-900">{request.createdAt.toLocaleDateString("ar-SA")} {request.createdAt.toLocaleTimeString("ar-SA")}</p>
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">نوع المشكلة</h3>
            <p className="text-base font-bold text-gray-900">{request.issueType}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">المشروع أو الوحدة</h3>
            <p className="text-base text-gray-900">{request.projectOrUnit || "غير محدد"}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-gray-500 mb-2">وصف المشكلة</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </div>
          </div>
        </div>

        {request.attachmentUrl && (
          <>
            <hr className="my-6 border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-3">المرفقات</h3>
              <a href={request.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                عرض المرفق
              </a>
            </div>
          </>
        )}

        <hr className="my-6 border-gray-100" />

        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3">تغيير حالة الطلب</h3>
          <div className="max-w-xs">
            <RequestStatusForm
              id={request.id}
              currentStatus={request.status}
              type="maintenance"
              options={[
                { value: "NEW", label: "جديد" },
                { value: "IN_PROGRESS", label: "قيد المراجعة" },
                { value: "RESOLVED", label: "مكتمل" },
                { value: "CANCELLED", label: "مرفوض" }
              ]}
            />
          </div>
        </div>

        {request.notes && (
          <>
            <hr className="my-6 border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">ملاحظات داخلية</h3>
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 whitespace-pre-wrap">
                {request.notes}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
