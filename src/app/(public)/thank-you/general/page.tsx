import Link from "next/link";

export default function GeneralThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">شكراً لاهتمامك!</h2>
        <p className="mt-2 text-sm text-gray-600">
          لقد استلمنا طلبك بنجاح. سيقوم أحد مستشارينا العقاريين بالتواصل معك في أقرب وقت ممكن.
        </p>
        <div className="mt-8">
          <Link href="/" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
