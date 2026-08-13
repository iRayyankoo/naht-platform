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
    <div className="public-site-root flex flex-col min-h-screen bg-[#F7F3EB]">
      {/* Brand Theme CSS Variables Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .public-site-root {
            ${settings?.primaryColor ? `--brand-primary: ${settings.primaryColor}; --color-primary-override: ${settings.primaryColor};` : ""}
            ${primaryRgb ? `--color-primary-rgb-override: ${primaryRgb};` : ""}
            ${settings?.secondaryColor ? `--brand-secondary: ${settings.secondaryColor}; --color-secondary-override: ${settings.secondaryColor};` : ""}
            ${secondaryRgb ? `--color-secondary-rgb-override: ${secondaryRgb};` : ""}
            ${settings?.accentColor ? `--brand-accent: ${settings.accentColor}; --color-accent-override: ${settings.accentColor};` : ""}
            ${settings?.darkBgColor ? `--brand-dark-bg: ${settings.darkBgColor}; --color-dark-bg-override: ${settings.darkBgColor};` : ""}
            ${settings?.buttonColor ? `--brand-button: ${settings.buttonColor}; --color-button-override: ${settings.buttonColor};` : ""}
            ${settings?.textColor ? `--brand-text: ${settings.textColor}; --color-text-override: ${settings.textColor};` : ""}
            ${settings?.borderColor ? `--brand-border: ${settings.borderColor}; --color-border-override: ${settings.borderColor};` : ""}
          }
        `,
        }}
      />

      <PublicHeader
        siteName={settings?.siteName || "نحت العقارية"}
        logoUrl={settings?.logoUrl}
        logoDarkUrl={settings?.logoDarkUrl}
        headerCtaText={settings?.headerCtaText}
        headerCtaUrl={settings?.headerCtaUrl}
        contactPhone={settings?.contactPhone}
      />

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <FloatingCTAs
        whatsappUrl={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}` : undefined}
        phoneNumber={settings?.contactPhone}
      />

      <PublicFooter />
    </div>
  );
}
