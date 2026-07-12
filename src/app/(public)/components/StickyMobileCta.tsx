"use client";

import { useEffect, useState } from "react";
import TrackedButton from "@/components/TrackedButton";

export default function StickyMobileCta({ whatsappNumber, contactPhone }: { whatsappNumber?: string | null, contactPhone?: string | null }) {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling past the hero section (approx 500px)
      setIsPastHero(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Safely select the contact form (the only form on the home page)
    const formElement = document.querySelector('form');

    if (!formElement) return;

    // Intersection Observer to detect if the contact form is visible in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Hide the CTA if any part of the form is visible
        setIsFormVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      }
    );

    observer.observe(formElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!whatsappNumber && !contactPhone) return null;

  // Show only if we scrolled past the hero AND the contact form is NOT visible
  const shouldShow = isPastHero && !isFormVisible;

  return (
    <div
      className={`fixed bottom-6 left-4 right-4 z-50 md:hidden transform transition-all duration-500 ease-in-out motion-reduce:transition-none ${
        shouldShow ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex gap-3 bg-white/95 backdrop-blur-xl p-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100">
        {whatsappNumber && (
          <TrackedButton
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
            targetContact={whatsappNumber}
            actionType="WHATSAPP"
            className="flex-1 bg-green-500/90 hover:bg-green-500 text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path></svg>
            واتس آب
          </TrackedButton>
        )}
        {contactPhone && (
          <TrackedButton
            href={`tel:${contactPhone}`}
            targetContact={contactPhone}
            actionType="CALL"
            className="flex-1 bg-gray-950/90 hover:bg-gray-950 text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            اتصال
          </TrackedButton>
        )}
      </div>
    </div>
  );
}
