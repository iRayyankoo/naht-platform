import React, { useState } from 'react';
import { WorkProjectDTO, WorkProjectSectionDTO, WorkProjectSectionsAdapter } from '../types';

interface WorkProjectSectionMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkProjectDTO;
  section: WorkProjectSectionDTO;
  adapter: WorkProjectSectionsAdapter;
  onSuccess: () => void;
}

export function WorkProjectSectionMembersModal({ isOpen, onClose, project, section, adapter, onSuccess }: WorkProjectSectionMembersModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMember = async (userId: string) => {
    setIsSubmitting(userId);
    setError(null);
    try {
      await adapter.addMember(section.id, userId);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة العضو');
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setIsSubmitting(userId);
    setError(null);
    try {
      await adapter.removeMember(section.id, userId);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إزالة العضو');
    } finally {
      setIsSubmitting(null);
    }
  };

  const isReadOnly = section.status === 'ARCHIVED' || project.status === 'COMPLETED' || project.status === 'CANCELLED';

  const sectionMemberIds = section.members.map(m => m.user.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">إدارة أعضاء القسم</h3>
            <p className="text-sm text-gray-500 mt-1">{section.name}</p>
          </div>
          <button onClick={onClose} disabled={!!isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600 font-medium bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
            يمكنك إضافة أعضاء إلى القسم من بين أعضاء مشروع العمل. مدير القسم يجب أن يكون عضواً بالقسم.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">أعضاء المشروع</h4>
            {project.members.map(projectMember => {
              const isSectionMember = sectionMemberIds.includes(projectMember.user.id);
              const isManager = section.managerId === projectMember.user.id;

              return (
                <div key={projectMember.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                      {projectMember.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        {projectMember.user.name}
                        {isManager && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">مدير القسم</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{projectMember.role === 'OWNER' ? 'مالك' : projectMember.role === 'MANAGER' ? 'مدير مشروع' : 'عضو مشروع'}</div>
                    </div>
                  </div>
                  
                  {!isReadOnly && !isManager && (
                    <button
                      onClick={() => isSectionMember ? handleRemoveMember(projectMember.user.id) : handleAddMember(projectMember.user.id)}
                      disabled={!!isSubmitting}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2
                        ${isSectionMember 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                          : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10'}`}
                    >
                      {isSubmitting === projectMember.user.id && (
                        <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${isSectionMember ? 'border-red-600' : 'border-primary'}`}></div>
                      )}
                      {isSectionMember ? 'إزالة' : 'إضافة'}
                    </button>
                  )}
                  {isManager && (
                    <span className="text-xs text-gray-400 font-medium px-2">لا يمكن إزالته</span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={!!isSubmitting}
            className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
