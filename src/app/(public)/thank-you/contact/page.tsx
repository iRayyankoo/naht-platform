import Link from "next/link";

export default function ThankYouContact() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-20 px-6">
      <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">تم استلام رسالتك بنجاح!</h1>
        <p className="text-lg text-gray-600 mb-8">
          شكراً لتواصلك معنا. سيقوم فريقنا بمراجعة رسالتك والتواصل معك في أقرب وقت ممكن.
        </p>
        <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
