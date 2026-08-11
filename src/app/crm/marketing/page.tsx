import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import {
  DEMO_MARKETING_KPIS,
  DEMO_MARKETING_CONTENT,
  DEMO_CAMPAIGN_CHANNELS_PERFORMANCE,
} from "@/lib/demo-data/marketing";

export default async function MarketingDashboardPage() {
  await requireRole(["ADMIN", "MARKETING"]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Demo Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 via-amber-800 to-amber-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            مركز التسويق الموحد
          </h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed">
            منصة تجريبية متكاملة لتخطيط وتنسيق حملات شركة نحت العقارية، متابعة أداء المحتوى، وإرشادات التحويل إلى العملاء.
          </p>
        </div>
        <div className="self-start bg-amber-500/30 text-amber-200 text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-md border border-amber-400/30 whitespace-nowrap">
          بيانات تجريبية - Demo Sprint
        </div>
      </div>

      {/* Section 1: Demo Sprint Pages */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">أقسام العرض التجريبي</h2>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">بيانات تجريبية</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/crm/marketing/content"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">عرض تجريبي</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">تقويم وخطة المحتوى</h3>
            <p className="text-xs text-gray-500">إدارة وجدولة المنشورات والبطاقات التسويقية (بيانات تجريبية)</p>
          </Link>

          <Link
            href="/crm/marketing/analytics"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">عرض تجريبي</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">تحليلات الأداء المقترحة</h3>
            <p className="text-xs text-gray-500">مؤشرات النقرات والزيارات ومعدلات التحويل (بيانات تجريبية)</p>
          </Link>
        </div>
      </div>

      {/* Section 2: Real System Integration Links */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">الأقسام المربوطة فعلياً بالنظام</h2>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">النظام الفعلي</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/crm/campaigns"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">سجل الحملات</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">إدارة الحملات التسويقية</h3>
            <p className="text-xs text-gray-500">انتقل لإنشاء ومتابعة روابط الحملات الـ UTM في قاعدة البيانات</p>
          </Link>

          <Link
            href="/crm/tracking"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
              </span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">سجل النقرات</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">جدول تتبع النقرات</h3>
            <p className="text-xs text-gray-500">عرض سجل النقرات الفعلية المسجلة من زيارات الموقع العام</p>
          </Link>
        </div>
      </div>

      {/* KPI Cards Clearly Tagged as Demo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">المؤشرات العامة (بيانات تجريبية)</h2>
          <span className="text-xs text-gray-400">مقرونة ببيانات العرض التجريبي</span>
        </div>
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
      </div>

      {/* Grid: Recent Content Items & Channels Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scheduled & Draft Content Cards (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">المحتوى المخطط له (بيانات تجريبية)</h2>
              <p className="text-xs text-gray-500 mt-0.5">بطاقات المحتوى المقترح للتسويق الرقمي</p>
            </div>
            <Link
              href="/crm/marketing/content"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              عرض الكل ({DEMO_MARKETING_CONTENT.length})
            </Link>
          </div>

          <div className="space-y-3">
            {DEMO_MARKETING_CONTENT.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-amber-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                      {item.channel}
                    </span>
                    {item.platform && (
                      <span className="text-xs text-gray-500 font-medium">| {item.platform}</span>
                    )}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'منشور' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'معتمد' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'مجدول' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                  {item.projectName && (
                    <p className="text-xs text-gray-500 mt-0.5">المشروع المرتبط: {item.projectName}</p>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-medium text-gray-400 block">تاريخ النشر Target</span>
                  <span className="text-xs font-bold text-gray-700">{item.scheduledDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Channels Breakdown (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">أداء القنوات (بيانات تجريبية)</h2>
          <p className="text-xs text-gray-500 mb-6">معدل تحويل الزيارات المقدر</p>

          <div className="space-y-4">
            {DEMO_CAMPAIGN_CHANNELS_PERFORMANCE.map((ch, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-800">{ch.channel}</span>
                  <span className="text-amber-700">{ch.conversionRate}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, parseInt(ch.conversionRate) * 6)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>النقرات: {ch.clicks}</span>
                  <span>العملاء: {ch.leads}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
