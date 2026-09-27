"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPoll } from "@/app/actions/poll";
import { AlertCircle, Plus, Trash2, Sparkles, Clock, ListChecks, CheckSquare, BarChart3, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "EDUCATION", label: "Education 📚" },
  { value: "SPORTS", label: "Sports ⚽" },
  { value: "POLITICS", label: "Politics ⚖️" },
  { value: "BOOKS", label: "Books 📖" },
  { value: "TECHNOLOGY", label: "Technology 💻" },
  { value: "HEALTH", label: "Health 🏥" },
  { value: "OTHER", label: "Other 💬" },
];

export default function NewPollForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    question: "", description: "", category: "EDUCATION", options: ["", ""],
    closesAt: "", minDate: "", isMultiple: false, saveAsDraft: false,
    scheduledAt: "", maxChoices: 2, imageUrl: "", tags: [] as string[],
    loading: false, error: null as string | null,
  });

  useEffect(() => {
    setForm(f => ({ ...f, minDate: new Date(Date.now() + 60_000).toISOString().slice(0, 16) }));
  }, []);

  const addOption = () => form.options.length < 10 && setForm({ ...form, options: [...form.options, ""] });
  const removeOption = (i: number) => form.options.length > 2 && setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  const changeOption = (i: number, val: string) => {
    const newOptions = [...form.options];
    newOptions[i] = val;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.question.trim().length < 5) return toast.error("Question must be at least 5 characters.");
    const filled = form.options.map((o) => o.trim()).filter(Boolean);
    if (filled.length < 2) return toast.error("Please provide at least 2 voting choices.");

    setForm({ ...form, loading: true });

    const result = await createPoll(null, {
      question: form.question,
      description: form.description,
      category: form.category,
      options: filled,
      closesAt: form.closesAt || undefined,
      scheduledAt: form.scheduledAt || undefined,
      isMultipleChoice: form.isMultiple,
      maxChoices: form.isMultiple ? form.maxChoices : undefined,
      imageUrl: form.imageUrl || undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
      status: form.saveAsDraft ? "DRAFT" : "PUBLISHED",
    });

    setForm({ ...form, loading: false });
    if (result.success && result.pollId) {
      toast.success("Poll created successfully!");
      router.push(`/polls/${result.pollId}`);
    } else {
      toast.error(result.error || "An error occurred while creating the poll.");
    }
  };

  const previewOptions = form.options.map((opt, i) => opt.trim() || `Option ${i + 1}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      <div className="lg:col-span-7 space-y-7">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" /> Poll Question
            </label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="e.g. Which subject is most exciting to learn in 2026?"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400"
            />
            <p className="text-[10px] text-zinc-400 mt-1 text-right">{form.question.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Voting Choices <span className="font-normal text-zinc-400">(2–10)</span>
            </label>
            <div className="space-y-3">
              {form.options.map((opt, i) => (
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
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {form.options.length < 10 && (
              <button type="button" onClick={addOption} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                <Plus className="h-4 w-4" /> Add another choice
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Description <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Give context or explain why people should vote!"
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all text-zinc-800 font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-bold text-zinc-800 appearance-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-400" /> Closes At
              </label>
              <input
                type="datetime-local"
                value={form.closesAt}
                onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
                min={form.minDate}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-zinc-800"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-sm font-black text-zinc-900 mb-4 uppercase tracking-wider">Advanced Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 hover:border-zinc-200 transition-colors cursor-pointer" onClick={() => setForm({ ...form, isMultiple: !form.isMultiple })}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.isMultiple ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-zinc-400'}`}>
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-zinc-800">Multiple Choices</span>
                    <span className="block text-xs text-zinc-500 font-medium mt-0.5">Allow users to select more than one option</span>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${form.isMultiple ? "bg-indigo-600" : "bg-zinc-300"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-1 ${form.isMultiple ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 hover:border-zinc-200 transition-colors cursor-pointer" onClick={() => setForm({ ...form, saveAsDraft: !form.saveAsDraft })}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.saveAsDraft ? 'bg-amber-100 text-amber-600' : 'bg-white text-zinc-400'}`}>
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-zinc-800">Save as Draft</span>
                    <span className="block text-xs text-zinc-500 font-medium mt-0.5">Keep poll private until you&apos;re ready to publish</span>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${form.saveAsDraft ? "bg-amber-500" : "bg-zinc-300"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-1 ${form.saveAsDraft ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={form.loading}
            className="w-full flex justify-center items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.loading ? <span>Creating…</span> : <><Sparkles className="h-5 w-5" /><span>{form.saveAsDraft ? "Save Draft" : "Create Poll"}</span></>}
          </button>
        </form>
      </div>

      <div className="lg:col-span-5 relative hidden lg:block">
        <div className="sticky top-8">
          <h3 className="text-sm font-black text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Live Preview
          </h3>
          
          <div className="bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-6 text-white space-y-3">
              <span className="inline-block bg-white/20 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                {CATEGORIES.find(c => c.value === form.category)?.label || form.category}
              </span>
              <h2 className="text-2xl font-black leading-tight break-words">
                {form.question || "Your question will appear here..."}
              </h2>
              {form.description && (
                <p className="text-indigo-100 text-sm leading-relaxed line-clamp-3">{form.description}</p>
              )}
            </div>
            
            <div className="p-6 space-y-3 bg-zinc-50">
              <div className="text-xs font-bold text-zinc-400 mb-4 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-zinc-300"></div> 
                {form.isMultiple ? "Select multiple answers" : "Select one answer"}
              </div>
              
              {previewOptions.map((opt, i) => (
                <div key={i} className="bg-white border-2 border-zinc-200 p-4 rounded-2xl flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 border-zinc-300 flex items-center justify-center ${form.isMultiple ? 'rounded-md' : 'rounded-full'}`}>
                  </div>
                  <span className="font-bold text-zinc-700">{opt}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-400">
              <span>{form.options.length} options</span>
              {form.closesAt && <span>Closes {new Date(form.closesAt).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
