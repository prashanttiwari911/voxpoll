"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll } from "../../actions";
import {
  AlertCircle, HelpCircle, Plus, Trash2, Sparkles, Clock,
  CalendarClock, ListChecks, Image, Tag, X, CheckSquare,
  BarChart3,
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

  // Safe preview getters
  const previewOptions = options.map((opt, i) => opt.trim() || `Option ${i + 1}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* ── Left Column: Form Settings ── */}
      <div className="lg:col-span-7 space-y-7">
        <form onSubmit={handleSubmit} className="space-y-7">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" /> Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which subject is most exciting to learn in 2026?"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400"
            />
            <p className="text-[10px] text-zinc-400 mt-1 text-right">{question.length}/300</p>
          </div>

          {/* Voting options */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Voting Choices <span className="font-normal text-zinc-400">(2–10)</span>
            </label>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-zinc-100 text-zinc-500 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => changeOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    required={i < 2}
                    maxLength={150}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all text-zinc-800 font-medium"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)}
                      className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button type="button" onClick={addOption}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                <Plus className="h-4 w-4" /> Add another choice
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Description <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give context or explain why people should vote!"
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all text-zinc-800 font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-bold text-zinc-800 appearance-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Closing date */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-400" /> Closes At
              </label>
              <input
                type="datetime-local"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-zinc-800"
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-sm font-black text-zinc-900 mb-4 uppercase tracking-wider">Advanced Settings</h3>
            
            <div className="space-y-4">
              {/* Multiple choice toggle */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 hover:border-zinc-200 transition-colors cursor-pointer" onClick={() => setIsMultiple(!isMultiple)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isMultiple ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-zinc-400'}`}>
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-zinc-800">Multiple Choices</span>
                    <span className="block text-xs text-zinc-500 font-medium mt-0.5">Allow users to select more than one option</span>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${isMultiple ? "bg-indigo-600" : "bg-zinc-300"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-1 ${isMultiple ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>

              {/* Draft toggle */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 hover:border-zinc-200 transition-colors cursor-pointer" onClick={() => setSaveAsDraft(!saveAsDraft)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${saveAsDraft ? 'bg-amber-100 text-amber-600' : 'bg-white text-zinc-400'}`}>
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-zinc-800">Save as Draft</span>
                    <span className="block text-xs text-zinc-500 font-medium mt-0.5">Keep poll private until you're ready to publish</span>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${saveAsDraft ? "bg-amber-500" : "bg-zinc-300"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-1 ${saveAsDraft ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Creating…</span>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>{saveAsDraft ? "Save Draft" : "Create Poll"}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Right Column: Live Preview ── */}
      <div className="lg:col-span-5 relative hidden lg:block">
        <div className="sticky top-8">
          <h3 className="text-sm font-black text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Live Preview
          </h3>
          
          {/* Mock Poll Card */}
          <div className="bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Category header */}
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-6 text-white space-y-3">
              <span className="inline-block bg-white/20 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                {CATEGORIES.find(c => c.value === category)?.label || category}
              </span>
              <h2 className="text-2xl font-black leading-tight break-words">
                {question || "Your question will appear here..."}
              </h2>
              {description && (
                <p className="text-indigo-100 text-sm leading-relaxed line-clamp-3">{description}</p>
              )}
            </div>
            
            {/* Options */}
            <div className="p-6 space-y-3 bg-zinc-50">
              <p className="text-xs font-bold text-zinc-400 mb-4 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-zinc-300"></div> 
                {isMultiple ? "Select multiple answers" : "Select one answer"}
              </p>
              
              {previewOptions.map((opt, i) => (
                <div key={i} className="bg-white border-2 border-zinc-200 p-4 rounded-2xl flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 border-zinc-300 flex items-center justify-center ${isMultiple ? 'rounded-md' : 'rounded-full'}`}>
                  </div>
                  <span className="font-bold text-zinc-700">{opt}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-400">
              <span>{options.length} options</span>
              {closesAt && <span>Closes {new Date(closesAt).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
