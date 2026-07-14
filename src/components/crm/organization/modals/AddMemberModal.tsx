"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  onAddMember: (data: { departmentId: string; userId: string; isPrimary: boolean; membershipRole: "MEMBER" | "OBSERVER" }) => Promise<unknown>;
}

export function AddMemberModal({ isOpen, onClose, departmentId, onAddMember }: AddMemberModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [membershipRole, setMembershipRole] = useState<"MEMBER" | "OBSERVER">("MEMBER");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userId) {
      toast.error("الرجاء إدخال معرف المستخدم");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMember({ departmentId, userId, isPrimary, membershipRole });
      toast.success("تم إضافة العضو بنجاح");
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء إضافة العضو");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">إضافة عضو للقسم</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">معرف المستخدم (UserId)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="أدخل معرف المستخدم..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">دور العضوية</label>
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

          <div className="mb-6 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              disabled={isSubmitting || membershipRole === "OBSERVER"}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">جعل هذا القسم أساسياً للمستخدم</label>
          </div>
          
          {isPrimary && membershipRole === "OBSERVER" && (
            <p className="text-xs text-red-600 mb-4">لا يمكن تعيين العضو كمراقب وقسم أساسي في نفس الوقت.</p>
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
              disabled={isSubmitting || (isPrimary && membershipRole === "OBSERVER")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة العضو"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
