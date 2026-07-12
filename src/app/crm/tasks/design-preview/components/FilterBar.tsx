"use client";

import React from 'react';
import { TaskStatus, Priority } from './data';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: TaskStatus | 'ALL';
  setFilterStatus: (val: TaskStatus | 'ALL') => void;
  filterPriority: Priority | 'ALL';
  setFilterPriority: (val: Priority | 'ALL') => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
       <div className="relative w-full md:w-96">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text"
            placeholder="ابحث في المهام..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
       </div>
       <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
             className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none"
          >
             <option value="ALL">كل الحالات</option>
             <option value="TODO">قيد الانتظار</option>
             <option value="IN_PROGRESS">جاري التنفيذ</option>
             <option value="DONE">مكتملة</option>
             <option value="CANCELLED">ملغاة</option>
          </select>
          
          <select 
             value={filterPriority}
             onChange={e => setFilterPriority(e.target.value as Priority | 'ALL')}
             className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none"
          >
             <option value="ALL">كل الأولويات</option>
             <option value="HIGH">عالي</option>
             <option value="MEDIUM">متوسط</option>
             <option value="LOW">منخفض</option>
          </select>
       </div>
    </div>
  );
}
