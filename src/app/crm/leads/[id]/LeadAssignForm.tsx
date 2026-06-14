"use client";

import { useState } from "react";
import { assignLead } from "@/actions/leads";

export default function LeadAssignForm({ leadId, currentAssignee, users }: { leadId: string, currentAssignee: string | null, users: {id: string, name: string, role: string}[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const assignedToId = formData.get("assignedToId") as string;

    try {
      await assignLead(leadId, assignedToId === "none" ? null : assignedToId);
      setMessage({ type: "success", text: "تم تعيين العميل للموظف بنجاح." });
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
      <select name="assignedToId" defaultValue={currentAssignee || "none"} className="w-full border-gray-300 rounded-md p-2 text-sm shadow-sm" disabled={isSaving}>
        <option value="none">غير معين</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
        ))}
      </select>
      <button type="submit" disabled={isSaving} className="w-full bg-secondary text-white py-2 rounded-md text-sm font-bold hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed">
        {isSaving ? "جاري الحفظ..." : "حفظ التعيين"}
      </button>
    </form>
  );
}
