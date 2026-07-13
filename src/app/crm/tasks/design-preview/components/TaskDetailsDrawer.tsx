import React, { useState, useRef, useEffect } from 'react';
import { MockTask, STATUS_LABELS, PRIORITY_LABELS, APPROVAL_LABELS, MOCK_USERS, MOCK_WORK_PROJECTS, MockAttachment } from './data';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface TaskDetailsDrawerProps {
  task: MockTask;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: MockTask) => void;
  role: string;
}

type TabType = 'DETAILS' | 'COMMENTS' | 'ACTIVITY' | 'APPROVAL' | 'ATTACHMENTS';

export function TaskDetailsDrawer({ task, isOpen, onClose, role }: Omit<TaskDetailsDrawerProps, 'onUpdateTask'> & { onUpdateTask?: (task: MockTask) => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('DETAILS');
  const [newComment, setNewComment] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<MockAttachment[]>(task.attachments || []);

  const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
  const approver = MOCK_USERS.find(u => u.id === task.approverId);
  const creator = MOCK_USERS.find(u => u.id === task.creatorId);
  const workProject = task.workProjectId ? MOCK_WORK_PROJECTS.find(p => p.id === task.workProjectId) : null;
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttachments(task.attachments || []);
  }, [task]);

  if (!isOpen) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    toast.success('تمت إضافة التعليق (محاكاة)');
    setNewComment('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit

      if (newFiles.length !== validFiles.length) {
        toast.error('تم استبعاد بعض الملفات لتجاوزها الحجم المسموح (5MB).');
      }

      const newMockAttachments = validFiles.map(file => {
        const isImage = file.type.startsWith('image/');
        return {
          id: `ta_${Date.now()}_${Math.random()}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: role === 'SUPER_ADMIN' ? 'مدير النظام' : 'المستخدم الحالي',
          date: new Date().toISOString(),
          url: isImage ? URL.createObjectURL(file) : undefined
        };
      });

      setAttachments(prev => [...prev, ...newMockAttachments]);
      toast.success('تم رفع الملف بنجاح (محاكاة)');
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachments(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.url) {
        URL.revokeObjectURL(file.url); // Cleanup URL
      }
      return prev.filter(f => f.id !== id);
    });
    toast.success('تم حذف الملف');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const eTargetFiles = e.dataTransfer.files;
      // create synthetic event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const syntheticEvent = { target: { files: eTargetFiles } } as any;
      handleFileChange(syntheticEvent);
    }
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
            {workProject ? (
              <div className="text-[10px] text-blue-600 font-bold mb-2 inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                مشروع عمل: {workProject.name}
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
              {task.requiresApproval && (
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
        <div className="flex-1 overflow-y-auto p-6 bg-white">

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
                      <span className="block text-xs font-bold text-gray-500 mb-1">المعتمد</span>
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
              {!isReadOnly && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700 mb-1">اسحب وأفلت الملفات هنا أو اضغط للاختيار</span>
                  <span className="text-xs text-gray-500">الحد الأقصى للملف 5MB (للمعاينة فقط)</span>
                </div>
              )}

              <div className="space-y-4">
                 <h4 className="font-bold text-gray-900 text-sm">مرفقات المهمة ({attachments.length})</h4>
                 {attachments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-sm text-gray-500">لا توجد مرفقات مرتبطة بهذه المهمة.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {attachments.map((file) => (
                         <div key={file.id} className="group relative bg-white border border-gray-200 p-3 rounded-xl hover:shadow-md transition-all">
                           {file.url ? (
                              <div className="relative h-24 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                 <Image src={file.url} alt={file.fileName} fill className="object-cover" unoptimized />
                              </div>
                           ) : (
                              <div className="h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                                 <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs shadow-inner">
                                    {file.mimeType.includes('pdf') ? 'PDF' : 'DOC'}
                                 </div>
                              </div>
                           )}
                           <h5 className="font-bold text-sm text-gray-900 truncate mb-1" dir="ltr" title={file.fileName}>{file.fileName}</h5>
                           <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                              <span>{file.uploadedBy}</span>
                           </div>

                           {!isReadOnly && (
                             <button
                               onClick={() => handleRemoveFile(file.id)}
                               className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                               title="حذف الملف"
                             >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           )}
                         </div>
                       ))}
                    </div>
                 )}
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
                        <span className="font-bold text-sm text-gray-900">{c.by}</span>
                        <span className="text-xs text-gray-500" dir="ltr">{new Date(c.date).toLocaleString('ar-SA')}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {!isReadOnly && (
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
                    <button type="submit" disabled={!newComment.trim()} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
              {task.history.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">لا يوجد سجل نشاط.</p>
              ) : (
                <div className="relative border-r-2 border-gray-100 pr-6 mr-3 rtl:border-r-0 rtl:border-l-2 rtl:pr-0 rtl:pl-6 rtl:ml-3 space-y-6 py-2">
                  {task.history.map((h) => (
                    <div key={h.id} className="relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -right-[31px] rtl:-right-auto rtl:-left-[31px] top-1.5 ring-4 ring-white"></div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-900 font-medium mb-1">{h.action}</div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>بواسطة: <span className="font-bold">{h.by}</span></span>
                          <span dir="ltr">{new Date(h.date).toLocaleString('ar-SA')}</span>
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
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                 <h4 className="font-bold text-yellow-800 text-sm mb-2">حالة الاعتماد الحالية</h4>
                 <p className="text-sm text-yellow-700">{APPROVAL_LABELS[task.approvalStatus]}</p>
              </div>
              <p className="text-xs text-gray-500 mt-4">محاكاة: لا يوجد سجل لاعتمادات سابقة في هذه النسخة التجريبية.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
