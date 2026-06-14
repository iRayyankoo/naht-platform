"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CrmSidebarProps {
  userName: string;
  userRole: string;
}

interface NavLink {
  name: string;
  href: string;
  exact?: boolean;
  disabled?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  links: NavLink[];
}

const allNavGroups: NavGroup[] = [
  {
    id: "dashboard",
    title: "لوحة التحكم",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
    ),
    links: [
      { name: "لوحة التحكم الرئيسية", href: "/crm", exact: true },
    ],
  },
  {
    id: "sales",
    title: "المبيعات والعملاء",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    ),
    links: [
      { name: "العملاء", href: "/crm/leads" },
    ],
  },
  {
    id: "projects",
    title: "إدارة المشاريع",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    ),
    links: [
      { name: "المشاريع والوحدات", href: "/crm/projects" },
    ],
  },
  {
    id: "campaigns",
    title: "الحملات والتتبع",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
    ),
    links: [
      { name: "الحملات التسويقية", href: "/crm/campaigns" },
      { name: "تتبع النقرات", href: "/crm/tracking" },
    ],
  },
  {
    id: "cms",
    title: "إدارة محتوى الموقع",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
    ),
    links: [
      { name: "إعدادات الموقع العامة", href: "/crm/cms/settings" },
      { name: "الصفحة الرئيسية", href: "/crm/cms/homepage" },
      { name: "من نحن", href: "/crm/cms/about" },
      { name: "الخدمات", href: "/crm/cms/services" },
      { name: "الأسئلة الشائعة", href: "/crm/cms/faqs" },
      { name: "الروابط الاجتماعية", href: "/crm/cms/social-links" },
      { name: "صفحة تواصل معنا", href: "/crm/cms/contact" },
    ],
  },
  {
    id: "tracking",
    title: "التتبع والسيو",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
    ),
    links: [
      { name: "إعدادات التتبع", href: "/crm/cms/tracking" },
    ],
  },
  {
    id: "requests",
    title: "الطلبات",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    ),
    links: [
      { name: "طلبات تواصل معنا", href: "/crm/requests/contact" },
      { name: "طلبات الصيانة", href: "/crm/requests/maintenance" },
      { name: "طلبات الموردين", href: "/crm/requests/vendors" },
      { name: "طلبات التوظيف", href: "/crm/requests/careers" },
      { name: "الفرص العقارية", href: "/crm/requests/opportunity" },
    ],
  },
  {
    id: "users",
    title: "المستخدمون",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    ),
    links: [
      { name: "إدارة المستخدمين", href: "/crm/users" },
    ],
  },
];

export default function CrmSidebar({ userName, userRole }: CrmSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  // Filter groups based on user role
  const navGroups = allNavGroups.filter(group => {
    if (userRole === "ADMIN") return true;
    if (userRole === "MARKETING") {
      return group.id !== "users";
    }
    if (userRole === "SALES") {
      return ["dashboard", "sales", "projects"].includes(group.id);
    }
    return false;
  });

  useEffect(() => {
    setMounted(true);
    // 1. Check local storage first
    const saved = localStorage.getItem("crm_sidebar_state");
    let parsed: Record<string, boolean> = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {}
    }

    // 2. Identify the active group based on current URL
    let activeGroupId = "";
    for (const group of navGroups) {
      for (const link of group.links) {
        const l = link as any;
        if (!l.disabled) {
          if (l.exact) {
            if (pathname === l.href) activeGroupId = group.id;
          } else {
            if (pathname.startsWith(l.href)) activeGroupId = group.id;
          }
        }
      }
    }

    // If there is an active group, ensure it's open
    if (activeGroupId) {
      parsed[activeGroupId] = true;
    }

    setOpenGroups(parsed);
  }, [pathname]);

  const toggleGroup = (id: string) => {
    const newState = { ...openGroups, [id]: !openGroups[id] };
    setOpenGroups(newState);
    localStorage.setItem("crm_sidebar_state", JSON.stringify(newState));
  };

  const isActiveLink = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6 shrink-0">
          <h1 className="text-xl font-bold text-primary">نحت العقارية</h1>
        </div>
        <div className="flex-1"></div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6 shrink-0">
        <h1 className="text-xl font-bold text-primary">نحت العقارية</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
        {navGroups.map((group) => {
          const isOpen = !!openGroups[group.id];
          // Check if any link inside is active to highlight the group header slightly if needed
          const hasActiveChild = group.links.some(l => !l.disabled && isActiveLink(l.href, l.exact));

          return (
            <div key={group.id} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold transition-colors ${
                  hasActiveChild ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={hasActiveChild ? "text-primary" : "text-gray-400"}>
                    {group.icon}
                  </span>
                  <span>{group.title}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="mt-1 space-y-1 px-3 pb-2 border-l-2 border-gray-100 ml-4 rtl:ml-0 rtl:mr-4 rtl:border-l-0 rtl:border-r-2">
                  {group.links.map((link, idx) => {
                    if (link.disabled) {
                      return (
                        <div key={idx} className="block px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
                          {link.name}
                        </div>
                      );
                    }
                    const active = isActiveLink(link.href, link.exact);
                    return (
                      <Link
                        key={idx}
                        href={link.href}
                        className={`block px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                          active 
                            ? "bg-primary text-white shadow-sm" 
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 shrink-0 bg-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="mr-3 rtl:mr-0 rtl:ml-3">
            <p className="text-sm font-bold text-gray-900">{userName}</p>
            <p className="text-xs font-medium text-gray-500 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
