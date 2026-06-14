"use client";

import { useState } from "react";
import { assignLead } from "@/actions/leads";
import toast from "react-hot-toast";

export default function LeadAssignForm({ leadId, currentAssignee, users }: { leadId: string, currentAssignee: string | null, users: {id: string, name: string, role: string}[] }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const assignedToId = formData.get("assignedToId") as string;

    try {
      await assignLead(leadId, assignedToId === "none" ? null : assignedToId);
      toast.success("تم تعيين العميل للموظف بنجاح.");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
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
