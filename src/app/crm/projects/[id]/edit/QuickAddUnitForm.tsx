"use client";

import { useState, useRef } from "react";
import { createUnit } from "@/actions/units";
import toast from "react-hot-toast";

interface QuickAddUnitFormProps {
  projectId: string;
  modelId: string;
  modelName: string;
}

export default function QuickAddUnitForm({ projectId, modelId, modelName }: QuickAddUnitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsPending(true);
    const formData = new FormData(formRef.current);
    formData.set("modelId", modelId);

    try {
      await createUnit(projectId, formData);
      toast.success("تم إضافة الوحدة بنجاح");
      formRef.current.reset();
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إضافة الوحدة");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-xs text-[#b5952f] hover:text-[#D4AF37] font-medium border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 rounded-lg px-3 py-1.5 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        {isOpen ? "إلغاء" : `إضافة وحدة لـ ${modelName}`}
      </button>

      {isOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3"
        >
          <p className="text-xs font-medium text-blue-700 mb-2">
            إضافة وحدة جديدة — ستُربط تلقائياً بنموذج "{modelName}"
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">رقم الوحدة <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="unitNum"
                required
                placeholder="مثال: A-01"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">النوع <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="type"
                required
                placeholder="شقة / فيلا"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">المساحة (م²)</label>
              <input
                type="number"
                name="area"
                step="0.01"
                placeholder="350"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الغرف</label>
              <input
                type="number"
                name="rooms"
                placeholder="5"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">السعر (ر.س)</label>
              <input
                type="number"
                name="price"
                placeholder="1500000"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الحالة</label>
              <select
                name="status"
                defaultValue="AVAILABLE"
                className="w-full text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="AVAILABLE">متاحة</option>
                <option value="SOLD">مباعة</option>
                <option value="RESERVED">محجوزة</option>
              </select>
            </div>
          </div>

          {/* Hidden fields */}
          <input type="hidden" name="isVisible" value="true" />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 py-1.5 px-3 border border-gray-200 rounded-lg transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="text-xs font-semibold text-white bg-[#D4AF37] hover:bg-[#b5952f] py-1.5 px-4 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isPending ? "جاري الإضافة..." : "إضافة الوحدة"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
