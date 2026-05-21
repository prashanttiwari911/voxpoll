"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions";
import { User, MapPin, Calendar, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    age: number | null;
    address: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name || "");
  const [age, setAge] = useState(initialData.age ? String(initialData.age) : "");
  const [address, setAddress] = useState(initialData.address || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("address", address);

    const result = await updateProfile(null, formData);

    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "Profile updated!");
      router.refresh();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Boxes */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
          <User className="h-4 w-4 mr-1.5 text-indigo-500" />
          Your Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aria Sharma"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Email Display (Read-Only) */}
      <div>
        <label className="block text-sm font-semibold text-slate-400 mb-2">
          Email Address (Linked via Google/Auth)
        </label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Age Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-pink-500" />
            Your Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 22"
            min="1"
            max="120"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Required for age demographics charts.</p>
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 text-amber-500" />
            Your City / Region
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Delhi, Mumbai, Kerala"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Required for regional demographics charts.</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>Saving Changes...</span>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Save Profile Details</span>
          </>
        )}
      </button>
    </form>
  );
}
