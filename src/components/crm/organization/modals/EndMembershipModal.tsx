"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EndMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  departmentId: string;
  isPrimary: boolean;
  onEndMembership: (data: { userId: string; departmentId: string }) => Promise<unknown>;
}

export function EndMembershipModal({ isOpen, onClose, userId, departmentId, isPrimary, onEndMembership }: EndMembershipModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isPrimary) {
      toast.error("لا يمكن إنهاء العضوية الأساسية. يجب تعيين قسم أساسي آخر أولاً.");
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEndMembership({ departmentId, userId });
      toast.success("تم إنهاء العضوية بنجاح");
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء إنهاء العضوية");
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">إنهاء العضوية</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            {isPrimary ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4 border border-red-100">
                لا يمكن إنهاء العضوية الأساسية للمستخدم. الرجاء تعيين قسم أساسي آخر له أولاً، أو نقله لقسم آخر.
              </div>
            ) : confirmDelete ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4 border border-red-100 font-medium">
                تحذير: هل أنت متأكد من رغبتك في إنهاء هذه العضوية؟ سيتم إزالة المستخدم من القسم بشكل نهائي.
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                انقر على المتابعة لإنهاء عضوية المستخدم في هذا القسم. هذه العملية لا يمكن التراجع عنها.
              </p>
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
              disabled={isSubmitting || isPrimary}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الإنهاء..." : (confirmDelete ? "تأكيد الإنهاء" : "متابعة")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
