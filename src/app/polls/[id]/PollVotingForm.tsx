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
  isClosed?: boolean;
}

export default function PollVotingForm({ pollId, options, isClosed = false }: PollVotingFormProps) {

  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVoteSubmit = async () => {
    if (!selectedOptionId) {
      setError("Please select one of the choices before voting!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);

    const result = await submitVote(pollId, [selectedOptionId]);

    setLoading(false);
    if (result.success) {
      setSuccess("Vote submitted successfully! Your vote has been recorded.");
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

  const handleInitialSubmit = () => {
    if (!selectedOptionId) {
      setError("Please select one of the choices before voting!");
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const selectedOptionText = options.find((o) => o.id === selectedOptionId)?.text;

  return (
    <div className="space-y-6 relative">
      {/* ── Success State ── */}
      {success && (
        <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-emerald-800">Vote submitted successfully!</h3>
          <p className="text-sm font-medium text-emerald-600">Your vote has been securely recorded.</p>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !success && (
        <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ── Voting Form ── */}
      {!success && (
        <>
          <div className="space-y-3">
            {options.map((opt, index) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  type="button"
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-black transition-colors ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`font-semibold text-lg transition-colors ${
                      isSelected ? "text-indigo-900" : "text-slate-700 group-hover:text-indigo-900"
                    }`}>
                      {opt.text}
                    </span>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-indigo-300"
                    }`}
                  >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleInitialSubmit}
            disabled={loading || !selectedOptionId}
            className="w-full flex justify-center items-center space-x-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Submit My Vote</span>
          </button>
        </>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm your vote</h3>
            <p className="text-sm text-slate-500 mb-6">
              You selected:
              <span className="block mt-2 mb-4 font-bold text-lg text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                ✓ {selectedOptionText}
              </span>
              Your vote cannot be changed after submission.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleVoteSubmit}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex justify-center items-center"
                disabled={loading}
              >
                {loading ? "Casting..." : "Confirm Vote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
