import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicHeader from "@/components/PublicHeader";
import FloatingCTAs from "@/components/FloatingCTAs";

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

      <PublicHeader siteName={settings?.siteName || "نحت العقارية"} logoUrl={settings?.logoUrl} logoDarkUrl={settings?.logoDarkUrl} />
      
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      <FloatingCTAs 
        whatsappUrl={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} 
        phoneNumber={settings?.contactPhone} 
      />

      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-gray-800 pb-16">
          <div className="md:col-span-5 text-center md:text-right">
            <Link href="/" className="inline-block mb-6">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-12 object-contain" />
              ) : (
                <h3 className="text-2xl font-bold tracking-tight">{settings?.siteName || "نحت الأصول العقارية"}</h3>
              )}
            </Link>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0 font-light">
              {settings?.footerText || "رؤية طموحة لمستقبل التطوير العقاري في المملكة العربية السعودية. نبني مساحات تلهم الحياة وترتقي بجودة المعيشة نحو آفاق جديدة."}
            </p>
            {socials.length > 0 && (
              <div className="flex justify-center md:justify-start gap-3">
                {socials.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:border-primary transition-all duration-300" title={s.platformName}>
                    {s.icon ? <span dangerouslySetInnerHTML={{__html: s.icon}} className="w-4 h-4 flex items-center justify-center" /> : <span className="text-xs font-bold">{s.platformName.charAt(0)}</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-3 text-center md:text-right">
            <h4 className="text-lg font-bold mb-6 text-white tracking-wide relative inline-block">
              روابط هامة
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-base text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors inline-block hover:-translate-x-1 duration-300">الرئيسية</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors inline-block hover:-translate-x-1 duration-300">من نحن</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors inline-block hover:-translate-x-1 duration-300">خدماتنا</Link></li>
              <li><Link href="/projects" className="hover:text-primary transition-colors inline-block hover:-translate-x-1 duration-300">مشاريعنا</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors inline-block hover:-translate-x-1 duration-300">التوظيف</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 text-center md:text-right">
            <h4 className="text-lg font-bold mb-6 text-white tracking-wide relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-5 text-base text-gray-400">
              {settings?.address && (
                <li className="flex items-start justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <span className="pt-2 leading-relaxed">{settings.address}</span>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <span className="pt-1 font-bold tracking-wider" dir="ltr">{settings.contactPhone}</span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <a href={`mailto:${settings.contactEmail}`} className="pt-1 hover:text-white transition-colors">{settings.contactEmail}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{settings?.copyrightText || `جميع الحقوق محفوظة © ${new Date().getFullYear()} شركة نحت الأصول العقارية.`}</p>
          <div className="flex gap-6">
            <Link href="/auth/login" className="hover:text-white transition-colors">بوابة الموظفين</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
