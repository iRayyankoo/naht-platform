"use client";

import React from 'react';
import { TaskDTO, TaskStatus, ApprovalStatus } from '../types';

interface KanbanBoardProps {
  filteredTasks: TaskDTO[];
  onClick?: (task: TaskDTO) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'بانتظار البدء',
  IN_PROGRESS: 'قيد التنفيذ',
  DONE: 'مكتملة',
  CANCELLED: 'ملغاة'
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'بانتظار الاعتماد',
  APPROVED: 'معتمدة',
  REJECTED: 'مرفوضة'
};

export function KanbanBoard({
  filteredTasks,
  onClick
}: KanbanBoardProps) {
  const kanbanColumns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 px-1 snap-x">
      {kanbanColumns.map(colStatus => {
        const colTasks = filteredTasks.filter(t => t.taskStatus === colStatus);

        return (
          <div
            key={colStatus}
            className="flex flex-col flex-shrink-0 w-[85vw] sm:w-80 lg:w-96 snap-center bg-gray-100/50 rounded-2xl border border-gray-200 transition-all"
          >
            <div className="px-5 py-4 border-b border-gray-200/60 flex items-center justify-between sticky top-0 bg-gray-100/50 rounded-t-2xl z-10 backdrop-blur-sm">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                     colStatus === 'TODO' ? 'bg-gray-400' :
                     colStatus === 'IN_PROGRESS' ? 'bg-blue-500' :
                     'bg-green-500'
                  }`}></span>
                  {STATUS_LABELS[colStatus]}
               </h3>
               <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {colTasks.length}
               </span>
            </div>

            <div className="p-3 flex flex-col gap-3 overflow-y-auto min-h-[100px] custom-scrollbar">
               {colTasks.map(task => {
                 const assignee = task.assignedTo;
                 return (
                   <div
                     key={task.id}
                     onClick={(e) => {
                       if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select')) return;
                       onClick?.(task);
                     }}
                     className="bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-primary/30 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                     tabIndex={0}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onClick?.(task);
                        }
                     }}
                     aria-label={`مهمة: ${task.title}، الحالة: ${STATUS_LABELS[task.taskStatus]}`}
                   >
                     {/* Card Header (Project Badge) */}
                     {task.workProjectId ? (
                        <div className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded inline-block font-bold mb-2">
                           مشروع عمل مرتبطة
                        </div>
                     ) : (
                        <div className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded inline-block font-bold mb-2">
                           مهمة عامة
                        </div>
                     )}

                     <div className="flex justify-between items-start mb-2 gap-2">
                       <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">{task.title}</h4>
                       <div className="flex gap-1 flex-shrink-0">
                         {task.priority === 'HIGH' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1" title="أولوية عالية"></span>
                         )}
                       </div>
                     </div>

                     <div className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                       {task.description || 'لا يوجد وصف'}
                     </div>

                     {/* Approvals */}
                     {task.requiresApproval && task.approvalStatus && (
                       <div className="mb-3">
                          {task.approvalStatus === 'PENDING' ? (
                             <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-md border border-yellow-200">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {APPROVAL_LABELS[task.approvalStatus]}
                             </span>
                          ) : (
                             <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${
                                task.approvalStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                             }`}>
                                {APPROVAL_LABELS[task.approvalStatus]}
                             </span>
                          )}
                       </div>
                     )}

                     {/* Card Footer */}
                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm border border-gray-200" title={assignee?.name || 'غير مسند'}>
                           {assignee?.name.charAt(0) || '?'}
                         </div>
                         <div className="flex items-center text-gray-400 text-xs gap-3">
                            <span className="flex items-center gap-1" title="التعليقات">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              {task.comments?.length || 0}
                            </span>
                            {task.dueDate && (
                               <span className={`flex items-center gap-1 ${task.taskStatus !== 'DONE' && task.taskStatus !== 'CANCELLED' && new Date(task.dueDate) < new Date() ? 'text-red-500' : ''}`} title="تاريخ الاستحقاق">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {new Date(task.dueDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                               </span>
                            )}
                         </div>
                       </div>

                       <div className="sm:hidden text-[10px] text-gray-400">
                          {/* Drag and Drop disabled temporarily */}
                          اضغط للتفاصيل
                       </div>
                     </div>
                   </div>
                 );
               })}
               {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl text-sm">
                     لا يوجد مهام
                  </div>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
