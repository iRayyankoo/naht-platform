"use client";

import React, { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateWorkProjectModal } from './components/CreateWorkProjectModal';
import { WorkProjectDetailsDrawer } from './components/WorkProjectDetailsDrawer';
import { WorkProjectsList } from './components/WorkProjectsList';
import { TaskViewSwitcher } from '../components/TaskViewSwitcher';
import { CardsView } from '../components/CardsView';
import { CalendarView } from '../components/CalendarView';
import { TimelineView } from '../components/TimelineView';
import { GanttView } from '../components/GanttView';
import { useTaskViewMode } from '../hooks/useTaskViewMode';
import { INITIAL_TASKS, MockTask, TaskStatus, MOCK_WORK_PROJECTS, MockWorkProject, MOCK_USERS, MOCK_WORK_PROJECT_SECTIONS } from './components/data';
import { Toaster } from 'react-hot-toast';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
type MainTab = 'TASKS' | 'WORK_PROJECTS';

export default function DesignPreviewPage() {
  const [tasks, setTasks] = useState<MockTask[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<MockWorkProject[]>(MOCK_WORK_PROJECTS);

  const [mockSaveSuccess, setMockSaveSuccess] = useState(true);

  const mockSaveAction = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (mockSaveSuccess) return { success: true };
    return { success: false, error: 'محاكاة فشل الحفظ' };
  };

  const { viewMode, changeViewMode } = useTaskViewMode('KANBAN', mockSaveAction);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL'); // ALL, GENERAL, or projId

  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);
  const [selectedWorkProject, setSelectedWorkProject] = useState<MockWorkProject | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [role, setRole] = useState<Role>('ADMIN');
  const [mainTab, setMainTab] = useState<MainTab>('TASKS');

  // Move task logic
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.taskStatus === 'DONE' || t.taskStatus === 'CANCELLED') return t;
        if (t.requiresApproval && t.approvalStatus !== 'APPROVED' && newStatus === 'DONE') {
          alert('هذه المهمة تتطلب اعتماداً قبل نقلها إلى مكتملة (محاكاة).');
          return t;
        }
        return { ...t, taskStatus: newStatus };
      }
      return t;
    }));
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.includes(searchQuery) || (t.description || '').includes(searchQuery);
    const matchesProject = selectedProjectId === 'ALL'
      ? true
      : selectedProjectId === 'GENERAL'
        ? t.workProjectId === null
        : t.workProjectId === selectedProjectId;

    return matchesSearch && matchesProject;
  });

  const mappedFilteredTasks = filteredTasks.map(t => ({
    ...t,
    assignedTo: t.assigneeId ? MOCK_USERS.find(u => u.id === t.assigneeId) || null : null,
    workProjectSection: t.workProjectSectionId ? MOCK_WORK_PROJECT_SECTIONS.find(s => s.id === t.workProjectSectionId) || null : null
  }));

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
                 <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">معاينة التصميم</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">واجهة محاكاة (بدون اتصال بالخادم) - فصل كامل لمشاريع العمل</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 border-l pl-4 border-gray-200 h-8 items-center">
                <label className="text-xs text-gray-600 flex items-center gap-1 font-bold">
                  <input type="checkbox" checked={mockSaveSuccess} onChange={(e) => setMockSaveSuccess(e.target.checked)} className="rounded" />
                  حفظ العرض ناجح؟
                </label>
              </div>

              {/* Role Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setRole('SUPER_ADMIN')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    role === 'SUPER_ADMIN' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  مدير النظام
                </button>
                <button
                  onClick={() => setRole('ADMIN')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    role === 'ADMIN' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  مدير
                </button>
                <button
                  onClick={() => setRole('EMPLOYEE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    role === 'EMPLOYEE' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  موظف
                </button>
              </div>

              {mainTab === 'TASKS' ? (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  مهمة جديدة
                </button>
              ) : (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  مشروع عمل جديد
                </button>
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
             <button
               onClick={() => setMainTab('WORK_PROJECTS')}
               className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${
                 mainTab === 'WORK_PROJECTS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               مشاريع العمل
             </button>
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
                  {projects.map(p => (
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

              <div className="w-full mt-4 md:mt-0">
                <TaskViewSwitcher currentView={viewMode} onChangeView={changeViewMode} />
              </div>
            </div>

            {/* Board / List */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {viewMode === 'KANBAN' ? (
                <KanbanBoard filteredTasks={mappedFilteredTasks} onMoveTask={handleMoveTask} onClick={setSelectedTask} />
              ) : viewMode === 'TABLE' ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
                  <ListView filteredTasks={mappedFilteredTasks} onClick={setSelectedTask} />
                </div>
              ) : viewMode === 'CARDS' ? (
                <div className="flex-1 overflow-y-auto">
                  {/* @ts-expect-error Ignore type mismatch between mock and real tasks for preview */}
                  <CardsView filteredTasks={mappedFilteredTasks} onClick={setSelectedTask} />
                </div>
              ) : viewMode === 'CALENDAR' ? (
                <div className="flex-1 min-h-0">
                  {/* @ts-expect-error Ignore type mismatch */}
                  <CalendarView filteredTasks={mappedFilteredTasks} onClick={setSelectedTask} />
                </div>
              ) : viewMode === 'TIMELINE' ? (
                <div className="flex-1 min-h-0">
                  {/* @ts-expect-error Ignore type mismatch */}
                  <TimelineView filteredTasks={mappedFilteredTasks} onClick={setSelectedTask} />
                </div>
              ) : viewMode === 'GANTT' ? (
                <div className="flex-1 min-h-0">
                  {/* @ts-expect-error Ignore type mismatch */}
                  <GanttView filteredTasks={mappedFilteredTasks} onClick={setSelectedTask} />
                </div>
              ) : null}
            </div>
          </>
        )}

        {mainTab === 'WORK_PROJECTS' && (
          <div className="flex-1">
             <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                   <h2 className="text-lg font-bold text-gray-900">مشاريع العمل المتاحة</h2>
                   <p className="text-xs text-gray-500 mt-1">تتبع وإدارة مشاريع العمل المستقلة</p>
                </div>
             </div>

             <WorkProjectsList
               projects={projects}
               onClick={setSelectedWorkProject}
             />
          </div>
        )}
      </main>

      {/* Drawers & Modals */}
      {selectedTask && (
        <TaskDetailsDrawer
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={(updated) => {
             setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
             setSelectedTask(updated);
          }}
          role={role}
        />
      )}

      {selectedWorkProject && (
        <WorkProjectDetailsDrawer
          project={selectedWorkProject}
          isOpen={true}
          onClose={() => setSelectedWorkProject(null)}
          role={role}
          onOpenCreateTask={(projId) => {
             setSelectedProjectId(projId);
             setIsTaskModalOpen(true);
          }}
        />
      )}

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        role={role}
        initialProjectId={selectedProjectId !== 'ALL' ? selectedProjectId : null}
      />

      <CreateWorkProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={(newProj) => {
           setProjects(prev => [...prev, newProj]);
        }}
      />

    </div>
  );
}
