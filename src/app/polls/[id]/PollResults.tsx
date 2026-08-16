"use client";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import { useState } from "react";
import {
  Trophy, Users, Globe, TrendingUp, PieChart as PieIcon,
  BarChart2, Sparkles, Award,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OptionResult {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

export interface AgeDataPoint {
  name: string; // "Under 25" | "25-45" | "45+"
  [optionText: string]: string | number;
}

export interface RegionDataPoint {
  name: string;
  value: number;
}

export interface TrendDataPoint {
  date: string; // "Jan 1", "Jan 2" …
  votes: number;
  cumulative: number;
}

interface PollResultsProps {
  options: OptionResult[];
  totalVotes: number;
  ageData: AgeDataPoint[];
  regionData: RegionDataPoint[];
  trendData: TrendDataPoint[];
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

// Active shape removed — Recharts v3 Pie type doesn't accept activeIndex/activeShape
// Use Tooltip + Legend for interactivity instead.

type TabKey = "pie" | "age" | "region" | "trend";
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "pie",      label: "Overview",   icon: <PieIcon className="h-3.5 w-3.5" /> },
  { key: "age",      label: "Age",        icon: <Users className="h-3.5 w-3.5" /> },
  { key: "region",   label: "Region",     icon: <Globe className="h-3.5 w-3.5" /> },
  { key: "trend",    label: "Trend",      icon: <TrendingUp className="h-3.5 w-3.5" /> },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PollResults({
  options, totalVotes, ageData, regionData, trendData,
}: PollResultsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("pie");

  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const leader = sortedOptions[0];

  // Pie chart data
  const pieData = options.map((o) => ({ name: o.text, value: o.count }));

  // Region bar data (horizontal) — top 8
  const regionBarData = regionData.slice(0, 8);

  const noVotes = totalVotes === 0;

  return (
    <div className="space-y-8">
      {/* ── Live Results ── */}
      <div className="space-y-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Results
            </h2>
            <p className="text-sm text-slate-500 font-semibold mt-1">{totalVotes.toLocaleString()} total votes</p>
          </div>
        </div>

        {noVotes ? (
          <p className="text-center text-slate-400 text-sm py-6">No votes yet.</p>
        ) : (
          <div className="space-y-6">
            {sortedOptions.map((opt) => {
              const isLeader = leader.count > 0 && leader.id === opt.id;
              return (
                <div key={opt.id} className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800">{opt.text}</span>
                      {isLeader && (
                        <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full uppercase">
                          <Sparkles className="h-3 w-3" /> Leading
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-12 bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-2xl transition-all duration-1000 ease-out flex items-center px-4 ${
                        isLeader
                          ? "bg-indigo-600"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${Math.max(opt.percentage, 5)}%` }} // At least 5% to show text if 0%
                    >
                      {opt.percentage > 0 && (
                        <span className="text-white font-black text-lg drop-shadow-md">
                          {opt.percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 text-right pr-1">
                    {opt.count.toLocaleString()} {opt.count === 1 ? 'vote' : 'votes'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Leading option callout */}
        {!noVotes && leader && leader.count > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl px-4 py-3 mt-4">
            <Award className="h-5 w-5 text-indigo-500 shrink-0" />
            <p className="text-sm font-bold text-indigo-900">
              <span className="text-indigo-600">"{leader.text}"</span> is leading with{" "}
              {leader.percentage}% of votes
            </p>
          </div>
        )}
      </div>

      {/* ── Demographics & Insights ── */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2">Demographics</h3>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Total Respondents</span>
            <span className="block text-xl font-black text-slate-800 mt-1">{totalVotes.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Options</span>
            <span className="block text-xl font-black text-slate-800 mt-1">{options.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Regions</span>
            <span className="block text-xl font-black text-slate-800 mt-1">{regionData.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Last Updated</span>
            <span className="block text-sm font-black text-slate-800 mt-2">Just now</span>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === t.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[320px]">
          
          {/* ── Vote Share Pie ── */}
          {activeTab === "pie" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-indigo-500" /> Overall Share
              </h3>
              {noVotes ? (
                <p className="text-center text-slate-400 text-sm py-10">No votes cast yet.</p>
              ) : (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} votes`]} />
                        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center pt-2">
                    {options.map((o, i) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-700 font-semibold">{o.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Age Breakdown ── */}
          {activeTab === "age" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-500" /> Responses by Age Group
              </h3>
              {noVotes ? (
                <p className="text-center text-slate-400 text-sm py-10">No votes cast yet.</p>
              ) : (
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                      {options.map((opt, i) => (
                        <Bar
                          key={opt.id}
                          dataKey={opt.text}
                          stackId="a"
                          fill={COLORS[i % COLORS.length]}
                          radius={i === options.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── Region Horizontal Bar ── */}
          {activeTab === "region" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" /> Geographic Distribution
              </h3>
              {regionBarData.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">No regional data yet.</p>
              ) : (
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={regionBarData}
                      margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" name="Votes" radius={[0, 4, 4, 0]} barSize={24}>
                        {regionBarData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── Vote Trend Line ── */}
          {activeTab === "trend" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" /> Participation Trend
              </h3>
              {trendData.length < 2 ? (
                <p className="text-center text-slate-400 text-sm py-10">
                  Not enough data yet — trend appears once 2+ days of votes are recorded.
                </p>
              ) : (
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ right: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                      <Line
                        type="monotone"
                        dataKey="votes"
                        name="Daily Votes"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
