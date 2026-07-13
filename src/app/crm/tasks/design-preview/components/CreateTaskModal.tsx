import React, { useState } from 'react';
import { MOCK_WORK_PROJECTS, MOCK_USERS, MOCK_WORK_PROJECT_MEMBERS } from './data';
import { Role } from '../page';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  initialProjectId?: string | null;
}

export function CreateTaskModal({ isOpen, onClose, role, initialProjectId }: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState<string>('GENERAL');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [approverId, setApproverId] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectId(initialProjectId || 'GENERAL');
      setAssigneeId('');
      setApproverId('');
      setRequiresApproval(false);
    }
  }, [isOpen, initialProjectId]);

  if (!isOpen) return null;

  const currentProject = projectId !== 'GENERAL' ? MOCK_WORK_PROJECTS.find(p => p.id === projectId) : null;
  const projectMemberIds = currentProject
    ? MOCK_WORK_PROJECT_MEMBERS.filter(m => m.projectId === currentProject.id).map(m => m.userId)
    : [];

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value;

    if (requiresApproval && newAssigneeId === approverId && newAssigneeId !== '') {
      toast.error('لا يمكن أن يكون منفذ المهمة هو نفس المعتمد.');
      return;
    }

    if (currentProject) {
      const isMember = projectMemberIds.includes(newAssigneeId);
      if (!isMember && newAssigneeId !== '') {
        if (role === 'SUPER_ADMIN') {
          toast('تحذير: لقد اخترت مستخدماً ليس عضواً في هذا المشروع. تم التجاوز بصلاحية مدير النظام.', { icon: '⚠️' });
          setAssigneeId(newAssigneeId);
        } else {
          toast.error('عذراً، لا يمكن إسناد المهمة إلا لأعضاء مشروع العمل المختار.');
          return;
        }
      } else {
        setAssigneeId(newAssigneeId);
      }
    } else {
      // General task
      setAssigneeId(newAssigneeId);
    }
  };

  const handleApproverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newApproverId = e.target.value;

    if (newApproverId === assigneeId && newApproverId !== '') {
      toast.error('لا يمكن أن يكون המعتمد هو نفس منفذ المهمة.');
      return;
    }

    if (currentProject) {
      const isMember = projectMemberIds.includes(newApproverId);
      if (!isMember && newApproverId !== '') {
        if (role === 'SUPER_ADMIN') {
          toast('تحذير: لقد اخترت معتمداً ليس عضواً في هذا المشروع. تم التجاوز بصلاحية مدير النظام.', { icon: '⚠️' });
          setApproverId(newApproverId);
        } else {
          toast.error('عذراً، لا يمكن اختيار معتمد من خارج أعضاء مشروع العمل.');
          return;
        }
      } else {
        setApproverId(newApproverId);
      }
    } else {
      setApproverId(newApproverId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresApproval && !approverId) {
      toast.error('يجب اختيار معتمد لأن المهمة تتطلب اعتماداً.');
      return;
    }
    toast.success('تم إنشاء المهمة بنجاح (محاكاة)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-gray-900">مهمة جديدة</h2>
          <button onClick={onClose} aria-label="إغلاق نموذج المهمة" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Project */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">ارتباط المهمة بـ</label>
              <select
                value={projectId}
                onChange={(e) => {
                  if (initialProjectId && e.target.value === 'GENERAL') {
                     if (!window.confirm('أنت على وشك تغيير المهمة إلى "مهمة عامة" وفصلها عن مشروع العمل، هل تريد الاستمرار؟')) {
                        return;
                     }
                  }
                  if (initialProjectId && e.target.value !== initialProjectId && e.target.value !== 'GENERAL') {
                     toast('تنبيه: قمت بتغيير ارتباط المهمة عن المشروع المفتوح حالياً.', { icon: 'ℹ️' });
                  }
                  setProjectId(e.target.value);
                  setAssigneeId(''); // Reset assignee when project changes
                  setApproverId('');
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="GENERAL">مهمة عامة (غير مرتبطة بمشروع عمل)</option>
                {MOCK_WORK_PROJECTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المهمة *</label>
              <input
                required
                type="text"
                placeholder="أدخل عنواناً واضحاً للمهمة"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
              <textarea
                rows={3}
                placeholder="تفاصيل المهمة ومتطلباتها..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
              ></textarea>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المسؤول عن التنفيذ</label>
              <select
                value={assigneeId}
                onChange={handleAssigneeChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="">-- غير مسند --</option>
                {MOCK_USERS.map(u => {
                   const isMember = currentProject ? projectMemberIds.includes(u.id) : true;

                   // If not a member, hide it unless user is SUPER_ADMIN
                   if (!isMember && role !== 'SUPER_ADMIN') return null;

                   return (
                     <option key={u.id} value={u.id}>
                       {u.name} {currentProject && !isMember ? '(تجاوز - ليس عضواً)' : ''}
                     </option>
                   );
                })}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الأولوية</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors">
                <option value="LOW">منخفضة</option>
                <option value="MEDIUM">متوسطة</option>
                <option value="HIGH">عالية</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الاستحقاق</label>
              <input
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-right"
              />
            </div>

            {/* Followers */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المتابعون</label>
              <select multiple className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-12 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-xs text-gray-500">
                <option disabled>محاكاة: اضغط لاختيار متابعين</option>
              </select>
            </div>

            {/* Approval Setup */}
            <div className="col-span-1 md:col-span-2 bg-purple-50/50 border border-purple-100 rounded-xl p-5 space-y-4 mt-2">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={requiresApproval}
                   onChange={(e) => {
                      setRequiresApproval(e.target.checked);
                      if (!e.target.checked) setApproverId('');
                   }}
                   className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                 />
                 <span className="font-bold text-purple-900">هذه المهمة تتطلب اعتماداً بعد الإنجاز</span>
               </label>

               {requiresApproval && (
                 <div className="pl-8 border-r-2 border-purple-200 pr-4 rtl:pl-0 rtl:pr-8 rtl:border-r-0 rtl:border-l-2">
                    <label className="block text-sm font-bold text-purple-800 mb-2">اختر المعتمد *</label>
                    <select
                      required
                      value={approverId}
                      onChange={handleApproverChange}
                      className="w-full bg-white border border-purple-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                    >
                      <option value="">-- اختر المعتمد --</option>
                      {MOCK_USERS.map(u => {
                         const isMember = currentProject ? projectMemberIds.includes(u.id) : true;

                         // If not a member, hide it unless user is SUPER_ADMIN
                         if (!isMember && role !== 'SUPER_ADMIN') return null;

                         return (
                           <option key={u.id} value={u.id}>
                             {u.name} {currentProject && !isMember ? '(تجاوز - ليس عضواً)' : ''}
                           </option>
                         );
                      })}
                    </select>
                    {currentProject && (
                       <p className="text-xs text-purple-600 mt-2">لا يمكن اختيار معتمد من خارج فريق مشروع العمل إلا لمدير النظام.</p>
                    )}
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
              إنشاء المهمة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
