"use client";

import React, { useState } from 'react';
import AdminSidebar, { SidebarItem } from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface PlatformShellProps {
  brandName?: string;
  sidebarItems: SidebarItem[];
  topBarTitle?: string;
  userSlot?: React.ReactNode;
  sidebarFooterSlot?: React.ReactNode;
  children: React.ReactNode;
}

export default function PlatformShell({ 
  brandName, 
  sidebarItems, 
  topBarTitle, 
  userSlot,
  sidebarFooterSlot,
  children 
}: PlatformShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/50 text-gray-900 overflow-hidden font-sans dir-rtl">
      {/* Sidebar */}
      <AdminSidebar 
        brandName={brandName} 
        items={sidebarItems} 
        footerSlot={sidebarFooterSlot} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <AdminTopBar 
          title={topBarTitle} 
          userSlot={userSlot} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-3 xl:p-6 w-full">
          <div className="w-full max-w-[1400px] mx-auto flex flex-col space-y-3 xl:space-y-4 pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
