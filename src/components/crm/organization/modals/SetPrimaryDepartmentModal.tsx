"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SetPrimaryDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  departmentId: string;
  departmentName: string;
  currentRole: string;
  onSetPrimary: (data: { userId: string; departmentId: string }) => Promise<unknown>;
}

export function SetPrimaryDepartmentModal({ isOpen, onClose, userId, departmentId, departmentName, currentRole, onSetPrimary }: SetPrimaryDepartmentModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (currentRole === "OBSERVER") {
      toast.error("لا يمكن تعيين القسم كأساسي لأن دور المستخدم فيه هو مراقب. الرجاء تغيير الدور إلى عضو أولاً.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSetPrimary({ userId, departmentId });
      toast.success("تم تعيين القسم كأساسي بنجاح");
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء العملية");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">تعيين كقسم أساسي</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              هل أنت متأكد من رغبتك في جعل قسم <strong>{departmentName}</strong> هو القسم الأساسي للمستخدم؟
            </p>
            {currentRole === "OBSERVER" && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                لا يمكن تعيين هذا القسم كأساسي لأن دور المستخدم فيه هو مراقب.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || currentRole === "OBSERVER"}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري التعيين..." : "تأكيد التعيين"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
