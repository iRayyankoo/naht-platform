"use client";

import { useState } from "react";
import { deleteProjectModel } from "@/actions/models";
import toast from "react-hot-toast";

export default function DeleteModelButton({ id, unitsCount, disabled }: { id: string, unitsCount: number, disabled?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (unitsCount > 0) {
      toast.error("لا يمكن حذف نموذج مرتبط بوحدات");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    setIsDeleting(true);
    try {
      await deleteProjectModel(id);
      toast.success("تم حذف النموذج بنجاح");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الحذف";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (disabled) {
    return (
      <button 
        type="button" 
        disabled
        title="لا يمكن حذف نموذج مرتبط بوحدات"
        className="w-full mt-2 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        حذف النموذج (مرتبط بوحدات)
      </button>
    );
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full mt-2 py-2 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isDeleting ? (
        <span className="w-4 h-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></span>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      )}
      حذف النموذج
    </button>
  );
}
