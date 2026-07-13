"use client";

import React from 'react';
import { MockTask, STATUS_LABELS, PRIORITY_LABELS, MOCK_USERS, MOCK_WORK_PROJECTS } from './data';

interface ListViewProps {
  filteredTasks: MockTask[];
  onClick?: (task: MockTask) => void;
}

export function ListView({ filteredTasks, onClick }: ListViewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">المهمة</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الأولوية</th>
              <th className="px-6 py-4">المسند إليه</th>
              <th className="p-4 text-gray-500 font-bold whitespace-nowrap">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTasks.length > 0 ? filteredTasks.map(task => {
              const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
              const workProject = task.workProjectId ? MOCK_WORK_PROJECTS.find(p => p.id === task.workProjectId) : null;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                    onClick?.(task);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                     if(e.key === 'Enter' || e.key === ' ') {
                       e.preventDefault();
                       onClick?.(task);
                     }
                  }}
                >
                  <td className="p-4">
                    <div className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{task.title}</div>
                    {workProject && (
                      <div className="text-[10px] text-blue-600 font-bold mt-1 inline-block bg-blue-50 px-1.5 py-0.5 rounded">
                         {workProject.name}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          task.taskStatus === "DONE" ? "text-green-600" :
                          task.taskStatus === "IN_PROGRESS" ? "text-blue-600" :
                          task.taskStatus === "CANCELLED" ? "text-gray-500" : "text-gray-700"
                      }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            task.taskStatus === "DONE" ? "bg-green-500" :
                            task.taskStatus === "IN_PROGRESS" ? "bg-blue-500" :
                            task.taskStatus === "CANCELLED" ? "bg-gray-400" : "bg-gray-400"
                          }`}></span>
                          {STATUS_LABELS[task.taskStatus]}
                      </span>
                      {task.taskStatus === 'IN_PROGRESS' && task.approvalStatus === 'PENDING' && (
                          <span className="text-[10px] text-[#ca9f52] font-bold">بانتظار الاعتماد</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                      task.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-100" :
                      task.priority === "MEDIUM" ? "bg-orange-50 text-orange-700 border-orange-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">
                          {assignee ? assignee.name.charAt(0) : '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {assignee ? assignee.name : 'غير مسند'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="التفاصيل">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                  لا توجد مهام تطابق معايير البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
