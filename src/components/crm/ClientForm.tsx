"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ClientFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  action: (formData: FormData) => Promise<any>;
  successMessage?: string;
  errorMessage?: string;
}

export default function ClientForm({ 
  action, 
  children, 
  successMessage = "تم الحفظ بنجاح", 
  errorMessage = "حدث خطأ أثناء الحفظ",
  ...props 
}: ClientFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await action(formData);
      toast.success(successMessage);
    } catch (err: any) {
      // Next.js redirect throws an error to halt execution. We must re-throw it to allow redirect.
      // The redirect error typically has a digest property starting with 'NEXT_REDIRECT'
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
        toast.success(successMessage);
        throw err;
      } else {
        toast.error(err.message || errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <fieldset disabled={isSaving} className="group">
        {children}
      </fieldset>
    </form>
  );
}
