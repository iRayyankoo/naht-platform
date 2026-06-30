"use client";

import React, { useState } from 'react';
import PlatformShell from './PlatformShell';
import MetricCard from './MetricCard';
import ContentCard from './ContentCard';
import MiniListCard from './MiniListCard';
import ChartPlaceholderCard from './ChartPlaceholderCard';

type Role = 'ADMIN' | 'MARKETING' | 'SALES';

export default function PlatformLayoutPreview() {
  const [activeRole, setActiveRole] = useState<Role>('ADMIN');

  // Sidebar items based on role
  const sidebarItems = [
    { name: 'لوحة التحكم', href: '#', icon: '📊', isActive: true, roles: ['ADMIN', 'MARKETING', 'SALES'] },
    { name: 'العملاء', href: '#', icon: '👥', roles: ['ADMIN', 'SALES'] },
    { name: 'المشاريع', href: '#', icon: '🏢', roles: ['ADMIN'] },
    { name: 'الحملات', href: '#', icon: '🚀', roles: ['ADMIN', 'MARKETING'] },
    { name: 'المهام', href: '#', icon: '✅', roles: ['ADMIN', 'SALES'] },
    { name: 'التقارير', href: '#', icon: '📈', roles: ['ADMIN', 'MARKETING'] },
    { name: 'الإعدادات', href: '#', icon: '⚙️', roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(activeRole));

  // Mock Data
  const recentLeads = [
    { id: 1, title: 'سارة أحمد', subtitle: 'sarah@example.com', source: 'Google Ads', status: 'جديد', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 2, title: 'شركة التقنية', subtitle: 'info@tech.com', source: 'Direct', status: 'مباع', badgeColor: 'bg-green-100 text-green-800' },
    { id: 3, title: 'خالد محمد', subtitle: '0551234567', source: 'Snapchat', status: 'تم التواصل', badgeColor: 'bg-yellow-100 text-yellow-800' },
    { id: 4, title: 'مؤسسة الأفق', subtitle: 'contact@horizon.com', source: 'Organic', status: 'مهتم', badgeColor: 'bg-purple-100 text-purple-800' },
  ];

  const pendingTasks = [
    { id: 1, title: 'اتصال مع خالد', subtitle: 'متابعة العرض', badge: 'اليوم', badgeColor: 'bg-red-100 text-red-800' },
    { id: 2, title: 'إرسال العقد لشركة التقنية', subtitle: 'المسودة جاهزة', badge: 'غداً', badgeColor: 'bg-orange-100 text-orange-800' },
    { id: 3, title: 'زيارة موقع مع سارة', subtitle: 'مشروع وسط المدينة', badge: 'الأسبوع القادم', badgeColor: 'bg-gray-100 text-gray-800' },
  ];
  
  const scheduledVisits = [
    { id: 1, title: 'زيارة مشروع أ', subtitle: 'الساعة 10:00 ص', badge: 'مؤكد', badgeColor: 'bg-green-100 text-green-800' },
    { id: 2, title: 'معاينة مكتب ب', subtitle: 'الساعة 2:00 م', badge: 'انتظار', badgeColor: 'bg-yellow-100 text-yellow-800' },
  ];

  // ==========================================
  // Render Functions for Specific Roles
  // ==========================================

  const renderAdminDashboard = () => (
    <>
      {/* Top Row: KPIs (2 cols on mobile) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="إجمالي العملاء" value="1,248" icon="👥" trend={{ value: "+12%", isPositive: true }} />
        <MetricCard label="المشاريع النشطة" value="34" icon="🏢" trend={{ value: "+2", isPositive: true }} />
        <MetricCard label="الحملات النشطة" value="12" icon="🚀" trend={{ value: "مستقر", isPositive: true }} />
        <MetricCard label="المبيعات (الشهر)" value="$45.2k" icon="💰" trend={{ value: "+18%", isPositive: true }} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[250px]">
        <div className="xl:col-span-2 flex flex-col h-full">
          <ChartPlaceholderCard title="أداء الحملات والإيرادات" type="bar" />
        </div>
        <div className="flex flex-col h-full">
          <MiniListCard title="متابعات اليوم" items={pendingTasks} viewAllHref="#" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[300px]">
        <div className="xl:col-span-2 flex flex-col">
          <ContentCard title="أحدث العملاء" action={<button className="text-sm text-primary font-medium hover:underline">عرض الكل</button>} className="h-full">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm text-right text-gray-600 min-w-[500px]">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">الاسم</th>
                    <th className="px-4 py-3 font-medium">التواصل</th>
                    <th className="px-4 py-3 font-medium">المصدر</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{lead.title}</td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{lead.subtitle}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{lead.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${lead.badgeColor}`}>{lead.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
        </div>
        
        <div className="flex flex-col h-full">
          <ChartPlaceholderCard title="مصادر العملاء" type="pie" />
        </div>
      </div>
    </>
  );

  const renderMarketingDashboard = () => (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="الحملات النشطة" value="12" icon="🚀" trend={{ value: "+1", isPositive: true }} />
        <MetricCard label="الطلبات الجديدة" value="45" icon="📥" trend={{ value: "-5%", isPositive: false }} />
        <MetricCard label="الإنفاق الإعلاني" value="$3,200" icon="💸" trend={{ value: "+10%", isPositive: false }} />
        <MetricCard label="النقرات الكلية" value="15,430" icon="🖱️" trend={{ value: "+22%", isPositive: true }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[300px]">
        <div className="xl:col-span-2 flex flex-col h-full">
          <ChartPlaceholderCard title="أداء الحملات التسويقية" type="bar" />
        </div>
        <div className="flex flex-col h-full">
          <ChartPlaceholderCard title="توزيع المنصات الإعلانية" type="pie" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:gap-4 flex-1 min-h-[250px]">
        <ContentCard title="أحدث الطلبات القادمة من الحملات" action={<button className="text-sm text-primary font-medium hover:underline">عرض الكل</button>} className="h-full">
          <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-right text-gray-600 min-w-[500px]">
              <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">التواصل</th>
                  <th className="px-4 py-3 font-medium">المصدر</th>
                  <th className="px-4 py-3 font-medium">الحملة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.slice(0, 3).map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{lead.title}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{lead.subtitle}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{lead.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">Q3_Promo_Campaign</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      </div>
    </>
  );

  const renderSalesDashboard = () => (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="العملاء المسندين" value="86" icon="👥" />
        <MetricCard label="متابعات اليوم" value="14" icon="📞" trend={{ value: "مزدحم", isPositive: false }} />
        <MetricCard label="زيارات مجدولة" value="5" icon="📅" />
        <MetricCard label="فرص ساخنة" value="12" icon="🔥" trend={{ value: "+3", isPositive: true }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[250px]">
        <div className="xl:col-span-1 flex flex-col h-full">
          <MiniListCard title="متابعات اليوم" items={pendingTasks} viewAllHref="#" />
        </div>
        <div className="xl:col-span-1 flex flex-col h-full">
          <MiniListCard title="مواعيد الزيارات" items={scheduledVisits} viewAllHref="#" />
        </div>
        <div className="xl:col-span-1 flex flex-col h-full">
           <ContentCard title="مراحل البيع (Pipeline)" className="h-full">
             <div className="p-4 space-y-3 lg:space-y-4">
               <div>
                 <div className="flex justify-between text-[11px] lg:text-xs mb-1"><span className="font-bold text-gray-700">محتمل</span><span className="font-bold">45</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 lg:h-2"><div className="bg-blue-400 h-1.5 lg:h-2 rounded-full w-[45%]"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[11px] lg:text-xs mb-1"><span className="font-bold text-gray-700">تواصل مبدئي</span><span className="font-bold">25</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 lg:h-2"><div className="bg-yellow-400 h-1.5 lg:h-2 rounded-full w-[25%]"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[11px] lg:text-xs mb-1"><span className="font-bold text-gray-700">زيارة</span><span className="font-bold">10</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 lg:h-2"><div className="bg-purple-400 h-1.5 lg:h-2 rounded-full w-[10%]"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[11px] lg:text-xs mb-1"><span className="font-bold text-gray-700">إغلاق / مباع</span><span className="font-bold">6</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 lg:h-2"><div className="bg-green-400 h-1.5 lg:h-2 rounded-full w-[6%]"></div></div>
               </div>
             </div>
           </ContentCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:gap-4 flex-1 min-h-[300px]">
        <ContentCard title="العملاء المسندين لي" action={<button className="text-sm text-primary font-medium hover:underline">عرض الكل</button>} className="h-full">
          <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-right text-gray-600 min-w-[500px]">
              <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">التواصل</th>
                  <th className="px-4 py-3 font-medium">آخر نشاط</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{lead.title}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{lead.subtitle}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">قبل ساعتين</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${lead.badgeColor}`}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      </div>
    </>
  );

  return (
    <PlatformShell 
      brandName="Generic Platform"
      sidebarItems={sidebarItems}
      topBarTitle="نظرة عامة"
      userSlot={
        <div className="flex items-center gap-2 xl:gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-900 leading-none mb-1">
              {activeRole === 'ADMIN' ? 'المدير العام' : activeRole === 'MARKETING' ? 'فريق التسويق' : 'فريق المبيعات'}
            </div>
            <div className="text-xs text-gray-500 leading-none">{activeRole}</div>
          </div>
          <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm text-sm xl:text-base">
            {activeRole.charAt(0)}
          </div>
        </div>
      }
      sidebarFooterSlot={
        <div className="text-xs text-gray-500 text-center">
          Platform v1.0.0
        </div>
      }
    >
      {/* 
        NOTE: This Role Switcher is for PREVIEW ONLY. 
        In the real application, permissions MUST be enforced 
        server-side (Queries, APIs, Auth Sessions), not just 
        by hiding frontend components.
      */}
      <div className="bg-gray-100/70 rounded-lg p-1.5 flex flex-col sm:flex-row items-center justify-between border border-gray-200/50">
        <div className="hidden sm:block text-[11px] font-semibold text-gray-500 px-2">محاكي התצוגה والتوزيع (Preview Only):</div>
        <div className="flex gap-1 w-full sm:w-auto">
          {(['ADMIN', 'MARKETING', 'SALES'] as Role[]).map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded transition-colors ${activeRole === role ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {activeRole === 'ADMIN' && renderAdminDashboard()}
      {activeRole === 'MARKETING' && renderMarketingDashboard()}
      {activeRole === 'SALES' && renderSalesDashboard()}

    </PlatformShell>
  );
}
