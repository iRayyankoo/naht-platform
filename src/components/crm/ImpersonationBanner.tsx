import React from "react";
import type { ImpersonationRuntimeContext } from "@/lib/impersonation-helpers";
import { stopImpersonationAction } from "@/app/crm/settings/impersonation/actions";
import { redirect } from "next/navigation";

interface ImpersonationBannerProps {
  context: ImpersonationRuntimeContext | null;
}

export function ImpersonationBanner({ context }: ImpersonationBannerProps) {
  if (!context) return null;

  async function handleStop() {
    "use server";
    await stopImpersonationAction();
    redirect("/crm");
  }

  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between z-[9999] sticky top-0 shadow-md">
      <div className="flex items-center text-amber-900 text-sm font-bold">
        <svg className="w-6 h-6 ml-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {context.mode === "ROLE" ? (
          <span>أنت في وضع اختبار دور: <strong>{context.targetRoleKey}</strong></span>
        ) : (
          <span>أنت الآن تتقمص المستخدم: <strong>{context.userLabel || context.targetUserId}</strong></span>
        )}
      </div>
      <form action={handleStop}>
        <button
          type="submit"
          className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center pointer-events-auto cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          إنهاء التقمص
        </button>
      </form>
    </div>
  );
}
