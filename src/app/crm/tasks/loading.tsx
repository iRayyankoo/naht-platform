import React from 'react';

export default function TasksLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-6" dir="rtl">
       <div className="max-w-7xl mx-auto w-full animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>

          <div className="flex gap-4 mt-8">
             <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
             <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="flex gap-6 mt-6">
             <div className="h-[400px] w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
             <div className="h-[400px] w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
             <div className="h-[400px] w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
          </div>
       </div>
    </div>
  );
}
