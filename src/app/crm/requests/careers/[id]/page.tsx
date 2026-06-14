import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RequestStatusForm from "@/components/RequestStatusForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CareerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  const request = await prisma.jobApplication.findUnique({
    where: { id: id }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/crm/requests/careers" className="text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب التوظيف</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">المرشح</h3>
            <p className="text-lg font-bold text-gray-900">{request.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">الوظيفة المطلوبة</h3>
            <p className="text-lg font-bold text-gray-900">{request.position}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">رقم الجوال</h3>
            <p className="text-base font-bold text-gray-900"><a href={`tel:${request.phone}`} className="hover:text-primary dir-ltr inline-block">{request.phone}</a></p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">البريد الإلكتروني</h3>
            <p className="text-base text-gray-900"><a href={`mailto:${request.email}`} className="hover:text-primary">{request.email}</a></p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">تاريخ الطلب</h3>
            <p className="text-base text-gray-900">{request.createdAt.toLocaleDateString("ar-SA")} {request.createdAt.toLocaleTimeString("ar-SA")}</p>
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">سنوات الخبرة</h3>
            <p className="text-base font-bold text-gray-900">{request.experienceYears != null ? `${request.experienceYears} سنوات` : "غير محدد"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">المدينة</h3>
            <p className="text-base text-gray-900">{request.city || "غير محددة"}</p>
          </div>
          
          {request.linkedInUrl && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-500 mb-1">حساب LinkedIn</h3>
              <a href={request.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-base font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                عرض الحساب
              </a>
            </div>
          )}
        </div>

        {request.resumeUrl && (
          <>
            <hr className="my-6 border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-3">السيرة الذاتية</h3>
              <a href={request.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                عرض السيرة الذاتية
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
              type="career"
              options={[
                { value: "NEW", label: "جديد" },
                { value: "IN_PROGRESS", label: "قيد المراجعة" },
                { value: "RESOLVED", label: "تم التواصل" },
                { value: "CANCELLED", label: "مرفوض" }
              ]}
            />
          </div>
        </div>

        {request.notes && (
          <>
            <hr className="my-6 border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">رسالة / نبذة إضافية</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
                {request.notes}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
