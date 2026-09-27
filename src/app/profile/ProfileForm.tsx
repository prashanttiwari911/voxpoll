"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/user";
import { User, MapPin, Calendar, Sparkles } from "lucide-react";
import { INDIA_STATES } from "@/lib/states";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    age: number | null;
    address: string | null;
    gender: string | null;
    occupation: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name || "");
  const [age, setAge] = useState(initialData.age ? String(initialData.age) : "");
  const [address, setAddress] = useState(initialData.address || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [occupation, setOccupation] = useState(initialData.occupation || "");
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("address", address);
    formData.append("gender", gender);
    formData.append("occupation", occupation);

    const result = await updateProfile(null, formData);

    setLoading(false);
    if (result.success) {
      toast.success(result.message || "Profile updated!");
      router.refresh();
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            Your State / UT
          </label>
          <select
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="" disabled>Select State/UT</option>
            {INDIA_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Required for India Map demographics.</p>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Gender Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>

        {/* Occupation Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Occupation
          </label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Student, Software Engineer"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
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
