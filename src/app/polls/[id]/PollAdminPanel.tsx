"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePoll, updatePoll } from "@/app/actions/poll";
import { Trash2, Pencil, X, Save, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface PollAdminPanelProps {
  pollId: string;
  initialQuestion: string;
  initialDescription: string | null;
  initialClosesAt: string | null; // ISO string or null
  voteCount: number;
}

export default function PollAdminPanel({
  pollId,
  initialQuestion,
  initialDescription,
  initialClosesAt,
  voteCount,
}: PollAdminPanelProps) {
  const router = useRouter();
  const [state, setState] = useState({
    isEditing: false,
    showDeleteConfirm: false,
    question: initialQuestion,
    description: initialDescription ?? "",
    closesAt: initialClosesAt ? initialClosesAt.slice(0, 16) : "",
    loading: false
  });

  const canEdit = voteCount === 0;

  const handleDelete = async () => {
    setState(s => ({ ...s, loading: true }));
    const result = await deletePoll(pollId);
    setState(s => ({ ...s, loading: false }));
    if (result.success) {
      toast.success("Poll deleted successfully.");
      router.push("/");
    } else {
      toast.error(result.error || "Could not delete poll.");
      setState(s => ({ ...s, showDeleteConfirm: false }));
    }
  };

  const handleSave = async () => {
    setState(s => ({ ...s, loading: true }));
    const result = await updatePoll(pollId, {
      question: state.question,
      description: state.description,
      closesAt: state.closesAt || null,
    });
    setState(s => ({ ...s, loading: false }));
    if (result.success) {
      toast.success(result.message ?? "Saved!");
      setState(s => ({ ...s, isEditing: false }));
      router.refresh();
    } else {
      toast.error(result.error || "Could not update poll.");
    }
  };

  return (
    <div className="border border-amber-100 bg-amber-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
          Creator Controls
        </span>
        <div className="flex items-center gap-2">
          <button
            id="poll-edit-btn"
            onClick={() => {
              if (!canEdit) return;
              setState(s => ({ ...s, isEditing: !s.isEditing }));
            }}
            title={canEdit ? "Edit poll" : "Cannot edit — poll already has votes"}
            className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              state.isEditing
                ? "bg-slate-100 border-slate-200 text-slate-600"
                : canEdit
                ? "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {state.isEditing ? (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </>
            )}
          </button>

          <button
            id="poll-delete-btn"
            onClick={() => setState(s => ({ ...s, showDeleteConfirm: true }))}
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {!canEdit && (
        <p className="text-xs text-amber-700">
          ⚠️ This poll has <strong>{voteCount} votes</strong> — editing is locked to preserve data
          integrity. You may still delete it.
        </p>
      )}

      {state.isEditing && canEdit && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Question</label>
            <input
              type="text"
              value={state.question}
              onChange={(e) => setState(s => ({ ...s, question: e.target.value }))}
              maxLength={300}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Description (optional)
            </label>
            <textarea
              value={state.description}
              onChange={(e) => setState(s => ({ ...s, description: e.target.value }))}
              maxLength={1000}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Closing Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              value={state.closesAt}
              onChange={(e) => setState(s => ({ ...s, closesAt: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            id="poll-save-btn"
            onClick={handleSave}
            disabled={state.loading}
            className="w-full flex justify-center items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{state.loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      )}

      {state.showDeleteConfirm && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-red-700">
            Are you sure you want to permanently delete this poll and all its votes?
          </p>
          <div className="flex gap-2">
            <button
              id="poll-delete-confirm-btn"
              onClick={handleDelete}
              disabled={state.loading}
              className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {state.loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              id="poll-delete-cancel-btn"
              onClick={() => setState(s => ({ ...s, showDeleteConfirm: false }))}
              className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
