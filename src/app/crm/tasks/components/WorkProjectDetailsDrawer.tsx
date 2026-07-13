"use client";

import React, { useState } from 'react';
import { WorkProjectDTO, ClientPermissions } from '../types';

interface WorkProjectDetailsDrawerProps {
  project: WorkProjectDTO;
  isOpen: boolean;
  onClose: () => void;
  permissions: ClientPermissions;
  onOpenCreateTask: (projectId: string) => void;
}

type TabType = 'TASKS' | 'MEMBERS' | 'FILES';

export function WorkProjectDetailsDrawer({ project, isOpen, onClose, permissions, onOpenCreateTask }: WorkProjectDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('TASKS');

  if (!isOpen) return null;

  const members = project.members;
  const owner = members.find(m => m.role === 'OWNER')?.user;

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
                <span className="text-xl font-bold text-blue-600">{project.totalTasks - project.completedTasks}</span>
             </div>
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">المهام المكتملة</span>
                <span className="text-xl font-bold text-green-600">{project.completedTasks}</span>
             </div>
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 mb-1">تاريخ الإنشاء</span>
                <span className="text-sm font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
             </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
             <span className="text-sm font-bold text-gray-700">إجراءات سريعة:</span>
             {permissions.canCreateTasks && (
                <button
                  onClick={() => { onClose(); onOpenCreateTask(project.id); }}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                  disabled={isReadOnly}
                >
                  إنشاء مهمة داخل المشروع
                </button>
             )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'TASKS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              المهام (مرتبطة)
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
              ملفات المشروع
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* TASKS */}
            {activeTab === 'TASKS' && (
              <div className="space-y-3">
                 <p className="text-center py-8 text-gray-500 text-sm">يتم عرض المهام في لوحة المهام الرئيسية عند تصفية المشروع.</p>
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
                         <div className="text-xs text-gray-500">
                           {m.role === 'OWNER' ? 'مالك' : m.role === 'MANAGER' ? 'مدير مشروع' : m.role === 'MEMBER' ? 'عضو' : 'مشاهد'}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}

            {/* FILES */}
            {activeTab === 'FILES' && (
              <div className="space-y-4">
                 <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-6">
                    <p className="text-sm text-gray-500 font-bold">ملفات المشروع (قريباً)</p>
                    <p className="text-xs text-gray-400 mt-2">سيتم إتاحة رفع وإدارة المرفقات في التحديث القادم.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
