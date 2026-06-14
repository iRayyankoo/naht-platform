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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader siteName={settings?.siteName || "نحت العقارية"} logoUrl={settings?.logoUrl} />
      
      <main className="flex-1">
        {children}
      </main>

      <FloatingCTAs 
        whatsappUrl={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} 
        phoneNumber={settings?.contactPhone} 
      />

      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-4">{settings?.siteName || "نحت الأصول العقارية"}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-sm mx-auto md:mx-0">
              {settings?.footerText || "رؤية طموحة لمستقبل التطوير العقاري في المملكة العربية السعودية."}
            </p>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-primary-light">روابط هامة</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors block py-1">من نحن</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors block py-1">خدماتنا</Link></li>
              <li><Link href="/projects" className="hover:text-white transition-colors block py-1">مشاريعنا</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors block py-1">بوابة الشركاء</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-primary-light">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {settings?.contactPhone && <li className="flex items-center justify-center md:justify-start gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><span dir="ltr">{settings.contactPhone}</span></li>}
              {settings?.contactEmail && <li className="flex items-center justify-center md:justify-start gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{settings.contactEmail}</li>}
              {settings?.address && <li className="flex items-start justify-center md:justify-start gap-2"><svg className="w-4 h-4 text-gray-400 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{settings.address}</li>}
            </ul>
            {socials.length > 0 && (
              <div className="mt-8 flex justify-center md:justify-start space-x-4 space-x-reverse">
                {socials.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-colors" title={s.platformName}>
                    {s.icon ? <span dangerouslySetInnerHTML={{__html: s.icon}} className="w-5 h-5 block" /> : <span className="text-xs font-bold">{s.platformName.charAt(0)}</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">{settings?.copyrightText || `جميع الحقوق محفوظة © ${new Date().getFullYear()} شركة نحت الأصول العقارية.`}</p>
        </div>
      </footer>
    </div>
  );
}
