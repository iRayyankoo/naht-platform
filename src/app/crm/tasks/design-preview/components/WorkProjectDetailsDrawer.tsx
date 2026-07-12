import React, { useState, useRef } from 'react';
import { MockWorkProject, INITIAL_TASKS, MOCK_WORK_PROJECT_MEMBERS, MOCK_USERS, MOCK_PROJECT_ATTACHMENTS, STATUS_LABELS } from './data';
import { Role } from '../page';
import toast from 'react-hot-toast';

interface WorkProjectDetailsDrawerProps {
  project: MockWorkProject;
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  onOpenCreateTask: (projectId: string) => void;
}

type TabType = 'TASKS' | 'MEMBERS' | 'FILES';

export function WorkProjectDetailsDrawer({ project, isOpen, onClose, role, onOpenCreateTask }: WorkProjectDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('TASKS');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const projectTasks = INITIAL_TASKS.filter(t => t.workProjectId === project.id);
  const openTasksCount = projectTasks.filter(t => t.taskStatus !== 'DONE' && t.taskStatus !== 'CANCELLED').length;
  const completedTasksCount = projectTasks.filter(t => t.taskStatus === 'DONE').length;
  const members = MOCK_WORK_PROJECT_MEMBERS.filter(m => m.projectId === project.id).map(m => {
     const user = MOCK_USERS.find(u => u.id === m.userId);
     return { ...m, user };
  });
  const owner = MOCK_USERS.find(u => u.id === project.ownerId);
  const attachments = MOCK_PROJECT_ATTACHMENTS[project.id] || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      toast.success('تمت محاكاة الرفع بنجاح.');
    }
  };

  const isReadOnly = project.status === 'COMPLETED' || project.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm" dir="rtl">
      <div 
        className="w-full sm:w-[600px] bg-white shadow-2xl h-full flex flex-col overflow-y-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                 {project.status === 'ACTIVE' ? 'نشط' : project.status === 'PLANNING' ? 'تخطيط' : project.status === 'COMPLETED' ? 'مكتمل' : project.status === 'PAUSED' ? 'متوقف' : 'ملغى'}
              </span>
              <span>•</span>
              <span>المالك: {owner?.name || 'غير محدد'}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق تفاصيل مشروع العمل" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">المهام المفتوحة</span>
                <span className="text-xl font-bold text-blue-600">{openTasksCount}</span>
             </div>
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">المهام المكتملة</span>
                <span className="text-xl font-bold text-green-600">{completedTasksCount}</span>
             </div>
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">تاريخ البداية</span>
                <span className="text-sm font-bold text-gray-900">{new Date(project.startDate).toLocaleDateString('ar-SA')}</span>
             </div>
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">تاريخ النهاية</span>
                <span className="text-sm font-bold text-gray-900">{new Date(project.endDate).toLocaleDateString('ar-SA')}</span>
             </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
             <span className="text-sm font-bold text-gray-700">إجراءات سريعة:</span>
             <button 
               onClick={() => { onClose(); onOpenCreateTask(project.id); }}
               className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
               disabled={isReadOnly}
             >
               إنشاء مهمة داخل المشروع
             </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'TASKS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              المهام ({projectTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('MEMBERS')}
              className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'MEMBERS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              الأعضاء ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('FILES')}
              className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'FILES' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              ملفات المشروع {attachments.length > 0 ? `(${attachments.length})` : ''}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* TASKS */}
            {activeTab === 'TASKS' && (
              <div className="space-y-3">
                 {projectTasks.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm">لا توجد مهام مسجلة في مشروع العمل هذا.</p>
                 ) : (
                    projectTasks.map(t => {
                      const assignee = MOCK_USERS.find(u => u.id === t.assigneeId);
                      return (
                        <div key={t.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50">
                           <div>
                              <div className="font-bold text-sm text-gray-900">{t.title}</div>
                              <div className="text-xs text-gray-500 mt-1">المسؤول: {assignee?.name || 'غير مسند'} • حالة: {STATUS_LABELS[t.taskStatus]}</div>
                           </div>
                        </div>
                      )
                    })
                 )}
              </div>
            )}

            {/* MEMBERS */}
            {activeTab === 'MEMBERS' && (
              <div className="space-y-3">
                 {members.map(m => (
                   <div key={m.id} className="p-3 border border-gray-200 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                         {m.user?.name.charAt(0) || '?'}
                      </div>
                      <div>
                         <div className="font-bold text-sm text-gray-900">{m.user?.name || 'مستخدم غير معروف'}</div>
                         <div className="text-xs text-gray-500">{m.role === 'OWNER' ? 'مالك' : m.role === 'ADMIN' ? 'مدير مشروع' : 'عضو'}</div>
                      </div>
                   </div>
                 ))}
              </div>
            )}

            {/* FILES */}
            {activeTab === 'FILES' && (
              <div className="space-y-4">
                 {!isReadOnly && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                       <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                       <svg className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                       <span className="text-sm font-bold text-gray-700 mb-1">رفع ملف لمشروع العمل</span>
                       <span className="text-[10px] text-gray-500 mt-1">يمكن للمالك والأعضاء رفع مستندات العمل هنا</span>
                    </div>
                 )}

                 <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-gray-900 text-sm mb-3">الملفات الحالية</h4>
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                           {file.mimeType.includes('pdf') ? 'PDF' : file.mimeType.includes('image') ? 'IMG' : 'DOC'}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h5 className="font-bold text-sm text-gray-900 truncate" dir="ltr">{file.fileName}</h5>
                           <div className="flex gap-2 text-xs text-gray-500 mt-1">
                              <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>{file.uploadedBy}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {(!isReadOnly && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'EMPLOYEE')) && (
                             <button className="text-gray-400 hover:text-red-600 transition-colors p-1" title="حذف" onClick={() => toast.success('تم الحذف الوهمي')}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                    {(attachments.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-xl">لا يوجد ملفات لهذا المشروع.</p>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
