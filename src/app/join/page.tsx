"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolvePollCode } from "@/app/actions/poll";
import { KeyRound, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function JoinPollPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.replace(/\s+/g, "");
    if (!cleanCode) {
      setError("Please enter a poll code.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await resolvePollCode(cleanCode);
    
    if (result.success && result.pollId) {
      router.push(`/polls/${result.pollId}`);
    } else {
      setError(result.error || "Could not find poll.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900">Join a Poll</h1>
          <p className="text-zinc-500 font-medium">Enter the 5-digit code provided by the presenter</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                // Only allow numbers and spaces
                const val = e.target.value.replace(/[^\d\s]/g, "");
                setCode(val);
              }}
              placeholder="e.g. 8 4 2 1 6"
              maxLength={10}
              className="w-full text-center text-4xl font-black tracking-widest text-zinc-800 px-4 py-6 rounded-2xl border-2 border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none placeholder:text-zinc-300"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length === 0}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span>Joining...</span>
            ) : (
              <>
                <span>Join Poll</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm font-medium">
            📱 <strong>Have a QR code?</strong> Scan it with your phone's camera app — it opens the poll directly without needing this page.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-zinc-500 hover:text-zinc-800 font-semibold text-sm transition-colors">
          &larr; Back to Explore
        </Link>
      </div>
    </div>
  );
}
