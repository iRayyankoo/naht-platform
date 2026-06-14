"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublicHeaderProps {
  siteName: string;
  logoUrl?: string | null;
}

export default function PublicHeader({ siteName, logoUrl }: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <header className="bg-white border-b border-gray-100 py-3 px-6 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary flex items-center z-50">
          {logoUrl ? <img src={logoUrl} alt={siteName} className="h-10 md:h-12" /> : siteName}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`font-medium transition-colors ${isActive(link.href) ? "text-primary" : "text-gray-600 hover:text-primary"}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 rounded-md px-4 py-2 hover:border-primary transition-colors">
            بوابة الشركاء
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-primary focus:outline-none z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-lg font-medium ${isActive(link.href) ? "text-primary" : "text-gray-600"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <Link 
                href="/auth/login" 
                className="block text-center text-sm font-medium text-white bg-primary rounded-md px-4 py-3"
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
