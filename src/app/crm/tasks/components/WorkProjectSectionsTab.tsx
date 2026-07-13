import React, { useState, useEffect } from 'react';
import { WorkProjectDTO, WorkProjectSectionDTO, ClientPermissions, WorkProjectSectionsAdapter } from '../types';
import { WorkProjectSectionMembersModal } from './WorkProjectSectionMembersModal';

interface WorkProjectSectionsTabProps {
  project: WorkProjectDTO;
  permissions: ClientPermissions;
  adapter: WorkProjectSectionsAdapter;
  onOpenCreateModal?: () => void;
  onOpenEditModal?: (section: WorkProjectSectionDTO) => void;
  onSectionChange?: (action: 'CREATE' | 'ARCHIVE' | 'UPDATE') => void;
  refreshTrigger?: number;
}

type FilterType = 'ALL' | 'ACTIVE' | 'ARCHIVED';

export function WorkProjectSectionsTab({ project, permissions, adapter, onOpenCreateModal, onOpenEditModal, onSectionChange, refreshTrigger }: WorkProjectSectionsTabProps) {
  const [sections, setSections] = useState<WorkProjectSectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [filter, setFilter] = useState<FilterType>('ACTIVE');
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [managingMembersSection, setManagingMembersSection] = useState<WorkProjectSectionDTO | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adapter.getSections(project.id, filter !== 'ALL');
        if (isMounted) {
          if (filter === 'ACTIVE') {
            setSections(data.filter(s => s.status === 'ACTIVE'));
          } else if (filter === 'ARCHIVED') {
            setSections(data.filter(s => s.status === 'ARCHIVED'));
          } else {
            setSections(data);
          }
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message || 'فشل تحميل الأقسام');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSections();
    return () => { isMounted = false; };
  }, [project.id, filter, refreshTrigger, adapter, internalRefresh]);

  const handleArchive = async (section: WorkProjectSectionDTO) => {
    if (!window.confirm(`هل أنت متأكد من أرشفة القسم "${section.name}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم منع إضافة مهام جديدة إليه.`)) return;
    
    setIsArchiving(section.id);
    try {
      await adapter.archiveSection(section.id);
      if (onSectionChange) onSectionChange('ARCHIVE');
      setInternalRefresh(r => r + 1);
    } catch (err) {
      alert((err as Error).message || 'فشل أرشفة القسم');
    } finally {
      setIsArchiving(null);
    }
  };

  const isReadOnly = project.status === 'COMPLETED' || project.status === 'CANCELLED';

  const canManageSections = permissions.isSuperAdmin || permissions.canEditWorkProjects; 

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['ACTIVE', 'ARCHIVED', 'ALL'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f === 'ACTIVE' ? 'النشطة' : f === 'ARCHIVED' ? 'المؤرشفة' : 'الكل'}
            </button>
          ))}
        </div>
        
        {canManageSections && !isReadOnly && (
          <button 
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            إضافة قسم
          </button>
        )}
      </div>

      {/* States */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="py-8 text-center bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 text-sm font-bold mb-2">{error}</p>
          <button onClick={() => setInternalRefresh(r => r + 1)} className="text-xs text-red-500 hover:text-red-700 underline">إعادة المحاولة</button>
        </div>
      ) : sections.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="text-sm font-bold text-gray-500">لا توجد أقسام مطابقة للفلتر</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sections.map(section => (
            <div key={section.id} className={`p-4 bg-white border rounded-xl flex flex-col gap-3 transition-colors ${section.status === 'ARCHIVED' ? 'border-gray-200 bg-gray-50/50 opacity-80' : 'border-gray-200 hover:border-primary/30'}`}>
              
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: section.color || '#3B82F6' }}></div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{section.name}</h4>
                    {section.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.status === 'ARCHIVED' && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">مؤرشف</span>
                  )}
                  {canManageSections && !isReadOnly && section.status !== 'ARCHIVED' && (
                    <div className="flex items-center gap-1">
                      {onOpenEditModal && (
                        <button onClick={() => onOpenEditModal(section)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="تعديل">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                      <button 
                        onClick={() => handleArchive(section)} 
                        disabled={isArchiving === section.id}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50" 
                        title="أرشفة"
                      >
                        {isArchiving === section.id ? (
                          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-bold">المدير</span>
                  <div className="flex items-center gap-1.5">
                    {section.manager ? (
                      <>
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px] font-bold">
                          {section.manager.name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-700 font-medium line-clamp-1">{section.manager.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">غير محدد</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-bold">الأعضاء</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 font-medium">{section.members?.length || 0} أعضاء</span>
                    {canManageSections && !isReadOnly && section.status !== 'ARCHIVED' && (
                      <button 
                        onClick={() => setManagingMembersSection(section)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded font-bold transition-colors"
                      >
                        إدارة
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-bold">إنجاز المهام</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: `${section.progressPercentage || 0}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{section.progressPercentage || 0}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-bold">حالة المهام</span>
                  <div className="flex items-center gap-2 text-[10px] font-medium">
                    <span className="text-blue-600" title="مفتوحة/جاري العمل">{section.tasksCount ? section.tasksCount - (section.completedTasksCount || 0) : 0} م</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-green-600" title="مكتملة">{section.completedTasksCount || 0} ك</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {managingMembersSection && (
        <WorkProjectSectionMembersModal
          isOpen={true}
          onClose={() => setManagingMembersSection(null)}
          project={project}
          section={managingMembersSection}
          adapter={adapter}
          onSuccess={() => setInternalRefresh(r => r + 1)}
        />
      )}
    </div>
  );
}
