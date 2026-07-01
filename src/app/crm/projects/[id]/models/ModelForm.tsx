"use client";

import { useState } from "react";
import ClientForm from "@/components/crm/ClientForm";
import ImageUpload from "@/components/crm/ImageUpload";
import { createProjectModel, updateProjectModel } from "@/actions/models";
import { ProjectModel } from "@prisma/client";
import toast from "react-hot-toast";

interface ModelFormProps {
  projectId: string;
  initialData?: ProjectModel;
  onSuccess?: () => void;
}

export default function ModelForm({ projectId, initialData, onSuccess }: ModelFormProps) {
  const isEditing = !!initialData;
  const action = isEditing ? updateProjectModel.bind(null, initialData.id) : createProjectModel;

  const [isOpen, setIsOpen] = useState(isEditing ? false : true);

  const handleSubmit = async (formData: FormData) => {
    try {
      await action(formData);
      if (!isEditing) {
        // Reset form or collapse if needed. In ClientForm, the form is not reset automatically,
        // but we can just let it reload the page data if revalidatePath is fast enough.
        // Or we could use a ref to reset the form. For now, just call onSuccess if provided.
      } else {
        setIsOpen(false);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
        if (!isEditing) {
          // Success
        } else {
          setIsOpen(false);
        }
        if (onSuccess) onSuccess();
        throw err;
      }
      throw err; // Let ClientForm handle the error toast
    }
  };

  if (!isOpen && isEditing) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        تعديل النموذج
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-xl ${isEditing ? 'mt-4 border-t border-gray-100 pt-4' : 'shadow-sm border border-gray-100 p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? `تعديل نموذج: ${initialData.name}` : "إضافة نموذج جديد"}
        </h2>
        {isEditing && (
          <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>

      <ClientForm 
        action={handleSubmit} 
        successMessage={isEditing ? "تم تعديل النموذج بنجاح" : "تم إنشاء النموذج بنجاح"}
        className="space-y-6"
      >
        <input type="hidden" name="projectId" value={projectId} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* اسم النموذج */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم النموذج <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name" 
              required
              defaultValue={initialData?.name || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
              placeholder="مثال: نموذج أ، نموذج فيلا"
            />
          </div>

          {/* كود النموذج */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كود النموذج</label>
            <input 
              type="text" 
              name="code" 
              defaultValue={initialData?.code || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
              placeholder="مثال: TYPE-A"
            />
          </div>

          {/* الحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">حالة النموذج</label>
            <select 
              name="status" 
              defaultValue={initialData?.status || "AVAILABLE"}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm"
            >
              <option value="AVAILABLE">متاح</option>
              <option value="SOLD">مباع بالكامل</option>
              <option value="COMING_SOON">قريباً</option>
            </select>
          </div>

          {/* المساحة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
            <input 
              type="number" 
              step="0.01"
              name="area" 
              defaultValue={initialData?.area || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
            />
          </div>

          {/* الغرف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عدد الغرف</label>
            <input 
              type="number" 
              name="rooms" 
              defaultValue={initialData?.rooms || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
            />
          </div>

          {/* الحمامات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عدد الحمامات</label>
            <input 
              type="number" 
              name="baths" 
              defaultValue={initialData?.baths || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
            />
          </div>

          {/* ترتيب العرض */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
            <input 
              type="number" 
              name="sortOrder" 
              defaultValue={initialData?.sortOrder || "0"}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
            />
          </div>

          {/* مرئي */}
          <div className="flex items-center pt-6">
            <input 
              type="checkbox" 
              name="isVisible" 
              id={`isVisible-${initialData?.id || 'new'}`}
              defaultChecked={initialData ? initialData.isVisible : true}
              className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" 
            />
            <label htmlFor={`isVisible-${initialData?.id || 'new'}`} className="mr-2 block text-sm text-gray-900">
              ظاهر للعملاء
            </label>
          </div>
        </div>

        {/* وصف النموذج */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وصف النموذج</label>
          <textarea 
            name="description" 
            rows={3}
            defaultValue={initialData?.description || ""}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm" 
            placeholder="وصف مختصر لمميزات هذا النموذج..."
          ></textarea>
        </div>

        {/* المخطط */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">صورة المخطط (Plan Image)</label>
          <ImageUpload 
            name="planImage" 
            defaultValue={initialData?.planImage || ""} 
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
          {isEditing && (
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              إلغاء
            </button>
          )}
          <button 
            type="submit" 
            className="group-disabled:opacity-50 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            {isEditing ? "حفظ التعديلات" : "إضافة النموذج"}
          </button>
        </div>
      </ClientForm>
    </div>
  );
}
