"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitVote } from "@/app/actions/vote";
import { AlertCircle, CheckCircle, CheckSquare, Square, Circle, Dot } from "lucide-react";
import { toast } from "sonner";

interface Option {
  id: string;
  text: string;
}

interface PollVotingFormProps {
  pollId: string;
  options: Option[];
  isClosed?: boolean;
  isMultipleChoice?: boolean;
  maxChoices?: number;
}

export default function PollVotingForm({
  pollId,
  options,
  isClosed = false,
  isMultipleChoice = false,
  maxChoices = 1,
}: PollVotingFormProps) {
  const router = useRouter();
  const [state, setState] = useState({
    selectedIds: [] as string[],
    loading: false,
    success: false,
    showConfirm: false,
  });

  const toggleOption = (id: string) => {
    if (isMultipleChoice) {
      setState((prev) => {
        const prevIds = prev.selectedIds;
        if (prevIds.includes(id)) return { ...prev, selectedIds: prevIds.filter((x) => x !== id) };
        if (prevIds.length >= maxChoices) {
          toast.error(`You can select at most ${maxChoices} option${maxChoices > 1 ? "s" : ""}.`);
          return prev;
        }
        return { ...prev, selectedIds: [...prevIds, id] };
      });
    } else {
      setState(s => ({ ...s, selectedIds: [id] }));
    }
  };

  const handleInitialSubmit = () => {
    if (state.selectedIds.length === 0) {
      toast.error("Please select at least one option before voting.");
      return;
    }
    setState(s => ({ ...s, showConfirm: true }));
  };

  const handleConfirmVote = async () => {
    setState(s => ({ ...s, loading: true, showConfirm: false }));
    const result = await submitVote(pollId, state.selectedIds);
    setState(s => ({ ...s, loading: false }));

    if (result.success) {
      setState(s => ({ ...s, success: true }));
      toast.success("Vote cast successfully!");
      router.refresh();
    } else {
      toast.error(result.error || "An error occurred while casting your vote.");
      if (result.redirectProfile) {
        setTimeout(() => router.push("/profile"), 3000);
      }
    }
  };

  const selectedTexts = state.selectedIds
    .map((id) => options.find((o) => o.id === id)?.text)
    .filter(Boolean) as string[];

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
        <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-emerald-800">Vote submitted!</h3>
        <p className="text-sm font-medium text-emerald-600 max-w-xs">
          Your response has been recorded. Individual votes are never shown publicly — results appear as aggregates only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 relative">
            {isMultipleChoice && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
          <p className="text-sm font-bold text-indigo-700">
            Select up to <span className="underline underline-offset-2">{maxChoices}</span> option{maxChoices > 1 ? "s" : ""}
          </p>
          <span className={`text-sm font-black px-3 py-1 rounded-full transition-colors ${
            state.selectedIds.length === maxChoices
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-500 border border-indigo-200"
          }`}>
            {state.selectedIds.length} / {maxChoices}
          </span>
        </div>
      )}

            <div className="space-y-3">
        {options.map((opt, index) => {
          const isSelected = state.selectedIds.includes(opt.id);
          const atLimit    = isMultipleChoice && state.selectedIds.length >= maxChoices && !isSelected;

          return (
            <button
              key={opt.id}
              onClick={() => !atLimit && toggleOption(opt.id)}
              type="button"
              disabled={atLimit}
              aria-pressed={isSelected}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                  : atLimit
                  ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-black transition-colors shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className={`font-semibold text-base transition-colors ${
                  isSelected ? "text-indigo-900" : "text-slate-700 group-hover:text-indigo-900"
                }`}>
                  {opt.text}
                </span>
              </div>

                            {isMultipleChoice ? (
                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}>
                  {isSelected && <CheckSquare className="h-4 w-4 text-white" strokeWidth={3} />}
                </div>
              ) : (
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}>
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

            <button
        onClick={handleInitialSubmit}
        disabled={state.loading || state.selectedIds.length === 0}
        className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.loading ? (
          <span>Casting your vote…</span>
        ) : (
          <span>
            Submit {state.selectedIds.length > 1 ? `${state.selectedIds.length} Votes` : "My Vote"}
          </span>
        )}
      </button>

            {state.showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onKeyDown={(e) => e.key === "Escape" && setState(s => ({ ...s, showConfirm: false }))}
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 id="confirm-title" className="text-xl font-black text-slate-800 mb-2">
              Confirm your {selectedTexts.length > 1 ? "votes" : "vote"}
            </h3>
            <p className="text-sm text-slate-500 mb-4">You selected:</p>
            <ul className="space-y-2 mb-6">
              {selectedTexts.map((t) => (
                <li key={t} className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 text-sm">
                  <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 font-medium mb-5">Your vote cannot be changed after submission.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setState(s => ({ ...s, showConfirm: false }))}
                disabled={state.loading}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={state.loading}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex justify-center items-center"
              >
                {state.loading ? "Casting…" : "Confirm Vote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
