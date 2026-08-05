"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll } from "../../actions";
import {
  AlertCircle, HelpCircle, Plus, Trash2, Sparkles, Clock,
  CalendarClock, ListChecks, Image, Tag, X, CheckSquare,
} from "lucide-react";

const CATEGORIES = [
  { value: "EDUCATION",  label: "Education 📚" },
  { value: "SPORTS",     label: "Sports ⚽" },
  { value: "POLITICS",   label: "Politics ⚖️" },
  { value: "BOOKS",      label: "Books 📖" },
  { value: "TECHNOLOGY", label: "Technology 💻" },
  { value: "HEALTH",     label: "Health 🏥" },
  { value: "OTHER",      label: "Other 💬" },
];

export default function NewPollForm() {
  const router = useRouter();

  // Core fields
  const [question, setQuestion]       = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("EDUCATION");
  const [options, setOptions]         = useState(["", ""]);
  const [closesAt, setClosesAt]       = useState("");

  // New fields
  const [isMultiple, setIsMultiple]   = useState(false);
  const [maxChoices, setMaxChoices]   = useState(2);
  const [imageUrl, setImageUrl]       = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [tagInput, setTagInput]       = useState("");
  const [tags, setTags]               = useState<string[]>([]);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Option helpers ──
  const addOption    = () => options.length < 10 && setOptions([...options, ""]);
  const removeOption = (i: number) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));
  const changeOption = (i: number, val: string) => {
    const u = [...options]; u[i] = val; setOptions(u);
  };

  // ── Tag helpers ──
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "-");
    if (t && tags.length < 5 && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 5) {
      setError("Question must be at least 5 characters."); return;
    }
    const filled = options.map((o) => o.trim()).filter(Boolean);
    if (filled.length < 2) {
      setError("Please provide at least 2 voting choices."); return;
    }

    setLoading(true); setError(null);

    const result = await createPoll(null, {
      question,
      description,
      category,
      options: filled,
      closesAt: closesAt || undefined,
      scheduledAt: scheduledAt || undefined,
      isMultipleChoice: isMultiple,
      maxChoices: isMultiple ? maxChoices : undefined,
      imageUrl: imageUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      status: saveAsDraft ? "DRAFT" : "PUBLISHED",
    });

    setLoading(false);
    if (result.success && result.pollId) {
      router.push(`/polls/${result.pollId}`);
    } else {
      setError(result.error || "An error occurred while creating the poll.");
    }
  };

  // ── UI ──
  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Question */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-indigo-500" /> Poll Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which subject is most exciting to learn in 2026?"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800"
        />
        <p className="text-[10px] text-slate-400 mt-1 text-right">{question.length}/300</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Give context or explain why people should vote!"
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Select Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                category === cat.value
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voting options */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Voting Choices <span className="font-normal text-slate-400">(2–10)</span>
        </label>
        <div className="space-y-2.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
              <input
                type="text"
                value={opt}
                onChange={(e) => changeOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                required={i < 2}
                maxLength={150}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 text-sm"
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 10 && (
          <button type="button" onClick={addOption}
            className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add option
          </button>
        )}
      </div>

      {/* Multiple choice toggle */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-bold text-slate-700">Allow Multiple Choices</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMultiple((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
              isMultiple ? "bg-violet-600" : "bg-slate-200"
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
              isMultiple ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
        {isMultiple && (
          <div className="flex items-center gap-3 pt-1">
            <label className="text-xs font-semibold text-slate-600">Max selections:</label>
            <input
              type="number"
              min={2}
              max={Math.min(options.filter(Boolean).length || 10, 10)}
              value={maxChoices}
              onChange={(e) => setMaxChoices(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-indigo-400" /> Tags <span className="font-normal text-slate-400">(up to 5)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="e.g. india, 2026, ai"
            maxLength={30}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={tags.length >= 5 || !tagInput.trim()}
            className="px-3 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 disabled:opacity-40 transition-all"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Image className="h-4 w-4 text-indigo-400" /> Cover Image URL <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all"
        />
        {imageUrl && (
          <img src={imageUrl} alt="Preview" onError={(e) => (e.currentTarget.style.display = "none")}
            className="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200" />
        )}
      </div>

      {/* Closing date */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-indigo-400" /> Closing Date & Time <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="datetime-local"
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
          min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-800"
        />
        <p className="text-[10px] text-slate-400 mt-1">Leave blank for a poll that never closes.</p>
      </div>

      {/* Scheduled publish */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4 text-violet-400" /> Schedule Publish Date <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all text-slate-800"
        />
        <p className="text-[10px] text-slate-400 mt-1">If set, the poll will be saved as a DRAFT until this date.</p>
      </div>

      {/* Save as draft toggle */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Save as Draft</span>
          <span className="text-xs text-slate-400">(publish manually later)</span>
        </div>
        <button
          type="button"
          onClick={() => setSaveAsDraft((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
            saveAsDraft ? "bg-slate-600" : "bg-slate-200"
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
            saveAsDraft ? "translate-x-5" : "translate-x-0.5"
          }`} />
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>Creating…</span>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>{saveAsDraft ? "Save Draft 📋" : "Launch Poll 🚀"}</span>
          </>
        )}
      </button>
    </form>
  );
}
