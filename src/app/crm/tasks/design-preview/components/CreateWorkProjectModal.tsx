import React, { useState, useRef } from 'react';
import { MOCK_USERS, WorkProjectStatus, MockWorkProject } from './data';
import { Role } from '../page';
import toast from 'react-hot-toast';

interface CreateWorkProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  onProjectCreated: (project: MockWorkProject) => void;
}

export function CreateWorkProjectModal({ isOpen, onClose, role, onProjectCreated }: CreateWorkProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [status, setStatus] = useState<WorkProjectStatus>('PLANNING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024);
      if (newFiles.length !== validFiles.length) {
        toast.error('تم استبعاد بعض الملفات لتجاوزها الحجم المسموح (5MB).');
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024);
      if (newFiles.length !== validFiles.length) {
        toast.error('تم استبعاد بعض الملفات لتجاوزها الحجم المسموح (5MB).');
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerId || !startDate || !endDate) {
      toast.error('يرجى تعبئة الحقول المطلوبة.');
      return;
    }

    const newProject: MockWorkProject = {
      id: `wp_${Date.now()}`,
      name,
      description,
      ownerId,
      status,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      createdAt: new Date().toISOString()
    };

    // Note: In a real app we'd also save the members and files to DB.
    // For this mock, we just pass the project back to update the UI state.
    onProjectCreated(newProject);
    toast.success('تم إنشاء مشروع العمل بنجاح (محاكاة)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
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

            {/* Owner */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">مالك المشروع *</label>
              <select 
                required
                value={ownerId}
                onChange={e => setOwnerId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="">-- اختر مالك المشروع --</option>
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
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

            {/* Members */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">أعضاء المشروع</label>
              <select 
                multiple 
                value={selectedMembers}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedMembers(options.map(o => o.value));
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">اضغط Ctrl (أو Cmd) لاختيار أكثر من عضو.</p>
            </div>

            {/* Files Dropzone */}
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-2">مرفقات أولية (اختياري)</label>
               <div 
                 onDragOver={handleDragOver}
                 onDrop={handleDrop}
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
               >
                  <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-sm font-bold text-gray-700 mb-1">اسحب وأفلت الملفات هنا أو اضغط للاختيار</span>
                  <span className="text-xs text-gray-500">الحد الأقصى للملف 5MB (للمعاينة فقط)</span>
               </div>
               {files.length > 0 && (
                 <div className="mt-4 space-y-2">
                   {files.map((file, index) => (
                     <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm">
                       <span className="font-medium text-gray-700 truncate" dir="ltr">{file.name}</span>
                       <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 p-1">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-md"
            >
              حفظ وإنشاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
