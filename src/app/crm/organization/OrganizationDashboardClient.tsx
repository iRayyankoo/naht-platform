"use client";

import Link from "next/link";
import { Users, Building2, UserMinus, ShieldAlert } from "@/components/crm/organization/icons";

interface OverviewData {
  totalDepartments: number;
  activeMembers: number;
  unassignedMembers: number;
  departmentsWithoutManager: number;
}

export default function OrganizationDashboardClient({ overview, scope }: { overview: OverviewData, scope: "COMPANY" | "DEPARTMENT" }) {
  const cards = [
    {
      title: "إجمالي الأقسام",
      value: overview.totalDepartments,
      icon: <Building2 className="w-8 h-8 text-blue-500" />,
      bg: "bg-blue-50",
      link: "/crm/organization/departments"
    },
    {
      title: "الأعضاء النشطين",
      value: overview.activeMembers,
      icon: <Users className="w-8 h-8 text-green-500" />,
      bg: "bg-green-50",
      link: "/crm/organization/members"
    }
  ];

  if (scope === "COMPANY") {
    cards.push({
      title: "غير معينين بقسم",
      value: overview.unassignedMembers,
      icon: <UserMinus className="w-8 h-8 text-yellow-500" />,
      bg: "bg-yellow-50",
      link: "/crm/organization/members?status=unassigned"
    });
    cards.push({
      title: "أقسام بلا مدير",
      value: overview.departmentsWithoutManager,
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      bg: "bg-red-50",
      link: "/crm/organization/departments?status=nomanager"
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">نظرة عامة على الهيكل التنظيمي</h1>
        <p className="text-gray-500 mt-1">
          {scope === "COMPANY" ? "إحصائيات كامل الشركة" : "إحصائيات الأقسام التي تديرها"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.link} className="block transition-transform hover:scale-[1.02]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
