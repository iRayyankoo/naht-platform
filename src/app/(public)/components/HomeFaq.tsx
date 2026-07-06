"use client";

import { Faq } from "@prisma/client";
import { useState } from "react";

export default function HomeFaq({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs.length > 0 ? faqs[0].id : null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-transparent h-full flex flex-col">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">الأسئلة الشائعة</h2>
        <div className="w-16 h-1 bg-[#D4AF37] mb-6"></div>
          <p className="text-lg text-gray-500 font-light">إجابات وافية لأهم التساؤلات حول خدماتنا ومشاريعنا.</p>
        </div>

        <div className="space-y-0 border-y border-gray-100">
          {faqs.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="border-b border-gray-100 last:border-b-0 overflow-hidden"
              >
                <button 
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-right py-6 flex items-center justify-between gap-4 focus:outline-none group"
                >
                  <span className={`text-xl font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-900 group-hover:text-gray-600'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'}`}
                >
                  <div className="text-gray-500 leading-relaxed text-lg font-light pl-12">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}
