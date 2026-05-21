"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitVote } from "../../actions";
import { AlertCircle, CheckCircle, Vote, Sparkles } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface PollVotingFormProps {
  pollId: string;
  options: Option[];
}

export default function PollVotingForm({ pollId, options }: PollVotingFormProps) {
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVoteSubmit = async () => {
    if (!selectedOptionId) {
      setError("Please select one of the choices before voting!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await submitVote(pollId, selectedOptionId);

    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "Vote recorded!");
      router.refresh();
    } else {
      setError(result.error || "An error occurred while casting your vote.");
      // Check if redirect is required
      if (result.redirectProfile) {
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Options Selection list */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              type="button"
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
              }`}
            >
              <span className="font-semibold text-slate-700">{opt.text}</span>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vote Button */}
      <button
        onClick={handleVoteSubmit}
        disabled={loading || !selectedOptionId}
        className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>Casting Vote...</span>
        ) : (
          <>
            <Vote className="h-5 w-5" />
            <span>Cast Your Vote</span>
          </>
        )}
      </button>
    </div>
  );
}
