export interface PollStatsOption { id: string; text: string; }
export interface PollStatsVote {
  userId: string;
  optionId: string;
  createdAt: Date;
  user: { age: number | null; address: string | null; } | null;
}

export function calculatePollStats(votes: PollStatsVote[], options: PollStatsOption[]) {
  const totalVoters = new Set(votes.map(v => v.userId)).size;
  
  const optionsResults = options.map(opt => {
    const count = votes.filter(v => v.optionId === opt.id).length;
    return { id: opt.id, text: opt.text, count, percentage: totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0 };
  });

  const ageData = [
    { name: "Under 25", min: 0, max: 24 },
    { name: "25 - 45", min: 25, max: 45 },
    { name: "45+", min: 46, max: 120 }
  ].map(group => {
    const dataPoint: { name: string; [key: string]: string | number } = { name: group.name };
    options.forEach(opt => dataPoint[opt.text] = 0);
    votes.forEach(vote => {
      const age = vote.user?.age;
      const text = options.find(o => o.id === vote.optionId)?.text;
      if (age != null && text && age >= group.min && age <= group.max) {
        dataPoint[text] = (dataPoint[text] as number) + 1;
      }
    });
    return dataPoint;
  });

  const regionCounts: Record<string, number> = {};
  const countedUsers = new Set<string>();
  votes.forEach(vote => {
    if (countedUsers.has(vote.userId)) return;
    const state = vote.user?.address?.trim();
    if (state) regionCounts[state] = (regionCounts[state] || 0) + 1;
    countedUsers.add(vote.userId);
  });
  const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const dailyCounts: Record<string, number> = {};
  votes.forEach(vote => {
    const day = new Date(vote.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  
  let runningTotal = 0;
  const trendData = Object.keys(dailyCounts)
    .sort((a, b) => new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime())
    .map(date => ({ date, votes: dailyCounts[date], cumulative: (runningTotal += dailyCounts[date]) }));

  return { totalVoters, totalVotes: votes.length, optionsResults, ageData, regionData, trendData };
}
