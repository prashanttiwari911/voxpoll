"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Sparkles, Trophy, Users, Globe, BarChart2 } from "lucide-react";

interface OptionResult {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

interface AgeDataPoint {
  name: string; // "Under 25", "25 - 45", "45+"
  [optionText: string]: string | number; // optionName: count
}

interface RegionDataPoint {
  name: string; // Region name (e.g. "Delhi")
  value: number; // total vote count
}

interface PollResultsProps {
  options: OptionResult[];
  totalVotes: number;
  ageData: AgeDataPoint[];
  regionData: RegionDataPoint[];
}

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4"];

export default function PollResults({ options, totalVotes, ageData, regionData }: PollResultsProps) {
  // Sort options by vote count to find the leader
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const leadingOption = sortedOptions[0];

  return (
    <div className="space-y-8">
      {/* 1. Progress Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          Live Standing
        </h3>
        
        <div className="space-y-3.5">
          {options.map((opt) => {
            const isLeader = leadingOption.count > 0 && leadingOption.id === opt.id;
            return (
              <div key={opt.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700">{opt.text}</span>
                    {isLeader && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                        <Sparkles className="h-3 w-3" />
                        <span>Leader</span>
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-black text-indigo-600">
                    {opt.count} {opt.count === 1 ? "vote" : "votes"} ({opt.percentage}%)
                  </span>
                </div>
                
                {/* Progress bar container */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isLeader
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                    }`}
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 my-6" />

      {/* 2. Charts Title */}
      <h3 className="text-lg font-bold text-slate-800 flex items-center">
        <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
        Demographics Analysis
      </h3>

      {totalVotes === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed rounded-3xl text-slate-400">
          No votes cast yet. Demographic charts will load here once votes are submitted!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Age demographics chart */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-pink-500" />
              Votes by Age Group
            </h4>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Legend />
                  {options.map((opt, index) => (
                    <Bar
                      key={opt.id}
                      dataKey={opt.text}
                      stackId="a"
                      fill={COLORS[index % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region demographics chart */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center">
              <Globe className="h-4 w-4 mr-1.5 text-emerald-500" />
              Votes by City / Region
            </h4>
            <div className="h-64 w-full flex flex-col justify-center items-center text-xs">
              {regionData.length === 0 ? (
                <div className="text-slate-400">No regional data available.</div>
              ) : (
                <div className="h-full w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} votes`, "Contribution"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend underneath for regional data */}
                  <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-x-3 gap-y-1 px-2">
                    {regionData.slice(0, 4).map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-1">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[10px] text-slate-500 font-medium">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
