"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  currentManagerId?: string | null;
  onAssignManager: (data: { departmentId: string; managerId: string }) => Promise<unknown>;
  onRemoveManager?: (data: { departmentId: string }) => Promise<unknown>;
}

export function AssignManagerModal({ isOpen, onClose, departmentId, currentManagerId, onAssignManager, onRemoveManager }: AssignManagerModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerId, setManagerId] = useState<string>("");
  const [mode, setMode] = useState<"assign" | "remove">("assign");
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (mode === "remove" && !confirmRemove) {
      setConfirmRemove(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "remove" && onRemoveManager) {
        await onRemoveManager({ departmentId });
        toast.success("تم إزالة مدير القسم بنجاح");
      } else {
        if (!managerId) {
          toast.error("الرجاء إدخال معرف المدير");
          setIsSubmitting(false);
          return;
        }
        await onAssignManager({ departmentId, managerId });
        toast.success("تم تعيين مدير القسم بنجاح");
      }
      onClose();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || "حدث خطأ أثناء العملية");
    } finally {
      setIsSubmitting(false);
      setConfirmRemove(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{currentManagerId ? "تغيير مدير القسم" : "تعيين مدير للقسم"}</h2>
        
        <div className="mb-4 flex gap-4 border-b border-gray-200 pb-2">
          <button 
            type="button"
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${mode === "assign" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => { setMode("assign"); setConfirmRemove(false); }}
          >
            تعيين مدير
          </button>
          {currentManagerId && onRemoveManager && (
            <button 
              type="button"
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${mode === "remove" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setMode("remove")}
            >
              إزالة المدير الحالي
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "assign" ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">معرف المدير الجديد (UserId)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="أدخل معرف المستخدم..."
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                ملاحظة: الصلاحية تقتصر على نطاق COMPANY scope أو SUPER_ADMIN.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              {confirmRemove ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4 border border-red-100">
                  هل أنت متأكد من رغبتك في إزالة المدير الحالي؟ هذه العملية ستترك القسم بدون مدير حتى تعيين مدير جديد.
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  انقر على المتابعة لإزالة المدير الحالي للقسم.
                </p>
              )}
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
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${mode === "remove" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"}`}
            >
              {isSubmitting ? "جاري المعالجة..." : (mode === "remove" ? (confirmRemove ? "تأكيد الإزالة" : "متابعة") : "حفظ التغييرات")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
