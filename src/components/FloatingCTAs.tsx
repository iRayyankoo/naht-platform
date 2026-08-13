"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TrackedButton from "./TrackedButton";
import { isValidWhatsapp, isValidPhone } from "@/lib/contact-helpers";

interface FloatingCTAsProps {
  whatsappUrl?: string | null;
  phoneNumber?: string | null;
}

export default function FloatingCTAs({ whatsappUrl, phoneNumber }: FloatingCTAsProps) {
  const pathname = usePathname();
  const hasValidWp = isValidWhatsapp(whatsappUrl);
  const hasValidPh = isValidPhone(phoneNumber);

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (path.startsWith("/#")) return false;
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Desktop Floating WhatsApp Button — only visible if valid WhatsApp URL */}
      {hasValidWp && (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
          <TrackedButton
            href={whatsappUrl!}
            actionType="WHATSAPP"
            targetContact="FloatingDesktopButton"
            aria-label="تواصل عبر الواتساب"
            className="w-14 h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <svg className="w-8 h-8 fill-current" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </TrackedButton>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F7F3EB]/95 backdrop-blur-md border-t border-[#A6937C]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2">
        <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto text-center">
          {/* الرئيسية */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors ${
              isActive("/") ? "text-[#A6937C] font-bold bg-[#A6937C]/10" : "text-[#4F4949] hover:text-[#A6937C]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-[11px]">الرئيسية</span>
          </Link>

          {/* المشاريع */}
          <Link
            href="/projects"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors ${
              isActive("/projects") ? "text-[#A6937C] font-bold bg-[#A6937C]/10" : "text-[#4F4949] hover:text-[#A6937C]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4M9 11h-4"
              />
            </svg>
            <span className="text-[11px]">المشاريع</span>
          </Link>

          {/* سجل الاهتمام */}
          <Link
            href="/#contact"
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[#4F4949] hover:text-[#A6937C] transition-colors"
          >
            <svg className="w-5 h-5 mb-0.5 text-[#B5B693]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-[11px] font-bold">سجل الاهتمام</span>
          </Link>

          {/* WhatsApp if valid, else Direct Phone or Contact link */}
          {hasValidWp ? (
            <TrackedButton
              href={whatsappUrl!}
              actionType="WHATSAPP"
              targetContact="MobileStickyBottomBar"
              aria-label="تواصل عبر الواتساب"
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            >
              <svg className="w-5 h-5 mb-0.5 fill-current" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="text-[11px] font-bold">واتساب</span>
            </TrackedButton>
          ) : hasValidPh ? (
            <TrackedButton
              href={`tel:${phoneNumber}`}
              actionType="CALL"
              targetContact="MobileStickyBottomBar"
              aria-label="اتصال مباشر"
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[#A6937C] hover:bg-[#A6937C]/10 transition-colors"
            >
              <svg className="w-5 h-5 mb-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-[11px] font-bold">اتصال</span>
            </TrackedButton>
          ) : (
            <Link
              href="/#contact"
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[#4F4949] hover:text-[#A6937C] transition-colors"
            >
              <svg className="w-5 h-5 mb-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[11px]">تواصل</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
