import Link from "next/link";

export default function ThankYouCareers() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-20 px-6">
      <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">تم استلام طلب التوظيف بنجاح!</h1>
        <p className="text-lg text-gray-600 mb-8">
          شكراً لاهتمامك بالانضمام لفريق نحت العقارية. سيقوم قسم الموارد البشرية بمراجعة سيرتك الذاتية والتواصل معك في حال مطابقة مؤهلاتك للشواغر المتاحة.
        </p>
        <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
