"use client";

import React, { useState, useTransition } from 'react';
import { WorkProjectDTO, UserDTO, ClientPermissions } from '../types';
import toast from 'react-hot-toast';
import { createTask } from '@/actions/tasks';
import { useRouter } from 'next/navigation';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: ClientPermissions;
  initialProjectId?: string | null;
  workProjects: WorkProjectDTO[];
  users?: UserDTO[]; // For general tasks or fallback
}

export function CreateTaskModal({ isOpen, onClose, permissions, initialProjectId, workProjects, users = [] }: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState<string>('GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [approverId, setApproverId] = useState<string>('');

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectId(initialProjectId || 'GENERAL');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      setAssigneeId('');
      setApproverId('');
      setRequiresApproval(false);
    }
  }, [isOpen, initialProjectId]);

  if (!isOpen) return null;

  const currentProject = projectId !== 'GENERAL' ? workProjects.find(p => p.id === projectId) : null;

  // If project is selected, use its members; else use all users (or whatever is allowed for general)
  const availableAssignees = currentProject ? currentProject.members.map(m => m.user) : users;
  const projectMemberIds = currentProject ? currentProject.members.map(m => m.user.id) : [];

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value;

    if (requiresApproval && newAssigneeId === approverId && newAssigneeId !== '') {
      toast.error('لا يمكن أن يكون منفذ المهمة هو نفس المعتمد.');
      return;
    }

    if (currentProject) {
      const isMember = projectMemberIds.includes(newAssigneeId);
      if (!isMember && newAssigneeId !== '') {
        if (permissions.isSuperAdmin) {
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
        if (permissions.isSuperAdmin) {
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

    startTransition(async () => {
       try {
          const res = await createTask({
             title,
             description: description || undefined,
             priority,
             dueDate: dueDate ? new Date(dueDate) : undefined,
             workProjectId: projectId === 'GENERAL' ? undefined : projectId,
             assignedToId: assigneeId || undefined,
             requiresApproval,
             designatedApproverId: requiresApproval && approverId ? approverId : undefined,
          });

          if (res?.success) {
             toast.success('تم إنشاء المهمة بنجاح');
             onClose();
             router.refresh();
          }
       } catch (err) {
          console.error(err);
          toast.error('حدث خطأ أثناء الإنشاء');
       }
    });
  };

  // The rest is similar to the original, just bound to the actual states
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
                  setProjectId(e.target.value);
                  setAssigneeId(''); // Reset assignee when project changes
                  setApproverId('');
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="GENERAL">مهمة عامة (غير مرتبطة بمشروع عمل)</option>
                {workProjects.map(p => (
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
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="أدخل عنواناً واضحاً للمهمة"
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
                {availableAssignees.map(u => {
                   const isMember = currentProject ? projectMemberIds.includes(u.id) : true;
                   if (!isMember && !permissions.isSuperAdmin) return null;

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
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
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
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-right"
              />
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
                      {availableAssignees.map(u => {
                         const isMember = currentProject ? projectMemberIds.includes(u.id) : true;
                         if (!isMember && !permissions.isSuperAdmin) return null;

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
              إنشاء المهمة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
