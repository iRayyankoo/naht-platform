/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isValidPhone } from "@/lib/contact-helpers";

interface PublicHeaderProps {
  siteName: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  headerCtaText?: string | null;
  headerCtaUrl?: string | null;
  contactPhone?: string | null;
}

export default function PublicHeader({
  siteName,
  logoUrl,
  logoDarkUrl,
  headerCtaText,
  headerCtaUrl,
  contactPhone,
}: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const hasPhone = isValidPhone(contactPhone);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المشاريع", href: "/projects" },
    { name: "سجل للمشروع", href: "/#contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (path.startsWith("/#")) return false;
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ${
    isTransparent
      ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5 text-white"
      : "bg-[#F7F3EB]/95 backdrop-blur-md shadow-sm border-b border-[#A6937C]/15 py-3 text-[#4F4949]"
  }`;

  const activeLogo = isTransparent
    ? logoDarkUrl || "/images/brand/logo-white.png"
    : logoUrl || logoDarkUrl || "/images/brand/logo-white.png";

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 z-50 group">
          <img
            src={activeLogo}
            alt={siteName || "نحت العقارية"}
            className="h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium tracking-wide transition-all duration-200 relative py-1 ${
                  active
                    ? isTransparent
                      ? "text-white font-bold after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-full after:h-0.5 after:bg-white"
                      : "text-[#A6937C] font-bold after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-full after:h-0.5 after:bg-[#A6937C]"
                    : isTransparent
                    ? "text-white/90 hover:text-white"
                    : "text-[#4F4949] hover:text-[#A6937C]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Phone */}
        <div className="hidden md:flex items-center gap-4">
          {hasPhone && (
            <a
              href={`tel:${contactPhone}`}
              className={`text-sm font-semibold flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                isTransparent ? "text-white/90 hover:text-white bg-white/10" : "text-[#4F4949] hover:text-[#A6937C] bg-[#A6937C]/10"
              }`}
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span dir="ltr">{contactPhone}</span>
            </a>
          )}
          <Link
            href={headerCtaUrl || "/#contact"}
            className="text-sm font-semibold px-6 py-2.5 rounded-md transition-all duration-300 shadow-sm text-white"
            style={{ backgroundColor: "var(--brand-primary, #B5B693)" }}
          >
            {headerCtaText || "سجل اهتمامك"}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="فتح القائمة الرئيسية"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          className={`md:hidden p-2 -mr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6937C] z-50 ${
            isTransparent ? "text-white" : "text-[#4F4949]"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-7 h-7" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            id="mobile-navigation-drawer"
            className="absolute top-0 right-0 w-[80%] max-w-sm h-full bg-[#F7F3EB] text-[#4F4949] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#A6937C]/20">
                <img src={activeLogo} alt={siteName || "نحت العقارية"} className="h-10 w-auto bg-[#4F4949] p-2 rounded-md" />
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="إغلاق القائمة"
                  className="p-2 text-[#4F4949] hover:text-[#A6937C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A6937C]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                >
                  <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col space-y-4" aria-label="تنقل الجوال">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                      isActive(link.href) ? "bg-[#A6937C]/15 text-[#A6937C] font-bold" : "text-[#4F4949] hover:bg-[#A6937C]/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#A6937C]/20 space-y-4">
              {hasPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white border border-[#A6937C]/30 text-[#4F4949] font-bold text-sm"
                >
                  <svg className="w-4 h-4 text-[#A6937C]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span dir="ltr">{contactPhone}</span>
                </a>
              )}

              <Link
                href={headerCtaUrl || "/#contact"}
                className="block text-center text-sm font-bold text-white bg-[#B5B693] hover:bg-[#9D9E7B] py-3.5 rounded-lg shadow-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {headerCtaText || "سجل اهتمامك"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
