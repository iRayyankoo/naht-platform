import React, { useState } from 'react';
import { TaskDTO } from '../types';
import { getTaskColor } from '../lib/date-utils';

interface CalendarViewProps {
  filteredTasks: TaskDTO[];
  onClick: (task: TaskDTO) => void;
}

export function CalendarView({ filteredTasks, onClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // Adjust to make Sunday = 0
    return day;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(currentDate);

  const unscheduledTasks = filteredTasks.filter(t => !t.dueDate && !t.plannedStartAt);
  const scheduledTasks = filteredTasks.filter(t => t.dueDate || t.plannedStartAt);

  const getTasksForDay = (day: number) => {
    return scheduledTasks.filter(t => {
      const taskDate = new Date(t.dueDate || t.plannedStartAt!);
      return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-4" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700">اليوم</button>
          <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Main Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0 border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(dayName => (
              <div key={dayName} className="py-2 text-center text-sm font-bold text-gray-600 border-l border-gray-100 last:border-0">{dayName}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-fr">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="border-b border-l border-gray-100 bg-gray-50/50 p-1"></div>
            ))}
            {days.map(day => {
              const dayTasks = getTasksForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              return (
                <div key={day} className={`border-b border-l border-gray-100 p-1 flex flex-col gap-1 overflow-hidden hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                  <span className={`text-xs font-bold p-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#D4AF37] text-white' : 'text-gray-500'}`}>{day}</span>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 scrollbar-hide">
                    {dayTasks.map(task => (
                      <button 
                        key={task.id} 
                        onClick={() => onClick(task)}
                        className="text-[10px] text-right truncate px-1.5 py-0.5 rounded text-white font-medium hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: getTaskColor(task) }}
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unscheduled Tasks Sidebar */}
        <div className="w-64 flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
          <div className="p-3 border-b border-gray-200 bg-white">
            <h3 className="font-bold text-gray-700 text-sm">مهام غير مجدولة</h3>
            <p className="text-xs text-gray-500 mt-0.5">{unscheduledTasks.length} مهمة بدون تاريخ استحقاق</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {unscheduledTasks.map(task => (
              <button
                key={task.id}
                onClick={() => onClick(task)}
                className="text-right p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#D4AF37] transition-colors group text-sm"
              >
                <div className="font-medium text-gray-800 line-clamp-2 group-hover:text-[#D4AF37]">{task.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTaskColor(task) }}></span>
                  {task.assignedTo?.name || 'غير مسند'}
                </div>
              </button>
            ))}
            {unscheduledTasks.length === 0 && (
              <div className="text-center p-4 text-gray-400 text-sm">لا توجد مهام غير مجدولة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
