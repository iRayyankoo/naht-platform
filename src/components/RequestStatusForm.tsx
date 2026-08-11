"use client";

import { useState } from "react";
import { updateMaintenanceStatus, updateVendorStatus, updateJobStatus } from "@/actions/requests";

type StatusOption = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  currentStatus: string;
  type: "maintenance" | "vendor" | "career";
  options: StatusOption[];
};

export default function RequestStatusForm({ id, currentStatus, type, options }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState(currentStatus);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (statusValue === currentStatus) return; // No change
    
    setIsUpdating(true);
    setMessage(null);

    try {
      if (type === "maintenance") {
        await updateMaintenanceStatus(id, statusValue);
      } else if (type === "vendor") {
        await updateVendorStatus(id, statusValue);
      } else if (type === "career") {
        await updateJobStatus(id, statusValue);
      }
      setMessage({ type: "success", text: "تم التحديث" });
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: "error", text: "حدث خطأ" });
      setStatusValue(currentStatus); // revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2 space-x-reverse">
        <select 
          value={statusValue} 
          onChange={(e) => {
            setStatusValue(e.target.value);
            setMessage(null);
          }}
          disabled={isUpdating}
          className="text-xs border-gray-300 rounded p-1"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {statusValue !== currentStatus && (
          <button 
            type="submit" 
            disabled={isUpdating}
            className="text-xs bg-primary hover:bg-primary-dark text-white px-2 py-1 rounded"
          >
            {isUpdating ? "..." : "حفظ"}
          </button>
        )}
      </div>
      {message && (
        <span className={`text-[10px] ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
    </form>
  );
}
