import React from 'react';
import { WorkProjectDTO, WorkProjectStatus } from '../types';

interface WorkProjectsListProps {
  projects: WorkProjectDTO[];
  onClick: (project: WorkProjectDTO) => void;
}

const WORK_PROJECT_STATUS_LABELS: Record<WorkProjectStatus, string> = {
  PLANNING: 'قيد التخطيط',
  ACTIVE: 'نشط',
  PAUSED: 'متوقف مؤقتاً',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى'
};

export function WorkProjectsList({ projects, onClick }: WorkProjectsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map(project => {
        const owner = project.members.find(m => m.role === 'OWNER')?.user;
        const membersCount = project.members.length;
        const progress = project.progress;

        return (
          <div
            key={project.id}
            onClick={() => onClick(project)}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(project);
              }
            }}
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">{project.name}</h3>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${
                project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {WORK_PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>

            <p className="text-sm text-gray-500 line-clamp-2 mb-5 flex-1">
              {project.description || 'لا يوجد وصف للمشروع.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5" title="المالك">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   <span className="font-bold text-gray-700">{owner?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-1.5" title="عدد الأعضاء">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                   <span className="font-bold text-gray-700">{membersCount} أعضاء</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500" title="الأقسام النشطة">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="font-bold text-gray-700">{project.activeSectionsCount || 0} أقسام نشطة</span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                   <span className="text-gray-500">نسبة الإنجاز</span>
                   <span className="text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                 <div className="text-center bg-gray-50 rounded py-1">
                   <span className="block text-sm font-bold text-gray-900">{project.totalTasks}</span>
                   <span className="block text-[9px] text-gray-500">إجمالي المهام</span>
                 </div>
                 <div className="text-center bg-blue-50 rounded py-1">
                   <span className="block text-sm font-bold text-blue-700">{project.completedTasks}</span>
                   <span className="block text-[9px] text-blue-600">مكتملة</span>
                 </div>
              </div>
            </div>
          </div>
        );
      })}

      {projects.length === 0 && (
        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-200 border-dashed rounded-2xl">
           <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           <span className="text-sm font-bold">لا توجد مشاريع عمل حالياً.</span>
        </div>
      )}
    </div>
  );
}
