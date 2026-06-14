"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/actions/leads";

export default function LeadStatusForm({ leadId, currentStatus, statusOptions }: { leadId: string, currentStatus: string, statusOptions: {value: string, label: string}[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;

    try {
      await updateLeadStatus(leadId, newStatus);
      setMessage({ type: "success", text: "تم تحديث حالة العميل بنجاح." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء التحديث." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {message && (
        <div className={`p-2 text-sm rounded-md mb-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}
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
