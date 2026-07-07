import React from 'react';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">ليس لديك صلاحية الوصول لهذه الصفحة</h2>
      <p className="text-gray-500 max-w-md mb-8">
        إذا كنت تعتقد أن هذا خطأ، تواصل مع مدير النظام للتحقق من الصلاحيات الممنوحة لحسابك.
      </p>
      <Link 
        href="/crm"
        className="px-6 py-3 bg-brand-primary text-white rounded-md font-medium hover:bg-brand-primary/90 transition-colors"
      >
        العودة للوحة التحكم
      </Link>
    </div>
  );
}
