import React from 'react';
import { TaskDTO } from '../types';
import { formatTaskDate } from '../lib/date-utils';

interface CardsViewProps {
  filteredTasks: TaskDTO[];
  onClick: (task: TaskDTO) => void;
}

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function CardsView({ filteredTasks, onClick }: CardsViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DONE': return 'مكتملة';
      case 'IN_PROGRESS': return 'قيد التنفيذ';
      case 'CANCELLED': return 'ملغاة';
      default: return 'بانتظار البدء';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'عالية';
      case 'MEDIUM': return 'متوسطة';
      default: return 'منخفضة';
    }
  };

  const getApprovalStatusLabel = (status: string | null) => {
    switch (status) {
      case 'APPROVED': return { label: 'معتمدة', color: 'text-emerald-600', Icon: CheckCircleIcon };
      case 'REJECTED': return { label: 'مرفوضة', color: 'text-red-600', Icon: AlertIcon };
      case 'PENDING': return { label: 'بانتظار الاعتماد', color: 'text-amber-600', Icon: ClockIcon };
      default: return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, task: TaskDTO) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(task);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8" dir="rtl">
      {filteredTasks.map(task => {
        const approvalInfo = getApprovalStatusLabel(task.approvalStatus);
        const ApprovalIcon = approvalInfo?.Icon;

        return (
          <div
            key={task.id}
            role="button"
            tabIndex={0}
            onClick={() => onClick(task)}
            onKeyDown={(e) => handleKeyDown(e, task)}
            className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-[#D4AF37]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs font-medium text-gray-500 truncate max-w-[120px]">
                  {task.workProjectId ? 'مشروع عمل' : 'مهمة عامة'}
                </span>
                {task.workProjectSection && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-[100px]"
                      style={{ 
                        backgroundColor: task.workProjectSection.color ? `${task.workProjectSection.color}20` : '#f3f4f6',
                        color: task.workProjectSection.color || '#4b5563'
                      }}
                    >
                      {task.workProjectSection.name}
                    </span>
                  </>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-md border ${getStatusColor(task.taskStatus)}`}>
                {getStatusLabel(task.taskStatus)}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {task.description}
              </p>
            )}

            <div className="flex-1" />

            <div className="flex flex-col gap-1.5 mb-4 mt-2">
              {(task.plannedStartAt || task.dueDate) ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div className="flex flex-col">
                    {task.plannedStartAt && (
                      <span>البداية: {formatTaskDate(task.plannedStartAt)}</span>
                    )}
                    {task.dueDate && (
                      <span className={!task.plannedStartAt ? '' : 'text-gray-400'}>
                        الاستحقاق: {formatTaskDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg italic">
                  <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                  <span>لم يتم تحديد تواريخ</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 -space-x-reverse" title="المنفذ والمعتمد">
                  {task.assignedTo ? (
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border-2 border-white ring-1 ring-gray-100 z-10">
                      <span className="text-xs font-bold text-[#D4AF37]">{task.assignedTo.name.substring(0,2)}</span>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white ring-1 ring-gray-100 z-10">
                      <span className="text-xs text-gray-400">--</span>
                    </div>
                  )}
                  {task.requiresApproval && task.designatedApprover && (
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white ring-1 ring-gray-100">
                      <span className="text-xs font-bold text-blue-600">{task.designatedApprover.name.substring(0,2)}</span>
                    </div>
                  )}
                </div>
                
                {approvalInfo && ApprovalIcon && (
                  <div className={`flex items-center gap-1 text-xs ${approvalInfo.color}`} title={approvalInfo.label}>
                    <ApprovalIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
                
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MessageIcon className="w-3.5 h-3.5" />
                    <span>{task.comments.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
