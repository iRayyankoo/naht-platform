import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicHeader from "@/components/PublicHeader";
import FloatingCTAs from "@/components/FloatingCTAs";
import PublicFooter from "@/components/PublicFooter";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  const socials = await prisma.socialLink.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } });

  // Convert Hex to RGB for Tailwind opacity support
  const hexToRgbString = (hex: string) => {
    if (!hex) return null;
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const parsedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(parsedHex);
    return result 
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` 
      : null;
  };

  const primaryRgb = hexToRgbString(settings?.primaryColor || "");
  const secondaryRgb = hexToRgbString(settings?.secondaryColor || "");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Brand Theme CSS Variables Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${settings?.primaryColor ? `--color-primary-override: ${settings.primaryColor};` : ''}
            ${primaryRgb ? `--color-primary-rgb-override: ${primaryRgb};` : ''}
            ${settings?.secondaryColor ? `--color-secondary-override: ${settings.secondaryColor};` : ''}
            ${secondaryRgb ? `--color-secondary-rgb-override: ${secondaryRgb};` : ''}
            ${settings?.accentColor ? `--color-accent-override: ${settings.accentColor};` : ''}
            ${settings?.darkBgColor ? `--color-dark-bg-override: ${settings.darkBgColor};` : ''}
            ${settings?.buttonColor ? `--color-button-override: ${settings.buttonColor};` : ''}
            ${settings?.textColor ? `--color-text-override: ${settings.textColor};` : ''}
            ${settings?.borderColor ? `--color-border-override: ${settings.borderColor};` : ''}
          }
        `
      }} />

      <PublicHeader 
        siteName={settings?.siteName || "نحت العقارية"} 
        logoUrl={settings?.logoUrl} 
        logoDarkUrl={settings?.logoDarkUrl} 
        headerCtaText={settings?.headerCtaText}
        headerCtaUrl={settings?.headerCtaUrl}
      />
      
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      <FloatingCTAs 
        whatsappUrl={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} 
        phoneNumber={settings?.contactPhone} 
      />

      <PublicFooter />
    </div>
  );
}
