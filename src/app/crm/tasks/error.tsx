"use client";

import React, { useEffect } from 'react';

export default function TasksError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-6 items-center justify-center" dir="rtl">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ أثناء تحميل المهام</h2>
          <p className="text-sm text-gray-500 mb-6">{error.message || 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.'}</p>
          <button
             onClick={reset}
             className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors w-full"
          >
             المحاولة مرة أخرى
          </button>
       </div>
    </div>
  );
}
