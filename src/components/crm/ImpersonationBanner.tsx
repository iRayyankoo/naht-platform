import React from "react";
import type { ImpersonationRuntimeContext } from "@/lib/impersonation-helpers";

interface ImpersonationBannerProps {
  context: ImpersonationRuntimeContext | null;
}

export function ImpersonationBanner({ context }: ImpersonationBannerProps) {
  if (!context) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between z-50 sticky top-0">
      <div className="flex items-center text-amber-800 text-sm font-medium">
        <svg className="w-5 h-5 ml-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {context.mode === "ROLE" ? (
          <span>أنت في وضع اختبار دور: <strong>{context.targetRoleKey}</strong></span>
        ) : (
          <span>أنت الآن تتقمص المستخدم: <strong>{context.userLabel || context.targetUserId}</strong></span>
        )}
      </div>
      <button
        disabled
        className="text-amber-700 hover:text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center opacity-50 cursor-not-allowed"
      >
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        إنهاء التقمص
      </button>
    </div>
  );
}
