import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import {
  DEMO_MARKETING_KPIS,
  DEMO_CAMPAIGN_CHANNELS_PERFORMANCE,
} from "@/lib/demo-data/marketing";

export default async function MarketingAnalyticsPage() {
  await requireRole(["ADMIN", "MARKETING"]);

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
            <span className="text-xs text-gray-500 font-bold">تحليلات الأداء</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">تحليلات ومؤشرات التسويق الرقمي (بيانات تجريبية)</h1>
          <p className="text-xs text-gray-500 mt-1">
            تحليل تفاعلات الزوار والنقرات ومعدلات التحويل المقترحة للمشروع (بيانات تجريبية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/crm/campaigns"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            الانتقال لروابط الحملات الفعلية
          </Link>
        </div>
      </div>

      {/* Overview KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_MARKETING_KPIS.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Table & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Channel Conversion Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">أداء مصادر النقرات والعملاء (بيانات تجريبية)</h2>
              <p className="text-xs text-gray-500">مقارنة النتائج ومعدل التحويل التراكمي المقدر</p>
            </div>
            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-bold">
              بيانات تجريبية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3">القناة / المصدر</th>
                  <th className="p-3">إجمالي النقرات</th>
                  <th className="p-3">العملاء المكتسبون</th>
                  <th className="p-3 text-center">معدل التحويل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DEMO_CAMPAIGN_CHANNELS_PERFORMANCE.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{item.channel}</td>
                    <td className="p-3 text-gray-600">{item.clicks.toLocaleString()} نقرة</td>
                    <td className="p-3 text-gray-600">{item.leads} عميل</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                        {item.conversionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Data Integration Card (1 col) */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">الانتقال لسجلات النظام الفعلي</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              يمكنك الانتقال إلى جداول السجلات الفعلية المسجلة من زيارات المستخدمين الحية بالموقع العام.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/crm/tracking"
              className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              عرض جدول التتبع المباشر (Tracking Logs)
            </Link>
            <Link
              href="/crm/campaigns"
              className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-gray-700"
            >
              عرض سجل روابط الحملات (Campaign Links)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
