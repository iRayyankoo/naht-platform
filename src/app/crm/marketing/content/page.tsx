import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { DEMO_MARKETING_CONTENT, MarketingContentItem } from "@/lib/demo-data/marketing";

interface ContentPageProps {
  searchParams: Promise<{
    status?: string;
    channel?: string;
  }>;
}

export default async function MarketingContentPage({ searchParams }: ContentPageProps) {
  await requireRole(["ADMIN", "MARKETING"]);
  const resolvedParams = await searchParams;

  const statusFilter = resolvedParams.status || "الكل";
  const channelFilter = resolvedParams.channel || "الكل";

  const filteredContent = DEMO_MARKETING_CONTENT.filter((item) => {
    const matchStatus = statusFilter === "الكل" || item.status === statusFilter;
    const matchChannel = channelFilter === "الكل" || item.channel === channelFilter;
    return matchStatus && matchChannel;
  });

  const statuses: Array<MarketingContentItem["status"] | "الكل"> = [
    "الكل",
    "مسودة",
    "قيد المراجعة",
    "معتمد",
    "مجدول",
    "منشور",
  ];

  const channels = ["الكل", "سوشيال ميديا", "بريد إلكتروني", "مدونة", "إعلان"];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crm/marketing" className="text-xs font-bold text-amber-700 hover:underline">
              مركز التسويق
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">تقويم المحتوى</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">تقويم وخطة المحتوى التسويقي</h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة وجدولة المواد الإعلانية، المنشورات، وحملات الرسائل التسويقية (بيانات تجريبية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
            بيانات تجريبية
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 ml-2">الحالة:</span>
          {statuses.map((st) => {
            const isActive = statusFilter === st;
            return (
              <Link
                key={st}
                href={`/crm/marketing/content?status=${encodeURIComponent(st)}&channel=${encodeURIComponent(channelFilter)}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>

        {/* Channel Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 ml-2">القناة:</span>
          {channels.map((ch) => {
            const isActive = channelFilter === ch;
            return (
              <Link
                key={ch}
                href={`/crm/marketing/content?status=${encodeURIComponent(statusFilter)}&channel=${encodeURIComponent(ch)}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ch}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
                  {item.channel}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.status === "منشور"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "معتمد"
                      ? "bg-blue-100 text-blue-700"
                      : item.status === "مجدول"
                      ? "bg-purple-100 text-purple-700"
                      : item.status === "قيد المراجعة"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                {item.title}
              </h3>

              {item.projectName && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl mb-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  <span>{item.projectName}</span>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  ملاحظة: {item.notes}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div>
                <span className="block text-[10px] text-gray-400">المعد</span>
                <span className="font-bold text-gray-700">{item.author}</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-gray-400">تاريخ المستهدف</span>
                <span className="font-bold text-gray-700">{item.scheduledDate}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredContent.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-500">
            لا تتوفر مواد محتوى تطابق الفلاتر المحددة حالياً
          </div>
        )}
      </div>
    </div>
  );
}
