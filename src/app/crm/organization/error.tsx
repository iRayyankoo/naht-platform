"use client";

import { useEffect } from "react";
import { AlertTriangle } from "@/components/crm/organization/icons";

export default function OrganizationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ ما</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        {error.message.includes("Access Denied") || error.message.includes("Unauthorized") 
          ? "ليس لديك الصلاحية الكافية لعرض هذه الصفحة أو المورد." 
          : "لم نتمكن من تحميل البيانات المطلوبة. يرجى المحاولة مرة أخرى لاحقاً."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
