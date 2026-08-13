import React from "react";
import { Service } from "@prisma/client";

interface ModernServicesProps {
  services: Service[];
}

function renderServiceIcon(iconStr?: string | null) {
  if (!iconStr) {
    return (
      <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4M9 11h-4" />
      </svg>
    );
  }

  if (iconStr.includes("<svg")) {
    return <span dangerouslySetInnerHTML={{ __html: iconStr }} className="w-6 h-6 flex items-center justify-center" aria-hidden="true" />;
  }

  const lower = iconStr.toLowerCase().trim();

  if (lower.includes("key") || lower.includes("مفتاح")) {
    return (
      <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  }

  if (lower.includes("megaphone") || lower.includes("تسويق") || lower.includes("إعلان")) {
    return (
      <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    );
  }

  if (lower.includes("building") || lower.includes("مبنى") || lower.includes("تطوير")) {
    return (
      <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 01-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4M9 11h-4" />
      </svg>
    );
  }

  return (
    <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4M9 11h-4" />
    </svg>
  );
}

export default function ModernServices({ services }: ModernServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-20 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4F4949]">
            خدماتنا العقارية
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#A6937C]/20 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F7F3EB] border border-[#A6937C]/20 flex items-center justify-center text-[#A6937C]">
                {renderServiceIcon(service.icon)}
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#4F4949] mb-2">
                  {service.title}
                </h3>
                <p className="text-[#4F4949]/80 text-sm leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
