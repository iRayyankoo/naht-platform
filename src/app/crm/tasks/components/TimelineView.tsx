import React, { useState, useMemo } from 'react';
import { TaskDTO } from '../types';
import { getTaskColor, formatTaskDate } from '../lib/date-utils';

interface TimelineViewProps {
  filteredTasks: TaskDTO[];
  onClick: (task: TaskDTO) => void;
}

export function TimelineView({ filteredTasks, onClick }: TimelineViewProps) {
  const unscheduledTasks = filteredTasks.filter(t => !t.plannedStartAt && !t.dueDate);
  const scheduledTasks = filteredTasks.filter(t => t.plannedStartAt || t.dueDate);

  const defaultBaseDate = useMemo(() => {
    if (scheduledTasks.length === 0) return new Date();
    let min = new Date(scheduledTasks[0].plannedStartAt || scheduledTasks[0].dueDate!).getTime();
    scheduledTasks.forEach(t => {
      const start = new Date(t.plannedStartAt || t.dueDate!).getTime();
      if (start < min) min = start;
    });
    return new Date(min);
  }, [scheduledTasks]);

  const [baseDate, setBaseDate] = useState<Date>(defaultBaseDate);

  const { minDate, maxDate, dateRangeDays } = useMemo(() => {
    // Show 180 days around baseDate
    const min = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 30);
    const max = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 150);
    return { minDate: min, maxDate: max, dateRangeDays: 180 };
  }, [baseDate]);

  const scaleFactor = 40; // 40px per day to fit more

  const { visibleTasks, outOfRangeTasks } = useMemo(() => {
    const v: TaskDTO[] = [];
    const o: TaskDTO[] = [];
    scheduledTasks.forEach(task => {
      const tStart = new Date(task.plannedStartAt || task.dueDate!).getTime();
      const tEnd = new Date(task.dueDate || task.plannedStartAt!).getTime();
      
      if (tEnd < minDate.getTime() || tStart > maxDate.getTime()) {
        o.push(task);
      } else {
        v.push(task);
      }
    });
    return { visibleTasks: v, outOfRangeTasks: o };
  }, [scheduledTasks, minDate, maxDate]);

  // Group by assignee
  const groupedTasks = useMemo(() => {
    const groups: Record<string, { assigneeName: string; tasks: TaskDTO[] }> = {};
    groups['UNASSIGNED'] = { assigneeName: 'غير مسند', tasks: [] };

    visibleTasks.forEach(task => {
      if (task.assignedTo) {
        if (!groups[task.assignedTo.id]) {
          groups[task.assignedTo.id] = { assigneeName: task.assignedTo.name, tasks: [] };
        }
        groups[task.assignedTo.id].tasks.push(task);
      } else {
        groups['UNASSIGNED'].tasks.push(task);
      }
    });

    if (groups['UNASSIGNED'].tasks.length === 0) delete groups['UNASSIGNED'];
    return Object.values(groups).sort((a,b) => a.assigneeName === 'غير مسند' ? 1 : b.assigneeName === 'غير مسند' ? -1 : a.assigneeName.localeCompare(b.assigneeName));
  }, [visibleTasks]);

  const calculateStyle = (task: TaskDTO) => {
    let tStart = new Date(task.plannedStartAt || task.dueDate!).getTime();
    let tEnd = new Date(task.dueDate || task.plannedStartAt!).getTime();
    
    const isOriginalMilestone = tStart === tEnd;

    if (tStart < minDate.getTime()) tStart = minDate.getTime();
    if (tEnd > maxDate.getTime()) tEnd = maxDate.getTime();

    const offsetDays = (tStart - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (tEnd - tStart) / (1000 * 60 * 60 * 24);

    return {
      right: `${offsetDays * scaleFactor}px`, // RTL
      width: Math.max(durationDays * scaleFactor, 30) + 'px',
      isMilestone: isOriginalMilestone
    };
  };

  const dayHeaders = Array.from({ length: dateRangeDays }, (_, i) => {
    const d = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      label: d.getDate(),
      dayName: new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { weekday: 'short' }).format(d),
      isWeekend: d.getDay() === 5 || d.getDay() === 6
    };
  });

  const goPrev = () => setBaseDate(d => new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()));
  const goNext = () => setBaseDate(d => new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  const goToday = () => setBaseDate(new Date());
  
  const rangeTitle = `${new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(baseDate)}`;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-4" dir="rtl">
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{rangeTitle}</h2>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700">اليوم</button>
          <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
            <button onClick={goPrev} className="p-1.5 hover:bg-gray-200 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={goNext} className="p-1.5 hover:bg-gray-200 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Timeline Area */}
        <div className="flex-1 flex flex-col min-w-0 border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
            <div className="min-w-max flex flex-col flex-1 relative">
              
              {/* Header Grid */}
              <div className="flex bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <div className="w-48 shrink-0 border-l border-gray-200 bg-white flex items-center justify-center font-bold text-gray-600 text-sm sticky right-0 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">
                  المنفذ
                </div>
                <div className="flex relative" style={{ width: dateRangeDays * scaleFactor }}>
                  {dayHeaders.map((dh, i) => (
                     <div key={i} className={`flex flex-col items-center justify-center border-l border-gray-100 text-xs py-1 ${dh.isWeekend ? 'bg-gray-100/50 text-gray-400' : 'text-gray-500'}`} style={{ width: scaleFactor }}>
                      <span className={`font-bold ${dh.isWeekend ? 'text-gray-500' : 'text-gray-700'}`}>{dh.label}</span>
                      <span>{dh.dayName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="flex-1 bg-white relative">
                {/* Vertical Guidelines */}
                <div className="absolute inset-0 flex pointer-events-none pr-48">
                   {dayHeaders.map((dh, i) => (
                     <div key={i} className={`border-l border-gray-50 h-full ${dh.isWeekend ? 'bg-gray-50/30' : ''}`} style={{ width: scaleFactor }}></div>
                   ))}
                </div>

                {groupedTasks.map(group => (
                  <div key={group.assigneeName} className="flex border-b border-gray-100 relative group-hover:bg-gray-50/50">
                    <div className="w-48 py-4 px-3 shrink-0 border-l border-gray-100 bg-white sticky right-0 z-10 flex items-center shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">
                      <span className="font-bold text-sm text-gray-800">{group.assigneeName}</span>
                    </div>
                    <div className="relative py-4" style={{ width: dateRangeDays * scaleFactor }}>
                      {group.tasks.map(task => {
                        const style = calculateStyle(task);
                        const color = getTaskColor(task);
                        return (
                          <div
                            key={task.id}
                            className="absolute top-4 h-8 flex items-center group cursor-pointer transition-transform hover:-translate-y-0.5"
                            style={{ right: style.right, width: style.isMilestone ? '20px' : style.width }}
                            onClick={() => onClick(task)}
                            title={`${task.title}\n${formatTaskDate(task.plannedStartAt)} - ${formatTaskDate(task.dueDate)}`}
                          >
                            {style.isMilestone ? (
                               <div className="w-5 h-5 rotate-45 border-2 border-white shadow-sm mx-auto" style={{ backgroundColor: color }}></div>
                            ) : (
                               <div className="w-full h-full rounded-md shadow-sm overflow-hidden flex items-center px-2 text-xs font-medium text-white truncate" style={{ backgroundColor: color }}>
                                 {task.title}
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {visibleTasks.length === 0 && (
                  <div className="p-8 text-center text-gray-400">لا توجد مهام في هذا النطاق الزمني</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebars */}
        <div className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
          
          {/* Out of Range Tasks */}
          {outOfRangeTasks.length > 0 && (
            <div className="flex-1 flex flex-col bg-amber-50/50 rounded-xl border border-amber-100 overflow-hidden min-h-[200px]">
              <div className="p-3 border-b border-amber-200 bg-amber-100/50">
                <h3 className="font-bold text-amber-900 text-sm">مهام خارج النطاق</h3>
                <p className="text-xs text-amber-700 mt-0.5">{outOfRangeTasks.length} مهمة متباعدة</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
                {outOfRangeTasks.map(task => (
                  <div key={task.id} className="p-2 bg-white border border-amber-200 rounded-lg shadow-sm text-sm">
                    <div className="font-medium text-gray-800 line-clamp-1">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTaskDate(task.plannedStartAt || task.dueDate)}
                    </div>
                    <button
                      onClick={() => setBaseDate(new Date(task.plannedStartAt || task.dueDate!))}
                      className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      الانتقال للتاريخ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unscheduled Tasks */}
          <div className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden min-h-[200px]">
            <div className="p-3 border-b border-gray-200 bg-white">
              <h3 className="font-bold text-gray-700 text-sm">مهام غير مجدولة</h3>
              <p className="text-xs text-gray-500 mt-0.5">{unscheduledTasks.length} مهمة بدون تواريخ</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
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
    </div>
  );
}
