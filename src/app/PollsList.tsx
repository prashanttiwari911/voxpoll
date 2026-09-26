"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Flame, ArrowRight, BookOpen, GraduationCap, Trophy,
  Gavel, HelpCircle, SlidersHorizontal, Clock, Laptop, HeartPulse,
  X, Filter, Users
} from "lucide-react";

interface Option { id: string; text: string }

interface PollItem {
  id: string;
  question: string;
  description: string | null;
  category: string;
  status: string;
  closesAt?: Date | string | null;
  createdAt: Date | string;
  creator: { name: string | null };
  options: Option[];
  _count: { votes: number };
}

interface PollsListProps { initialPolls: PollItem[] }

// ---------------------------------------------------------------------------
// Category config (extended to match schema)
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  EDUCATION:  { label: "Education",  icon: GraduationCap, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  SPORTS:     { label: "Sports",     icon: Trophy,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  POLITICS:   { label: "Politics",   icon: Gavel,         color: "text-red-600",     bg: "bg-red-50 border-red-100" },
  BOOKS:      { label: "Books",      icon: BookOpen,      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  TECHNOLOGY: { label: "Technology", icon: Laptop,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  HEALTH:     { label: "Health",     icon: HeartPulse,    color: "text-pink-600",    bg: "bg-pink-50 border-pink-100" },
  OTHER:      { label: "Other",      icon: HelpCircle,    color: "text-slate-600",   bg: "bg-slate-50 border-slate-100" },
};

type SortKey = "newest" | "most_active" | "closing_soon";

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DRAFT:     "bg-slate-100 text-slate-500 border-slate-200",
  CLOSED:    "bg-red-50 text-red-600 border-red-100",
};

function isPollClosed(poll: PollItem): boolean {
  if (poll.status === "CLOSED") return true;
  if (!poll.closesAt) return false;
  return new Date(poll.closesAt) <= new Date();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PollsList({ initialPolls }: PollsListProps) {
  const [search, setSearch]               = useState("");
  const [selectedCategory, setCategory]   = useState("ALL");
  const [selectedStatus, setStatus]       = useState("ALL");
  const [sort, setSort]                   = useState<SortKey>("newest");
  const [showFilters, setShowFilters]     = useState(false);

  const hasActiveFilters =
    search !== "" || selectedCategory !== "ALL" || selectedStatus !== "ALL" || sort !== "newest";

  const clearFilters = () => {
    setSearch(""); setCategory("ALL"); setStatus("ALL"); setSort("newest");
  };

  // Filter
  const filtered = useMemo(() => initialPolls.filter((poll) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      poll.question.toLowerCase().includes(q) ||
      (poll.description?.toLowerCase().includes(q) ?? false);
    const matchCat = selectedCategory === "ALL" || poll.category === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || poll.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  }), [initialPolls, search, selectedCategory, selectedStatus]);

  // Sort
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === "most_active")   return b._count.votes - a._count.votes;
    if (sort === "closing_soon") {
      const aT = a.closesAt ? new Date(a.closesAt).getTime() : Infinity;
      const bT = b.closesAt ? new Date(b.closesAt).getTime() : Infinity;
      return aT - bT;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [filtered, sort]);

  return (
    <div className="space-y-6">
      {/* ── Compact Filter Panel ── */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            id="polls-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search polls…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-slate-800 dark:text-zinc-100 transition-all bg-slate-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories (Scrollable) */}
        <div className="flex-1 w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-1 md:pb-0">
          <button
            onClick={() => setCategory("ALL")}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 pt-2 md:pt-0 md:pl-3">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 hidden lg:inline-block">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold py-2 px-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-400 outline-none w-full md:w-auto cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="most_active">Most Active</option>
            <option value="closing_soon">Closing Soon</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-between items-center text-xs px-2">
          <span className="text-slate-500 font-medium">
            Found {sorted.length} {sorted.length === 1 ? 'poll' : 'polls'}
          </span>
          <button onClick={clearFilters} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
            <X className="h-3 w-3" /> Clear filters
          </button>
        </div>
      )}

      {/* ── Poll Cards ── */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <HelpCircle className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
          <span className="block font-bold text-slate-700 dark:text-zinc-100 text-lg">No polls found</span>
          <span className="text-sm text-slate-500 dark:text-zinc-400 mt-1">There aren't any polls matching your search.</span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors">
              Explore All Polls
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((poll) => {
            const cat = CATEGORY_MAP[poll.category] ?? CATEGORY_MAP.OTHER;
            const closed = isPollClosed(poll);

            return (
              <div
                key={poll.id}
                className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                  closed 
                    ? "border-slate-100 dark:border-zinc-800 border-t-4 border-t-slate-300 dark:border-t-zinc-600 bg-slate-50/50 dark:bg-zinc-900/50" 
                    : "border-slate-100 dark:border-zinc-800 border-t-4 border-t-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:border-t-indigo-600 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top bar: Category + Status */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      {cat.label}
                    </span>
                    {closed ? (
                      <span className="bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                        CLOSED
                      </span>
                    ) : poll.status === "DRAFT" ? (
                      <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                        DRAFT
                      </span>
                    ) : (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  <h4 className={`font-extrabold text-lg leading-snug mb-3 transition-colors ${
                    closed ? "text-slate-600 dark:text-zinc-400" : "text-slate-800 dark:text-zinc-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400"
                  }`}>
                    {poll.question}
                  </h4>
                  
                  {/* Options preview (count) */}
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mb-5">
                    {poll.options.length} options
                  </div>
                </div>

                {/* Footer metrics & CTA */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4 mt-auto">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      <span>{poll._count.votes} votes</span>
                    </div>
                    {poll.closesAt && !closed && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                        <span>{Math.ceil((new Date(poll.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href={`/polls/${poll.id}`}
                    className={`inline-flex items-center gap-1 text-sm font-bold transition-all ${
                      closed ? "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200" : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    }`}
                  >
                    <span>{closed ? "View Results" : "Participate"}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
