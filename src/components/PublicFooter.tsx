/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isValidPhone, isValidEmail } from "@/lib/contact-helpers";

export default async function PublicFooter() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  const socials = await prisma.socialLink.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } });
  const footerLinks = await prisma.footerLink.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } });

  const currentYear = new Date().getFullYear();
  const rawName = settings?.footerCompanyName || settings?.siteName || "نحت العقارية";
  const companyName = rawName.replace(/\s*-\s*معاينة/g, "");
  const copyright = settings?.copyrightText
    ? `${settings.copyrightText} © ${currentYear} ${companyName}.`
    : `جميع الحقوق محفوظة © ${currentYear} ${companyName}.`;

  const phone = settings?.contactPhone || null;
  const email = settings?.contactEmail || null;
  const address = settings?.address || null;

  const hasPhone = isValidPhone(phone);
  const hasEmail = isValidEmail(email);
  const hasAddress = Boolean(address && address.trim());

  const logo = settings?.footerLogoUrl || settings?.logoUrl || "/images/brand/logo-white.png";

  return (
    <footer className="bg-[#4F4949] text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-12">
        <div className="md:col-span-5 text-center md:text-right">
          <Link href="/" className="inline-block mb-6">
            <img src={logo} alt={companyName} className="h-12 w-auto object-contain" />
          </Link>
          <p className="text-[#F7F3EB]/80 text-sm leading-relaxed mb-6 max-w-md mx-auto md:mx-0 font-light">
            {settings?.footerDescription ||
              settings?.footerText ||
              "نسعى بصفتنا شركة رائدة في خدمات التطوير العقاري إلى رسم مستقبل المجتمعات العمرانية عبر حلول مبتكرة ومستدامة."}
          </p>
          {socials.length > 0 && (
            <div className="flex justify-center md:justify-start gap-3">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-[#A6937C] transition-all duration-300"
                  title={s.platformName}
                >
                  {s.icon ? (
                    <span dangerouslySetInnerHTML={{ __html: s.icon }} className="w-4 h-4 flex items-center justify-center" />
                  ) : (
                    <span className="text-xs font-bold">{s.platformName.charAt(0)}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 text-center md:text-right">
          <h4 className="text-base font-bold mb-4 text-[#A6937C] tracking-wide relative inline-block">
            روابط هامة
          </h4>
          <ul className="space-y-3 text-sm text-[#F7F3EB]/80">
            {footerLinks.length > 0 ? (
              footerLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noreferrer" : undefined}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    المشاريع
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-white transition-colors">
                    سجل للمشروع
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {(hasAddress || hasPhone || hasEmail) && (
          <div className="md:col-span-4 text-center md:text-right">
            <h4 className="text-base font-bold mb-4 text-[#A6937C] tracking-wide relative inline-block">
              تواصل معنا
            </h4>
            <ul className="space-y-4 text-sm text-[#F7F3EB]/80">
              {hasAddress && (
                <li className="flex items-start justify-center md:justify-start gap-3">
                  <svg className="w-5 h-5 text-[#A6937C] shrink-0 mt-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{address}</span>
                </li>
              )}
              {hasPhone && (
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <svg className="w-5 h-5 text-[#A6937C] shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href={`tel:${phone}`} className="font-bold hover:text-white" dir="ltr">
                    {phone}
                  </a>
                </li>
              )}
              {hasEmail && (
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <svg className="w-5 h-5 text-[#A6937C] shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F7F3EB]/60">
        <p>{copyright}</p>
        <Link href="/auth/login" className="hover:text-white transition-colors">
          بوابة الموظفين
        </Link>
      </div>
    </footer>
  );
}
