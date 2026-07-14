"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  departmentId: string;
  currentRole: string;
  isPrimary: boolean;
  onChangeRole: (data: { userId: string; departmentId: string; membershipRole: "MEMBER" | "OBSERVER" }) => Promise<unknown>;
}

export function ChangeRoleModal({ isOpen, onClose, userId, departmentId, currentRole, isPrimary, onChangeRole }: ChangeRoleModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipRole, setMembershipRole] = useState<"MEMBER" | "OBSERVER">(currentRole as "MEMBER" | "OBSERVER" || "MEMBER");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (isPrimary && membershipRole === "OBSERVER") {
      toast.error("لا يمكن تحويل الدور إلى مراقب للقسم الأساسي.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onChangeRole({ departmentId, userId, membershipRole });
      toast.success("تم تغيير الدور بنجاح");
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء تغيير الدور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">تغيير دور العضوية</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">الدور الجديد</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={membershipRole}
              onChange={(e) => setMembershipRole(e.target.value as "MEMBER" | "OBSERVER")}
              disabled={isSubmitting}
            >
              <option value="MEMBER">عضو (MEMBER)</option>
              <option value="OBSERVER">مراقب (OBSERVER)</option>
            </select>
          </div>
          
          {isPrimary && membershipRole === "OBSERVER" && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4 border border-red-100">
              لا يمكن تحويل الدور إلى مراقب لأن هذا هو القسم الأساسي للمستخدم.
            </div>
          )}

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
              disabled={isSubmitting || (isPrimary && membershipRole === "OBSERVER") || membershipRole === currentRole}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
