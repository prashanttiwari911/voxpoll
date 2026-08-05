"use client";

import { useState } from "react";
import { Link2, CheckCheck } from "lucide-react";

interface CopyLinkButtonProps {
  pollId: string;
}

export default function CopyLinkButton({ pollId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/polls/${pollId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard in non-HTTPS contexts
      const url = `${window.location.origin}/polls/${pollId}`;
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      id="copy-poll-link-btn"
      onClick={handleCopy}
      title="Copy shareable link"
      className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      {copied ? (
        <>
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}
