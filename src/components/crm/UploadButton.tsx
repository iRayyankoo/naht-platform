"use client";

import { useState } from "react";

interface UploadButtonProps {
  onUpload: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function UploadButton({ onUpload, label = "رفع ملف", accept = "image/*,video/mp4" }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUpload(data.url);
      } else {
        alert("فشل رفع الملف");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {isUploading ? "جاري الرفع..." : label}
      <input 
        type="file" 
        className="sr-only" 
        accept={accept} 
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </label>
  );
}
