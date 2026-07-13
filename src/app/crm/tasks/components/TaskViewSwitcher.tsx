"use client";

import React, { useRef } from 'react';
import { ClientTaskViewMode } from '../types';

interface TaskViewSwitcherProps {
  currentView: ClientTaskViewMode;
  onChangeView: (view: ClientTaskViewMode) => void;
}

const TableIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const KanbanIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CardsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TimelineIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const GanttIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h14" />
  </svg>
);

const VIEWS: { id: ClientTaskViewMode; label: string; Icon: React.FC<{className?: string}> }[] = [
  { id: 'TABLE', label: 'الجدول', Icon: TableIcon },
  { id: 'GANTT', label: 'مخطط جانت', Icon: GanttIcon },
  { id: 'TIMELINE', label: 'الخط الزمني', Icon: TimelineIcon },
  { id: 'CALENDAR', label: 'التقويم', Icon: CalendarIcon },
  { id: 'KANBAN', label: 'لوحة المهام', Icon: KanbanIcon },
  { id: 'CARDS', label: 'البطاقات', Icon: CardsIcon },
];

export function TaskViewSwitcher({ currentView, onChangeView }: TaskViewSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const prev = index === 0 ? VIEWS.length - 1 : index - 1;
      const button = containerRef.current?.querySelectorAll('button')[prev];
      button?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = index === VIEWS.length - 1 ? 0 : index + 1;
      const button = containerRef.current?.querySelectorAll('button')[next];
      button?.focus();
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide" dir="rtl">
      <div 
        ref={containerRef}
        role="tablist" 
        aria-label="طرق عرض المهام"
        className="flex items-center gap-2 min-w-max p-1 bg-neutral-100 rounded-lg dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50"
      >
        {VIEWS.map((view, idx) => {
          const isSelected = currentView === view.id;
          
          return (
            <button
              key={view.id}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChangeView(view.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
                isSelected 
                  ? "bg-white dark:bg-neutral-800 text-[#D4AF37] shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
              }`}
            >
              <view.Icon className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : ""}`} />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
