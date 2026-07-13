"use client";

import React, { useState, useTransition } from 'react';
import { WorkProjectStatus } from '../types';
import toast from 'react-hot-toast';
import { createWorkProject } from '@/actions/workProjects';
import { useRouter } from 'next/navigation';

interface CreateWorkProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkProjectModal({ isOpen, onClose }: CreateWorkProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkProjectStatus>('PLANNING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast.error('يرجى تعبئة الحقول المطلوبة.');
      return;
    }

    startTransition(async () => {
       try {
          const res = await createWorkProject({
             name,
             description,
             status,
             startDate: new Date(startDate),
             endDate: new Date(endDate)
          });

          if (res?.success) {
             toast.success('تم إنشاء مشروع العمل بنجاح');
             onClose();
             router.refresh();
          }
       } catch (err) {
          console.error(err);
          toast.error('حدث خطأ أثناء الإنشاء');
       }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-gray-900">مشروع عمل جديد</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم مشروع العمل *</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أدخل اسماً واضحاً لمشروع العمل"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="أهداف مشروع العمل وتفاصيله..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
              ></textarea>
            </div>

            {/* Status */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WorkProjectStatus)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="PLANNING">تخطيط</option>
                <option value="ACTIVE">نشط</option>
                <option value="PAUSED">متوقف مؤقتاً</option>
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية *</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية المتوقع *</label>
              <input
                required
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-right"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              حفظ وإنشاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
