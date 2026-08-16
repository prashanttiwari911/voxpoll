"use client";

import { useState } from "react";
import { Link2, CheckCheck, Share2, X, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

interface SharePollModalProps {
  pollId: string;
  shortCode?: string | null;
}

export default function SharePollModal({ pollId, shortCode }: SharePollModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/polls/${pollId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Share Poll"
        className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-zinc-900">Share Poll</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Short Code Section */}
              {shortCode && (
                <div className="text-center bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Poll Code</p>
                  <p className="text-3xl font-black text-indigo-900 tracking-widest">{shortCode.split('').join(' ')}</p>
                  <p className="text-[10px] text-indigo-400 mt-2">Enter this code at VoTI Join page</p>
                </div>
              )}

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-200 rounded-2xl">
                <div className="bg-white p-2 rounded-xl">
                  {url && <QRCode value={url} size={160} className="rounded-lg" />}
                </div>
                <p className="text-xs font-bold text-zinc-400 mt-3 flex items-center gap-1">
                  <QrCode className="h-4 w-4" /> Scan to vote
                </p>
              </div>

              {/* Copy Link Section */}
              <div>
                <p className="text-xs font-bold text-zinc-500 mb-2">Or share via link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={url}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all shrink-0 ${
                      copied
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {copied ? <CheckCheck className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
