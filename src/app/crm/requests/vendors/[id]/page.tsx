import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RequestStatusForm from "@/components/RequestStatusForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VendorDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  const request = await prisma.vendorApplication.findUnique({
    where: { id: id }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/crm/requests/vendors" className="text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب المورد / المقاول</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">اسم الشركة</h3>
            <p className="text-lg font-bold text-gray-900">{request.companyName}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">مسؤول التواصل</h3>
            <p className="text-lg font-bold text-gray-900">{request.contactPerson}</p>
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
            <h3 className="text-sm font-bold text-gray-500 mb-1">نوع المورد</h3>
            <p className="text-base font-bold text-gray-900">{request.vendorType}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">التخصص</h3>
            <p className="text-base font-bold text-gray-900">{request.specialty}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">السجل التجاري</h3>
            <p className="text-base text-gray-900">{request.commercialRecord || "غير محدد"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">المدينة</h3>
            <p className="text-base text-gray-900">{request.city || "غير محددة"}</p>
          </div>
        </div>

        {request.companyProfile && (
          <>
            <hr className="my-6 border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-3">ملف الشركة</h3>
              <a href={request.companyProfile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                عرض ملف الشركة
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
              type="vendor"
              options={[
                { value: "NEW", label: "جديد" },
                { value: "IN_PROGRESS", label: "قيد المراجعة" },
                { value: "RESOLVED", label: "تم الموافقة" },
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
