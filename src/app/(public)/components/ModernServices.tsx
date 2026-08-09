import React from "react";
import { Service } from "@prisma/client";

interface ModernServicesProps {
  services: Service[];
}

const defaultIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function ModernServices({ services }: ModernServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-20 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12 md:mb-16 text-right">
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="px-4 py-1.5 rounded-full border border-gray-800 bg-[#151a25] text-sm text-gray-300 font-medium">
              خدماتنا
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            ما الذي نقدمه لك
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (

            <div
              key={service.id}
              className="group bg-[#151a25] border border-gray-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-brand-cafe/10 border border-brand-cafe/20 flex items-center justify-center text-brand-cafe group-hover:bg-brand-cafe group-hover:text-white transition-all duration-300">
                {service.icon ? (
                  <span className="text-xl">{service.icon}</span>
                ) : defaultIcon}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-cafe transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
