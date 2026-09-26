"use client";

import { useState } from "react";
import { Link2, CheckCheck, Share2, X, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

import { toast } from "sonner";

interface SharePollModalProps {
  pollId: string;
  shortCode?: string | null;
  pollTitle?: string;
}

export default function SharePollModal({ pollId, shortCode, pollTitle = "Vote on this poll!" }: SharePollModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "email">("link");
  const [emailAddresses, setEmailAddresses] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/polls/${pollId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: "Cast your vote on VoTI:",
          url: url,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddresses.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    const emails = emailAddresses.split(",").map(e => e.trim()).filter(Boolean);
    
    setIsSending(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, message: emailMessage }),
      });

      if (!res.ok) throw new Error("Failed to send invites");

      toast.success("Invites sent successfully!");
      setEmailAddresses("");
      setEmailMessage("");
      setIsOpen(false);
    } catch (err) {
      toast.error("Could not send emails. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        title="Share Poll"
        className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Share Poll</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-100 dark:border-zinc-800 mb-5">
              <button
                onClick={() => setActiveTab("link")}
                className={`pb-2 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === "link"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Link & QR
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`pb-2 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === "email"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Email Invite
              </button>
            </div>

            {activeTab === "link" ? (
              <div className="space-y-6">

                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <div className="bg-white p-2 rounded-xl">
                    {url && <QRCode value={url} size={160} className="rounded-lg" />}
                  </div>
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-3 flex items-center gap-1">
                    <QrCode className="h-4 w-4" /> Scan to vote
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Or share via link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={url}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all shrink-0 ${
                        copied
                          ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                          : "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
                      }`}
                    >
                      {copied ? <CheckCheck className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">To (Emails)</label>
                  <input
                    type="text"
                    required
                    placeholder="friend@example.com, team@company.com"
                    value={emailAddresses}
                    onChange={(e) => setEmailAddresses(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Separate multiple emails with commas</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Add a note (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Hey! I'd love your opinion on this..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSending ? "Sending Invites..." : "Send Email Invites"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
