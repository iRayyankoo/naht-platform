import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FilterBar from "@/components/crm/FilterBar";

export const metadata = {
  title: "طلبات تواصل معنا | CRM",
};

// Map status to colors
const statusColors: Record<string, string> = {
  "NEW": "bg-blue-100 text-blue-800",
  "CONTACTED": "bg-yellow-100 text-yellow-800",
  "INTERESTED": "bg-indigo-100 text-indigo-800",
  "SOLD": "bg-green-100 text-green-800",
  "LOST": "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  "NEW": "جديد",
  "CONTACTED": "تم التواصل",
  "INTERESTED": "متابعة", // Using this as 'In progress/following up'
  "SOLD": "مغلق بنجاح",
  "LOST": "مغلق",
};

export default async function ContactRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string; date?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const statusFilter = typeof sp.status === "string" ? sp.status : undefined;
  const sourceFilter = typeof sp.source === "string" ? sp.source : undefined;
  const dateFilter = typeof sp.date === "string" ? sp.date : undefined;

  let dateQuery = {};
  if (dateFilter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateQuery = { gte: today };
  } else if (dateFilter === "week") {
    const week = new Date();
    week.setDate(week.getDate() - 7);
    dateQuery = { gte: week };
  } else if (dateFilter === "month") {
    const month = new Date();
    month.setMonth(month.getMonth() - 1);
    dateQuery = { gte: month };
  }

  const whereClause = {
    leadType: "CONTACT_US",
    ...(q && {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ],
    }),
    ...(statusFilter && { status: statusFilter }),
    ...(sourceFilter && { utmSource: sourceFilter }),
    ...(Object.keys(dateQuery).length > 0 && { createdAt: dateQuery }),
  };

  const requests = await prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: true },
  });

  // Calculate stats
  const total = await prisma.lead.count({ where: { leadType: "CONTACT_US" } });
  const newRequests = await prisma.lead.count({ where: { leadType: "CONTACT_US", status: "NEW" } });
  const contacted = await prisma.lead.count({ where: { leadType: "CONTACT_US", status: "CONTACTED" } });
  const inProgress = await prisma.lead.count({ where: { leadType: "CONTACT_US", status: { notIn: ["NEW", "CONTACTED", "LOST", "SOLD", "UNQUALIFIED", "DUPLICATE"] } } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">طلبات تواصل معنا</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="text-sm text-gray-500 mb-1">إجمالي الطلبات</div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 text-center">
          <div className="text-sm text-green-600 mb-1">جديدة</div>
          <div className="text-3xl font-bold text-green-700">{newRequests}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 text-center">
          <div className="text-sm text-blue-600 mb-1">تم التواصل</div>
          <div className="text-3xl font-bold text-blue-700">{contacted}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100 text-center">
          <div className="text-sm text-yellow-600 mb-1">قيد المتابعة</div>
          <div className="text-3xl font-bold text-yellow-700">{inProgress}</div>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="ابحث بالاسم، الجوال، البريد..."
        fields={[
          {
            key: "status",
            label: "حالة الطلب",
            options: [
              { value: "NEW", label: "جديد" },
              { value: "CONTACTED", label: "تم التواصل" },
              { value: "INTERESTED", label: "متابعة" },
              { value: "SOLD", label: "مغلق بنجاح" },
              { value: "LOST", label: "مغلق" },
            ]
          },
          {
            key: "source",
            label: "المصدر",
            options: [
              { value: "عضوي (Direct)", label: "عضوي (Direct)" },
              { value: "snapchat", label: "سناب شات" },
              { value: "tiktok", label: "تيك توك" },
              { value: "google", label: "جوجل" },
              { value: "instagram", label: "انستقرام" },
              { value: "twitter", label: "تويتر" },
            ]
          },
          {
            key: "date",
            label: "تاريخ الطلب",
            options: [
              { value: "today", label: "اليوم" },
              { value: "week", label: "آخر أسبوع" },
              { value: "month", label: "آخر شهر" },
            ]
          }
        ]}
      />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">معلومات التواصل</th>
                <th className="px-6 py-4">نوع الاستفسار</th>
                <th className="px-6 py-4">الرسالة</th>
                <th className="px-6 py-4">المصدر</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">المسؤول</th>
                <th className="px-6 py-4">تاريخ الطلب</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    لا يوجد طلبات تطابق بحثك
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{req.name}</td>
                    <td className="px-6 py-4">
                      <div dir="ltr" className="text-right font-medium">{req.phone}</div>
                      {req.email && <div className="text-xs text-gray-500 mt-1">{req.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                        {req.opportunityType || "غير محدد"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-gray-600" title={req.message || ""}>
                        {req.message || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{req.utmSource || "مباشر"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[req.status] || "bg-gray-100 text-gray-800"}`}>
                        {statusLabels[req.status] || req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{req.assignedTo?.name || "غير معين"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs text-right" dir="ltr">
                      {req.createdAt.toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/crm/leads/${req.id}`} className="text-primary hover:underline font-bold text-sm bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors">
                        التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
