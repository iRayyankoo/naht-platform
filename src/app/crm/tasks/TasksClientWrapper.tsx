"use client";

import React, { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateWorkProjectModal } from './components/CreateWorkProjectModal';
import { WorkProjectDetailsDrawer } from './components/WorkProjectDetailsDrawer';
import { WorkProjectsList } from './components/WorkProjectsList';
import { TaskDTO, WorkProjectDTO, ClientPermissions, UserDTO } from './types';
import { Toaster } from 'react-hot-toast';

type MainTab = 'TASKS' | 'WORK_PROJECTS';

interface TasksClientWrapperProps {
  initialTasks: TaskDTO[];
  initialProjects: WorkProjectDTO[];
  permissions: ClientPermissions;
  users: UserDTO[];
}

export function TasksClientWrapper({ initialTasks, initialProjects, permissions, users }: TasksClientWrapperProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL'); // ALL, GENERAL, or projId

  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [selectedWorkProject, setSelectedWorkProject] = useState<WorkProjectDTO | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('TASKS');

  // Filter Tasks locally for fast search
  const filteredTasks = initialTasks.filter(t => {
    const matchesSearch = t.title.includes(searchQuery) || (t.description || '').includes(searchQuery);
    const matchesProject = selectedProjectId === 'ALL'
      ? true
      : selectedProjectId === 'GENERAL'
        ? t.workProjectId === null
        : t.workProjectId === selectedProjectId;

    return matchesSearch && matchesProject;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-bold text-gray-900">إدارة المهام ومشاريع العمل</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">تتبع المهام ومسؤوليات فريق العمل والاعتمادات</p>
            </div>

            <div className="flex items-center gap-3">
              {mainTab === 'TASKS' ? (
                permissions.canCreateTasks && (
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    مهمة جديدة
                  </button>
                )
              ) : (
                permissions.canCreateWorkProjects && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    مشروع عمل جديد
                  </button>
                )
              )}
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex gap-6 border-t border-gray-100 pt-4 pb-0">
             <button
               onClick={() => setMainTab('TASKS')}
               className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${
                 mainTab === 'TASKS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               المهام
             </button>
             {permissions.canViewWorkProjects && (
               <button
                 onClick={() => setMainTab('WORK_PROJECTS')}
                 className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${
                   mainTab === 'WORK_PROJECTS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 مشاريع العمل
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col">

        {mainTab === 'TASKS' && (
          <>
            {/* Task Filters & Tools */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">

              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Project Filter */}
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary flex-1 md:w-64"
                >
                  <option value="ALL">كل المهام (الجميع)</option>
                  <option value="GENERAL">المهام العامة (بدون مشروع)</option>
                  {initialProjects.map(p => (
                    <option key={p.id} value={p.id}>مشروع: {p.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="بحث في المهام..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all w-10 h-10 ${
                    viewMode === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="عرض اللوحة (Kanban)"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all w-10 h-10 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="عرض القائمة (List)"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
              </div>
            </div>

            {/* Board / List */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {filteredTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-300 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مهام مطابقة</h3>
                  <p className="text-gray-500 text-sm max-w-md">جرّب تغيير الفلاتر المحددة أعلاه، أو قم بإنشاء مهمة جديدة.</p>
                </div>
              ) : viewMode === 'kanban' ? (
                <KanbanBoard filteredTasks={filteredTasks} onClick={setSelectedTask} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
                  <ListView filteredTasks={filteredTasks} onClick={setSelectedTask} />
                </div>
              )}
            </div>
          </>
        )}

        {mainTab === 'WORK_PROJECTS' && (
          <div className="flex-1 flex flex-col">
             <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                   <h2 className="text-lg font-bold text-gray-900">مشاريع العمل المتاحة</h2>
                   <p className="text-xs text-gray-500 mt-1">تتبع وإدارة مشاريع العمل المستقلة</p>
                </div>
             </div>

             {initialProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-300 text-6xl mb-4">📂</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مشاريع عمل</h3>
                  <p className="text-gray-500 text-sm max-w-md">لم تقم بإنشاء أي مشاريع عمل بعد، أنشئ مشروعاً جديداً للبدء.</p>
                </div>
             ) : (
               <WorkProjectsList
                 projects={initialProjects}
                 onClick={setSelectedWorkProject}
               />
             )}
          </div>
        )}
      </main>

      {/* Drawers & Modals */}
      {selectedTask && (
        <TaskDetailsDrawer
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          permissions={permissions}
        />
      )}

      {selectedWorkProject && (
        <WorkProjectDetailsDrawer
          project={selectedWorkProject}
          isOpen={true}
          onClose={() => setSelectedWorkProject(null)}
          permissions={permissions}
          onOpenCreateTask={(projId) => {
             setSelectedProjectId(projId);
             setIsTaskModalOpen(true);
          }}
        />
      )}

      {isTaskModalOpen && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          permissions={permissions}
          initialProjectId={selectedProjectId !== 'ALL' ? selectedProjectId : null}
          workProjects={initialProjects}
          users={users}
        />
      )}

      {isProjectModalOpen && (
        <CreateWorkProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}

    </div>
  );
}
