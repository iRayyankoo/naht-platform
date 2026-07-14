"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface TransferMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentDepartmentId: string;
  isPrimary: boolean;
  onTransfer: (data: { userId: string; newDepartmentId: string; membershipRole: "MEMBER" | "OBSERVER" }) => Promise<unknown>;
}

export function TransferMembershipModal({ isOpen, onClose, userId, currentDepartmentId, isPrimary, onTransfer }: TransferMembershipModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [membershipRole, setMembershipRole] = useState<"MEMBER" | "OBSERVER">("MEMBER");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newDepartmentId) {
      toast.error("الرجاء إدخال معرف القسم الجديد");
      return;
    }

    if (newDepartmentId === currentDepartmentId) {
      toast.error("المستخدم موجود بالفعل في هذا القسم");
      return;
    }

    if (isPrimary && membershipRole === "OBSERVER") {
      toast.error("لا يمكن نقل العضوية الأساسية وتعيينها كمراقب في القسم الجديد.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer({ userId, newDepartmentId, membershipRole });
      toast.success("تم نقل المستخدم بنجاح");
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء نقل المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">نقل المستخدم لقسم آخر</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">معرف القسم الجديد (DepartmentId)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="أدخل معرف القسم..."
              value={newDepartmentId}
              onChange={(e) => setNewDepartmentId(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">دور العضوية في القسم الجديد</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={membershipRole}
              onChange={(e) => setMembershipRole(e.target.value as "MEMBER" | "OBSERVER")}
              disabled={isSubmitting || isPrimary}
            >
              <option value="MEMBER">عضو (MEMBER)</option>
              <option value="OBSERVER">مراقب (OBSERVER)</option>
            </select>
            {isPrimary && (
              <p className="text-xs text-gray-500 mt-2">
                بما أن هذه هي العضوية الأساسية، يجب أن يكون الدور في القسم الجديد &quot;عضو&quot;.
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
              disabled={isSubmitting || !newDepartmentId}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري النقل..." : "تأكيد النقل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
