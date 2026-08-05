"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePoll, updatePoll } from "../../actions";
import { Trash2, Pencil, X, Save, AlertCircle, CheckCircle, Clock } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [question, setQuestion] = useState(initialQuestion);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [closesAt, setClosesAt] = useState(
    initialClosesAt ? initialClosesAt.slice(0, 16) : "" // datetime-local format
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canEdit = voteCount === 0;

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const result = await deletePoll(pollId);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Could not delete poll.");
      setShowDeleteConfirm(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updatePoll(pollId, {
      question,
      description,
      closesAt: closesAt || null,
    });

    setLoading(false);
    if (result.success) {
      setSuccess(result.message ?? "Saved!");
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error || "Could not update poll.");
    }
  };

  return (
    <div className="border border-amber-100 bg-amber-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
          Creator Controls
        </span>
        <div className="flex items-center gap-2">
          {/* Edit toggle */}
          <button
            id="poll-edit-btn"
            onClick={() => {
              if (!canEdit) return;
              setIsEditing((v) => !v);
              setError(null);
              setSuccess(null);
            }}
            title={canEdit ? "Edit poll" : "Cannot edit — poll already has votes"}
            className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              isEditing
                ? "bg-slate-100 border-slate-200 text-slate-600"
                : canEdit
                ? "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isEditing ? (
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

          {/* Delete */}
          <button
            id="poll-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Locked-edit notice */}
      {!canEdit && (
        <p className="text-xs text-amber-700">
          ⚠️ This poll has <strong>{voteCount} votes</strong> — editing is locked to preserve data
          integrity. You may still delete it.
        </p>
      )}

      {/* Error / success feedback */}
      {error && (
        <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Edit form */}
      {isEditing && canEdit && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            id="poll-save-btn"
            onClick={handleSave}
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-red-700">
            Are you sure you want to permanently delete this poll and all its votes?
          </p>
          <div className="flex gap-2">
            <button
              id="poll-delete-confirm-btn"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              id="poll-delete-cancel-btn"
              onClick={() => setShowDeleteConfirm(false)}
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
