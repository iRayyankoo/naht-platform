"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublicHeaderProps {
  siteName: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}

export default function PublicHeader({ siteName, logoUrl, logoDarkUrl }: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "من نحن", href: "/about" },
    { name: "خدماتنا", href: "/services" },
    { name: "المشاريع", href: "/projects" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  // Determine header style based on page and scroll
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;
  
  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ${
    isTransparent 
      ? "bg-transparent py-6 border-transparent" 
      : "bg-white border-b border-gray-100 py-4 shadow-sm"
  }`;

  const textClasses = isTransparent ? "text-white" : "text-gray-800";
  const hoverClasses = isTransparent ? "hover:text-gray-300" : "hover:text-primary";
  const activeClasses = isTransparent ? "text-white border-b-2 border-white pb-1" : "text-primary font-bold";

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className={`text-2xl font-bold flex items-center z-50 ${isTransparent ? 'text-white' : 'text-primary'}`}>
          {(logoUrl || logoDarkUrl) ? (
            <img 
              src={(isTransparent && logoDarkUrl) ? logoDarkUrl : (logoUrl || logoDarkUrl || "")} 
              alt={siteName} 
              className={`h-10 md:h-12 transition-all ${(isTransparent && !logoDarkUrl) ? 'brightness-0 invert' : ''}`} 
            />
          ) : siteName}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-base tracking-widest transition-colors ${active ? activeClasses : `${textClasses} ${hoverClasses}`}`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link 
            href="/auth/login" 
            className={`text-sm font-bold tracking-wide border rounded-none px-8 py-3 ml-4 transition-all duration-300 ${
              isTransparent 
                ? "border-white/50 text-white hover:border-white hover:bg-white hover:text-gray-900" 
                : "border-gray-300 text-gray-700 hover:border-primary hover:bg-primary hover:text-white"
            }`}
          >
            بوابة الشركاء
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className={`md:hidden p-2 -mr-2 focus:outline-none z-50 ${isTransparent ? 'text-white' : 'text-gray-600 hover:text-primary'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col px-6 py-6 space-y-6">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-xl font-medium ${isActive(link.href) ? "text-primary font-bold" : "text-gray-600"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-gray-100">
              <Link 
                href="/auth/login" 
                className="block text-center text-lg font-bold text-white bg-primary rounded-none px-4 py-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                بوابة الشركاء
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
