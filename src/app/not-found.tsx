import Link from "next/link";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6 py-16 text-white"
    >
      {/* Decorative top line */}
      <div className="w-16 h-1 bg-[#D4AF37] rounded-full mb-10" />

      {/* 404 Number */}
      <p className="text-[120px] md:text-[160px] font-black leading-none text-[#D4AF37] opacity-15 select-none">
        404
      </p>

      {/* Icon */}
      <div className="mt-[-40px] mb-6 w-20 h-20 rounded-full border-2 border-[#D4AF37]/40 flex items-center justify-center bg-white/5 backdrop-blur-sm">
        <svg
          className="w-9 h-9 text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
        الصفحة غير موجودة
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-center text-sm md:text-base max-w-md leading-relaxed mb-10">
        الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله.
        <br />
        يمكنك العودة للرئيسية أو استعراض مشاريعنا.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href="/"
          className="flex-1 text-center bg-[#D4AF37] hover:bg-[#c49d2d] text-black font-bold py-3 px-6 rounded-xl transition-colors text-sm"
        >
          العودة للرئيسية
        </Link>
        <Link
          href="/projects"
          className="flex-1 text-center border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] font-bold py-3 px-6 rounded-xl transition-colors text-sm"
        >
          استعراض المشاريع
        </Link>
      </div>

      {/* Bottom brand */}
      <p className="mt-16 text-xs text-gray-600 font-medium tracking-wider uppercase">
        نحت العقارية
      </p>
    </div>
  );
}
