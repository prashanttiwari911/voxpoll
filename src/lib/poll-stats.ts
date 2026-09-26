// src/lib/poll-stats.ts

export interface PollStatsOption {
  id: string;
  text: string;
}

export interface PollStatsVote {
  userId: string;
  optionId: string;
  createdAt: Date;
  user: {
    age: number | null;
    address: string | null;
  } | null;
}

export function calculatePollStats(
  votes: PollStatsVote[],
  options: PollStatsOption[]
) {
  // 1. Total Unique Voters
  const uniqueVoterIds = new Set(votes.map((v) => v.userId));
  const totalVoters = uniqueVoterIds.size;
  
  // Total raw votes (if it's multi-choice, this can be larger than totalVoters)
  const totalVotes = votes.length;

  // 2. Option Statistics
  const optionsResults = options.map((opt) => {
    const count = votes.filter((v) => v.optionId === opt.id).length;
    // For percentages in multi-choice, we divide by the total number of unique voters,
    // so percentages show "% of voters who selected this option".
    const percentage = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
    return { id: opt.id, text: opt.text, count, percentage };
  });

  // 3. Age Demographics (Counting Selections by age group)
  const ageGroups = [
    { name: "Under 25", min: 0, max: 24 },
    { name: "25 - 45", min: 25, max: 45 },
    { name: "45+", min: 46, max: 120 },
  ];
  
  const ageData = ageGroups.map((group) => {
    const dataPoint: { name: string; [key: string]: string | number } = { name: group.name };
    options.forEach((opt) => { dataPoint[opt.text] = 0; });
    
    votes.forEach((vote) => {
      const voterAge = vote.user?.age;
      const optionText = options.find((o) => o.id === vote.optionId)?.text;
      
      if (voterAge && optionText && voterAge >= group.min && voterAge <= group.max) {
        dataPoint[optionText] = (dataPoint[optionText] as number) + 1;
      }
    });
    return dataPoint;
  });

  // 4. Region Demographics (Unique voters per region)
  const regionCounts: { [r: string]: number } = {};
  const countedUsersForRegion = new Set<string>();

  votes.forEach((vote) => {
    // Only count each user once for geographic tracking
    if (countedUsersForRegion.has(vote.userId)) return;

    const state = vote.user?.address?.trim();
    if (state) {
      regionCounts[state] = (regionCounts[state] || 0) + 1;
    }
    countedUsersForRegion.add(vote.userId);
  });

  const regionData = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 5. Vote trend - daily vote counts + cumulative
  const dailyCounts: { [day: string]: number } = {};
  votes.forEach((vote) => {
    const day = new Date(vote.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  let runningTotal = 0;
  const trendData = Object.keys(dailyCounts)
    .sort((a, b) => new Date(a + " 2026").getTime() - new Date(b + " 2026").getTime())
    .map((day) => {
      runningTotal += dailyCounts[day];
      return { date: day, votes: dailyCounts[day], cumulative: runningTotal };
    });

  return {
    totalVoters,
    totalVotes,
    optionsResults,
    ageData,
    regionData,
    trendData,
  };
}
