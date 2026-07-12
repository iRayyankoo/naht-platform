"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { startTask, submitForApproval, approveTask, rejectTask, completeTask, cancelTask, addComment } from "@/actions/tasks";

export default function TaskDetailsClient({ task, currentUser, canApprove }: { task: any, currentUser: any, canApprove: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    setLoading(true);
    try {
      await actionFn();
      toast.success(successMsg);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const onReject = async () => {
    if (rejectReason.trim().length < 5) {
      toast.error("يجب إدخال سبب واضح للرفض (5 أحرف على الأقل)");
      return;
    }
    setLoading(true);
    try {
      await rejectTask(task.id, rejectReason);
      toast.success("تم رفض المهمة وإعادتها للمسؤول");
      setShowRejectModal(false);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const onComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await addComment(task.id, commentText);
      setCommentText("");
      toast.success("تمت إضافة التعليق");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const isAssignee = task.assignedToId === currentUser.id;

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        {task.taskStatus === "TODO" && (
          <button 
            onClick={() => handleAction(() => startTask(task.id), "تم بدء المهمة")}
            disabled={loading || !isAssignee}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            بدء التنفيذ
          </button>
        )}

        {task.taskStatus === "IN_PROGRESS" && task.requiresApproval && (
          <button 
            onClick={() => handleAction(() => submitForApproval(task.id), "تم إرسال المهمة للاعتماد")}
            disabled={loading || !isAssignee || task.approvalStatus === "PENDING"}
            className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            إرسال للاعتماد
          </button>
        )}

        {task.taskStatus === "IN_PROGRESS" && !task.requiresApproval && (
          <button 
            onClick={() => handleAction(() => completeTask(task.id), "تم إكمال المهمة")}
            disabled={loading || !isAssignee}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
          >
            إكمال المهمة
          </button>
        )}

        {task.approvalStatus === "PENDING" && canApprove && (
          <>
            <button 
              onClick={() => handleAction(() => approveTask(task.id), "تم اعتماد المهمة بنجاح")}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
            >
              موافقة واعتماد
            </button>
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl text-sm hover:bg-red-100 disabled:opacity-50"
            >
              رفض
            </button>
          </>
        )}

        {task.taskStatus !== "DONE" && task.taskStatus !== "CANCELLED" && (
          <button 
            onClick={() => handleAction(() => cancelTask(task.id), "تم إلغاء المهمة")}
            disabled={loading}
            className="px-4 py-2 text-gray-500 font-bold rounded-xl text-sm hover:bg-gray-100 mr-auto disabled:opacity-50"
          >
            إلغاء المهمة
          </button>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">سبب الرفض</h3>
            <p className="text-sm text-gray-500 mb-4">يرجى توضيح سبب رفض المهمة لإعلام المسؤول بما يجب تعديله.</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border-gray-200 rounded-xl mb-4 focus:ring-primary focus:border-primary text-sm"
              rows={4}
              placeholder="اكتب السبب هنا..."
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold"
              >
                إلغاء
              </button>
              <button 
                onClick={onReject}
                disabled={loading}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">التعليقات</h3>
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
          {task.comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">لا توجد تعليقات حتى الآن</p>
          ) : (
            task.comments.map((c: any) => (
              <div key={c.id} className={`flex flex-col ${c.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${c.userId === currentUser.id ? 'bg-primary/10 text-primary-dark rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tr-none'}`}>
                  <p className="text-xs font-bold mb-1 opacity-70">{c.user.name}</p>
                  <p className="text-sm">{c.comment}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString("ar-SA")}</span>
              </div>
            ))
          )}
        </div>
        <form onSubmit={onComment} className="flex gap-3">
          <input 
            type="text" 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="flex-1 border-gray-200 rounded-xl focus:border-primary focus:ring-primary text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !commentText.trim()}
            className="px-6 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark disabled:opacity-50 shrink-0"
          >
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
}
