"use client";

import { useState } from "react";
import toast from "react-hot-toast";

function getErrorDigest(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string") {
    return error.digest;
  }
  return undefined;
}

interface ClientFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> {
  action: (formData: FormData) => Promise<unknown>;
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
    } catch (err: unknown) {
      // Next.js redirect throws an error to halt execution. We must re-throw it to allow redirect.
      // The redirect error typically has a digest property starting with 'NEXT_REDIRECT'
      const digest = getErrorDigest(err);
      const msg = err instanceof Error ? err.message : "";
      if (digest?.startsWith('NEXT_REDIRECT') || msg === 'NEXT_REDIRECT') {
        toast.success(successMessage);
        throw err;
      } else {
        toast.error(msg || errorMessage);
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
