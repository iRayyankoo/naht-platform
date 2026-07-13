import React, { useState } from 'react';
import { WorkProjectDTO, WorkProjectSectionDTO, WorkProjectSectionsAdapter } from '../types';

interface WorkProjectSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkProjectDTO;
  editingSection?: WorkProjectSectionDTO;
  adapter: WorkProjectSectionsAdapter;
  onSuccess: () => void;
}

const DEFAULT_COLOR = '#3B82F6';

export function WorkProjectSectionModal({ isOpen, onClose, project, editingSection, adapter, onSuccess }: WorkProjectSectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [managerId, setManagerId] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevEditingSection, setPrevEditingSection] = useState(editingSection);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (editingSection !== prevEditingSection || isOpen !== prevIsOpen) {
    setPrevEditingSection(editingSection);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (editingSection) {
        setName(editingSection.name);
        setDescription(editingSection.description || '');
        setColor(editingSection.color || DEFAULT_COLOR);
        setManagerId(editingSection.managerId || '');
      } else {
        setName('');
        setDescription('');
        setColor(DEFAULT_COLOR);
        setManagerId('');
      }
      setError(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('اسم القسم يجب أن يكون حرفين على الأقل');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setError('اللون غير صالح');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        color,
        managerId: managerId || null
      };

      if (editingSection) {
        await adapter.updateSection(editingSection.id, payload);
      } else {
        await adapter.createSection(project.id, payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = project.status === 'COMPLETED' || project.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            {editingSection ? 'تعديل القسم' : 'إنشاء قسم جديد'}
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">اسم القسم <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              disabled={isSubmitting || isReadOnly}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
              placeholder="مثال: التصميم، البرمجة، التسويق..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">وصف القسم (اختياري)</label>
            <textarea
              rows={3}
              disabled={isSubmitting || isReadOnly}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 resize-none"
              placeholder="وصف مختصر لدور هذا القسم في المشروع..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">المدير</label>
              <select
                disabled={isSubmitting || isReadOnly}
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
              >
                <option value="">بدون مدير</option>
                {project.members.map(m => (
                  <option key={m.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">اللون</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  disabled={isSubmitting || isReadOnly}
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-10 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  disabled={isSubmitting || isReadOnly}
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase text-center"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isReadOnly}
            className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {editingSection ? 'حفظ التعديلات' : 'إنشاء القسم'}
          </button>
        </div>
      </div>
    </div>
  );
}
