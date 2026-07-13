"use client";

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { TaskDTO, TaskStatus, TaskPriority, ApprovalStatus, ClientPermissions } from '../types';
import toast from 'react-hot-toast';
import {
  startTask, submitForApproval, completeTask,
  approveTask, rejectTask, cancelTask, addComment
} from '@/actions/tasks';
import { useRouter } from 'next/navigation';

interface TaskDetailsDrawerProps {
  task: TaskDTO;
  isOpen: boolean;
  onClose: () => void;
  permissions: ClientPermissions;
}

type TabType = 'DETAILS' | 'COMMENTS' | 'ACTIVITY' | 'APPROVAL' | 'ATTACHMENTS';

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'بانتظار البدء',
  IN_PROGRESS: 'قيد التنفيذ',
  DONE: 'مكتملة',
  CANCELLED: 'ملغاة'
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'عادية',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية'
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'بانتظار الاعتماد',
  APPROVED: 'معتمدة',
  REJECTED: 'مرفوضة'
};

export function TaskDetailsDrawer({ task, isOpen, onClose, permissions }: TaskDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('DETAILS');
  const [newComment, setNewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const assignee = task.assignedTo;
  const approver = task.designatedApprover;
  const creator = task.createdBy;
  const isReadOnly = task.taskStatus === 'DONE' || task.taskStatus === 'CANCELLED';

  // Handle Focus Trap
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => drawerRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (actionFn: () => Promise<{success?: boolean; error?: string}>, successMsg: string) => {
    startTransition(async () => {
      try {
        const res = await actionFn();
        if (res?.success) {
          toast.success(successMsg);
          router.refresh();
        }
      } catch {
        toast.error('حدث خطأ أثناء تنفيذ الإجراء');
      }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    startTransition(async () => {
      try {
        const res = await addComment(task.id, newComment);
        if (res?.success) {
          toast.success('تمت إضافة التعليق');
          setNewComment('');
          router.refresh();
        }
      } catch {
        toast.error('حدث خطأ');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm" dir="rtl" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="w-full sm:w-[500px] md:w-[600px] bg-white shadow-2xl h-full flex flex-col focus:outline-none"
        role="dialog"
        aria-label={`تفاصيل المهمة: ${task.title}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex-1 pl-4">
            {task.workProjectId ? (
              <div className="text-[10px] text-blue-600 font-bold mb-2 inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                مشروع عمل مرتبط
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 font-bold mb-2 inline-block bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                مهمة عامة (غير مرتبطة بمشروع عمل)
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{task.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                {STATUS_LABELS[task.taskStatus]}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              {task.requiresApproval && task.approvalStatus && (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                  task.approvalStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                  task.approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {APPROVAL_LABELS[task.approvalStatus]}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="إغلاق التفاصيل"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Action Buttons (Workflow) */}
        {!isReadOnly && permissions.canEditTasks && (
           <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
              {task.taskStatus === 'TODO' && (
                 <button
                   onClick={() => handleAction(() => startTask(task.id), 'تم بدء المهمة')}
                   disabled={isPending}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                 >
                   البدء بالتنفيذ
                 </button>
              )}

              {task.taskStatus === 'IN_PROGRESS' && (
                 <>
                    {task.requiresApproval && task.approvalStatus !== 'PENDING' && task.approvalStatus !== 'APPROVED' && (
                       <button
                         onClick={() => handleAction(() => submitForApproval(task.id), 'تم الإرسال للاعتماد')}
                         disabled={isPending}
                         className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700 disabled:opacity-50"
                       >
                         إرسال للاعتماد
                       </button>
                    )}

                    {(!task.requiresApproval || task.approvalStatus === 'APPROVED') && (
                       <button
                         onClick={() => handleAction(() => completeTask(task.id), 'تم إكمال المهمة')}
                         disabled={isPending}
                         className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                       >
                         إكمال المهمة
                       </button>
                    )}
                 </>
              )}

              {task.approvalStatus === 'PENDING' && permissions.canApproveTasks && (
                 <>
                   <button
                     onClick={() => handleAction(() => approveTask(task.id), 'تم اعتماد المهمة')}
                     disabled={isPending}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                   >
                     اعتماد
                   </button>

                   {!showRejectInput ? (
                     <button
                       onClick={() => setShowRejectInput(true)}
                       disabled={isPending}
                       className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 disabled:opacity-50"
                     >
                       رفض...
                     </button>
                   ) : (
                     <div className="flex gap-2 w-full mt-2">
                       <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="سبب الرفض (إلزامي)"
                          className="flex-1 border border-gray-300 rounded p-2 text-sm"
                       />
                       <button
                         onClick={() => {
                           if (!rejectReason.trim()) return toast.error('يرجى كتابة سبب الرفض');
                           handleAction(() => rejectTask(task.id, rejectReason), 'تم رفض المهمة');
                           setShowRejectInput(false);
                         }}
                         disabled={isPending || !rejectReason.trim()}
                         className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                       >
                         تأكيد الرفض
                       </button>
                       <button onClick={() => setShowRejectInput(false)} className="px-3 py-2 text-gray-500 hover:bg-gray-200 rounded text-sm">إلغاء</button>
                     </div>
                   )}
                 </>
              )}

              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من إلغاء المهمة؟')) {
                    handleAction(() => cancelTask(task.id), 'تم إلغاء المهمة');
                  }
                }}
                disabled={isPending}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 mr-auto"
              >
                إلغاء المهمة
              </button>
           </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar bg-white">
          {(['DETAILS', 'COMMENTS', 'ACTIVITY', 'ATTACHMENTS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-6 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'DETAILS' ? 'التفاصيل' :
               tab === 'COMMENTS' ? 'التعليقات' :
               tab === 'ACTIVITY' ? 'سجل النشاط' : 'المرفقات'}
            </button>
          ))}
          {task.requiresApproval && (
             <button
                onClick={() => setActiveTab('APPROVAL')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === 'APPROVAL' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                سجل الاعتماد
              </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white relative">

          {isPending && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}

          {/* Details Tab */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">وصف المهمة</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'لا يوجد وصف للمهمة.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="block text-xs font-bold text-gray-500 mb-1">المسؤول عن التنفيذ</span>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {assignee?.name.charAt(0) || '?'}
                       </div>
                       <span className="font-bold text-gray-900 text-sm">{assignee?.name || 'غير مسند'}</span>
                    </div>
                 </div>

                 {task.requiresApproval && (
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="block text-xs font-bold text-gray-500 mb-1">المعتمد المعين</span>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xs">
                            {approver?.name.charAt(0) || '?'}
                         </div>
                         <span className="font-bold text-gray-900 text-sm">{approver?.name || 'غير محدد'}</span>
                      </div>
                   </div>
                 )}

                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="block text-xs font-bold text-gray-500 mb-1">منشئ المهمة</span>
                    <div className="flex items-center gap-2 mt-2 text-sm font-bold text-gray-900">
                       {creator?.name || 'غير معروف'}
                    </div>
                 </div>

                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="block text-xs font-bold text-gray-500 mb-1">تاريخ الاستحقاق</span>
                    <div className={`mt-2 font-bold text-sm ${task.taskStatus !== 'DONE' && task.taskStatus !== 'CANCELLED' && task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                       {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'لا يوجد'}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'ATTACHMENTS' && (
            <div className="space-y-6">
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 font-bold">المرفقات (قريباً)</p>
                  <p className="text-xs text-gray-400 mt-2">سيتم إتاحة رفع وإدارة المرفقات في التحديث القادم.</p>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'COMMENTS' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 mb-6">
                {task.comments.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-8">لا توجد تعليقات بعد.</p>
                ) : (
                  task.comments.map(c => (
                    <div key={c.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-gray-900">{c.author?.name || 'مستخدم'}</span>
                        <span className="text-xs text-gray-500" dir="ltr">{new Date(c.createdAt).toLocaleString('ar-SA')}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {!isReadOnly && permissions.canEditTasks && (
                <form onSubmit={handleAddComment} className="mt-auto border-t border-gray-100 pt-4 bg-white">
                  <label className="sr-only">إضافة تعليق</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="أضف تعليقاً..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    <button type="submit" disabled={isPending || !newComment.trim()} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      إرسال
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'ACTIVITY' && (
            <div className="space-y-4">
              {task.activityLogs.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">لا يوجد سجل نشاط.</p>
              ) : (
                <div className="relative border-r-2 border-gray-100 pr-6 mr-3 rtl:border-r-0 rtl:border-l-2 rtl:pr-0 rtl:pl-6 rtl:ml-3 space-y-6 py-2">
                  {task.activityLogs.map((h) => (
                    <div key={h.id} className="relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -right-[31px] rtl:-right-auto rtl:-left-[31px] top-1.5 ring-4 ring-white"></div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-900 font-medium mb-1">{h.action} {h.details ? ` - ${h.details}` : ''}</div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>بواسطة: <span className="font-bold">{h.actor?.name || 'مستخدم'}</span></span>
                          <span dir="ltr">{new Date(h.createdAt).toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Approval Tab */}
          {activeTab === 'APPROVAL' && (
            <div className="space-y-4">
               {task.approvals.length === 0 ? (
                 <p className="text-center text-gray-500 text-sm py-8">لا يوجد سجل اعتمادات.</p>
               ) : (
                 <div className="space-y-3">
                   {task.approvals.map(a => (
                      <div key={a.id} className={`p-4 rounded-xl border ${
                         a.status === 'APPROVED' ? 'bg-green-50 border-green-100' :
                         a.status === 'REJECTED' ? 'bg-red-50 border-red-100' :
                         'bg-yellow-50 border-yellow-100'
                      }`}>
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm text-gray-900">{a.approver?.name || 'مستخدم'}</span>
                            <span className="text-xs text-gray-500" dir="ltr">{new Date(a.createdAt).toLocaleString('ar-SA')}</span>
                         </div>
                         <div className={`text-xs font-bold mb-2 ${
                            a.status === 'APPROVED' ? 'text-green-700' :
                            a.status === 'REJECTED' ? 'text-red-700' :
                            'text-yellow-700'
                         }`}>
                           الحالة: {APPROVAL_LABELS[a.status]}
                         </div>
                         {a.comment && (
                            <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">{a.comment}</p>
                         )}
                      </div>
                   ))}
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
