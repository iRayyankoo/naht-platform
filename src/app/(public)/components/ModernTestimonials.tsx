/* eslint-disable @next/next/no-img-element */
import React from "react";


interface TestimonialItem {
  id: string;
  name: string;
  title?: string | null;
  content: string;
  rating: number;
  avatarUrl?: string | null;
}

interface ModernTestimonialsProps {
  testimonials?: TestimonialItem[];
}


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ModernTestimonials({ testimonials }: ModernTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 bg-[#0b0f19]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12 md:mb-16 text-right">
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="px-4 py-1.5 rounded-full border border-gray-800 bg-[#151a25] text-sm text-gray-300 font-medium">
              آراء عملائنا
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            ماذا يقول عملاؤنا
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#151a25] border border-gray-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 hover:border-gray-600 transition-colors"
            >
              <StarRating rating={t.rating} />

              <p className="text-gray-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  {t.title && <p className="text-gray-500 text-xs">{t.title}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
