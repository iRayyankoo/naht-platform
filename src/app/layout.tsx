import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "نحت العقارية | CRM",
  description: "نظام إدارة علاقات العملاء لشركة نحت العقارية",
};

import TrackingScripts from "@/components/tracking/TrackingScripts";
import { prisma } from "@/lib/prisma";
import ToastProvider from "@/components/ToastProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const trackingSettings = await prisma.trackingSettings.findUnique({ where: { id: "global" }});

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} antialiased h-full`}>
      <head>
        <TrackingScripts />
      </head>
      <body className="min-h-full flex flex-col font-tajawal bg-gray-50 text-gray-900">
        {trackingSettings?.isCustomScriptsEnabled && trackingSettings.customBodyStartScript && (
          <div dangerouslySetInnerHTML={{ __html: trackingSettings.customBodyStartScript }} />
        )}
        
        {trackingSettings?.isGtmEnabled && trackingSettings.gtmId && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${trackingSettings.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}
        
        <ToastProvider>
          {children}
        </ToastProvider>

        {trackingSettings?.isCustomScriptsEnabled && trackingSettings.customBodyEndScript && (
          <div dangerouslySetInnerHTML={{ __html: trackingSettings.customBodyEndScript }} />
        )}
      </body>
    </html>
  );
}
