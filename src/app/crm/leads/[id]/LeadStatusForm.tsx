"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/actions/leads";
import toast from "react-hot-toast";

export default function LeadStatusForm({ leadId, currentStatus, statusOptions }: { leadId: string, currentStatus: string, statusOptions: {value: string, label: string}[] }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;

    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success("تم تحديث حالة العميل بنجاح.");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <select name="status" defaultValue={currentStatus} className="w-full border-gray-300 rounded-md p-2 text-sm shadow-sm" disabled={isSaving}>
        {statusOptions.map(st => (
          <option key={st.value} value={st.value}>{st.label}</option>
        ))}
      </select>
      <button type="submit" disabled={isSaving} className="w-full bg-primary text-white py-2 rounded-md text-sm font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
        {isSaving ? "جاري الحفظ..." : "حفظ الحالة"}
      </button>
    </form>
  );
}
