"use client";

import { useState } from "react";

export default function CopyButton({ textToCopy, className }: { textToCopy: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? "تم النسخ!" : "نسخ الرابط"}
    </button>
  );
}
