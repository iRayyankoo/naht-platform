"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  label?: string;
  onChange?: (url: string) => void;
}

export default function ImageUpload({ name, defaultValue = "", label = "الصورة", onChange }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
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
        setImageUrl(data.url);
        if (onChange) onChange(data.url);
      } else {
        alert("فشل رفع الصورة");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Hidden input to pass value to Server Actions */}
      <input type="hidden" name={name} value={imageUrl} />

      <div className="flex items-center gap-4">
        {imageUrl && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => {
                setImageUrl("");
                if (onChange) onChange("");
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex-1">
          <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? "جاري الرفع..." : (imageUrl ? "تغيير الصورة" : "اختر صورة")}
            <input 
              type="file" 
              className="sr-only" 
              accept="image/*,video/mp4" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
      {imageUrl && (
        <p className="text-xs text-gray-500 mt-1 truncate max-w-full" dir="ltr">{imageUrl}</p>
      )}
    </div>
  );
}
