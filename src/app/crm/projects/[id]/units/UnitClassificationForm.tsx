"use client";

import { useState } from "react";
import ImageUpload from "@/components/crm/ImageUpload";
import { updateUnitModelDetails } from "@/actions/units";

interface UnitClassificationFormProps {
  unitId: string;
  projectId: string;
  initialModelId: string | null;
  initialFloor: string | null;
  initialFacade: string | null;
  initialUnitPlanImage: string | null;
  initialSortOrder: number;
  models: { id: string; name: string; code: string | null }[];
}

export default function UnitClassificationForm({
  unitId,
  projectId,
  initialModelId,
  initialFloor,
  initialFacade,
  initialUnitPlanImage,
  initialSortOrder,
  models
}: UnitClassificationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    formData.append("unitId", unitId);
    formData.append("projectId", projectId);
    try {
      await updateUnitModelDetails(formData);
      setIsOpen(false);
      alert("تم حفظ التصنيف بنجاح");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ";
      alert(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-2">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-primary hover:text-primary-dark underline"
      >
        {isOpen ? "إخفاء التصنيف" : "تصنيف الوحدة"}
      </button>

      {isOpen && (
        <form action={handleSubmit} className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-right space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">النموذج</label>
              <select name="modelId" defaultValue={initialModelId || ""} className="mt-1 block w-full shadow-sm text-xs border-gray-300 rounded-md border p-1.5">
                <option value="">غير مصنفة</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.code ? `(${m.code})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">الدور (Floor)</label>
              <input type="text" name="floor" defaultValue={initialFloor || ""} className="mt-1 block w-full shadow-sm text-xs border-gray-300 rounded-md border p-1.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">الواجهة (Facade)</label>
              <input type="text" name="facade" defaultValue={initialFacade || ""} className="mt-1 block w-full shadow-sm text-xs border-gray-300 rounded-md border p-1.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">الترتيب (Sort Order)</label>
              <input type="number" name="sortOrder" defaultValue={initialSortOrder} className="mt-1 block w-full shadow-sm text-xs border-gray-300 rounded-md border p-1.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">صورة المخطط للوحدة (اختياري)</label>
            <ImageUpload name="unitPlanImage" defaultValue={initialUnitPlanImage || ""} label="" />
          </div>
          <div>
            <button type="submit" disabled={isPending} className="inline-flex justify-center py-1.5 px-3 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50">
              {isPending ? "جاري الحفظ..." : "حفظ التصنيف"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
