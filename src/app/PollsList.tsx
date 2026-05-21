"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Flame, ArrowRight, BookOpen, GraduationCap, Trophy, Gavel, HelpCircle } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface PollItem {
  id: string;
  question: string;
  description: string | null;
  category: string;
  createdAt: Date | string;
  creator: {
    name: string | null;
  };
  options: Option[];
  _count: {
    votes: number;
  };
}

interface PollsListProps {
  initialPolls: PollItem[];
}

const CATEGORY_MAP: { [key: string]: { label: string; icon: any; color: string; bg: string } } = {
  EDUCATION: { label: "Education", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
  SPORTS: { label: "Sports", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  POLITICS: { label: "Politics", icon: Gavel, color: "text-red-600", bg: "bg-red-50 border-red-100" },
  BOOKS: { label: "Books", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
};

export default function PollsList({ initialPolls }: PollsListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Filter polls
  const filteredPolls = initialPolls.filter((poll) => {
    const matchesSearch = poll.question.toLowerCase().includes(search.toLowerCase()) || 
      (poll.description && poll.description.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = selectedCategory === "ALL" || poll.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Section */}
      <div className="bg-white border border-indigo-50 p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Filter & Find Polls</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search polls by question or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-slate-800"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Polls
          </button>
          
          {Object.entries(CATEGORY_MAP).map(([key, value]) => {
            const Icon = value.icon;
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{value.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Poll Cards list */}
      {filteredPolls.length === 0 ? (
        <div className="text-center py-16 bg-white border border-indigo-50 rounded-3xl p-6 shadow-inner text-slate-400">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <span className="block font-bold">No polls match your search.</span>
          <span className="text-xs">Be the first to ask a question!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map((poll) => {
            const catInfo = CATEGORY_MAP[poll.category] || {
              label: poll.category,
              icon: HelpCircle,
              color: "text-slate-600",
              bg: "bg-slate-50",
            };
            const IconComponent = catInfo.icon;
            
            return (
              <div
                key={poll.id}
                className="bg-white border border-indigo-50 hover:border-indigo-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Category tag */}
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`inline-flex items-center space-x-1.5 py-1 px-3 rounded-full text-[10px] font-black border uppercase tracking-wider ${catInfo.color} ${catInfo.bg}`}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span>{catInfo.label}</span>
                    </span>
                    
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Question */}
                  <h4 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                    {poll.question}
                  </h4>
                  
                  {poll.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                    <span>{poll._count.votes} {poll._count.votes === 1 ? "vote" : "votes"} cast</span>
                  </div>
                  
                  <Link
                    href={`/polls/${poll.id}`}
                    className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold transition-all"
                  >
                    <span>Participate</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
