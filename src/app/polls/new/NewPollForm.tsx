"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll } from "../../actions";
import { AlertCircle, HelpCircle, Plus, Trash2, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "EDUCATION", label: "Education 📚" },
  { value: "SPORTS", label: "Sports ⚽" },
  { value: "POLITICS", label: "Politics ⚖️" },
  { value: "BOOKS", label: "Books 📖" },
];

export default function NewPollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("EDUCATION");
  const [options, setOptions] = useState(["", ""]); // Default starts with 2 blank options
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add an option field
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  // Remove an option field
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, idx) => idx !== index);
      setOptions(updated);
    }
  };

  // Handle changes in option text inputs
  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form validations
    if (question.trim().length < 5) {
      setError("The poll question must be at least 5 characters long.");
      setLoading(false);
      return;
    }

    const filledOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (filledOptions.length < 2) {
      setError("Please provide at least 2 voting choices.");
      setLoading(false);
      return;
    }

    // Call server action
    const result = await createPoll(null, {
      question,
      description,
      category,
      options: filledOptions,
    });

    setLoading(false);
    if (result.success && result.pollId) {
      router.push(`/polls/${result.pollId}`);
    } else {
      setError(result.error || "An error occurred while creating the poll.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Question Input */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
          <HelpCircle className="h-4 w-4 mr-1.5 text-indigo-500" />
          Poll Question / Topic
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which subject is most exciting to learn in 2026?"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Description / Context (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Give a bit of context or explain why people should vote on this!"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800"
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Select Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
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

      {/* Voting Options */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Voting Choices (2 to 6 options)
        </label>
        <div className="space-y-3">
          {options.map((optionText, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
              <input
                type="text"
                value={optionText}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                required={idx < 2} // First two are required
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-3 inline-flex items-center space-x-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add another option</span>
          </button>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>Creating Poll...</span>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Launch Poll 🚀</span>
          </>
        )}
      </button>
    </form>
  );
}
