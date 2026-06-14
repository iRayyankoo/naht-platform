import Link from "next/link";

export default function ThankYouOpportunity() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-20 px-6">
      <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">تم استلام الفرصة العقارية بنجاح!</h1>
        <p className="text-lg text-gray-600 mb-8">
          شكراً لثقتكم بنا. سيقوم فريق تطوير الأعمال بدراسة الفرصة المقدمة والتواصل معكم لمناقشة التفاصيل.
        </p>
        <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
