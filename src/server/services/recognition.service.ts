import { db } from '@/lib/db';
import { RecognitionCardData } from '@/types/leaderboard';

export async function getRecognitionCards(): Promise<RecognitionCardData[]> {
  // Query all active students with successful sync and stats
  const activeStudents = await db.user.findMany({
    where: {
      status: 'ACTIVE',
      profile: { isNot: null },
      codingAccounts: {
        some: {
          platform: 'LEETCODE',
          syncStatus: 'SUCCESS',
          statistics: { isNot: null },
        },
      },
    },
    select: {
      id: true,
      profile: {
        select: {
          displayName: true,
          leetcodeUsername: true,
          avatarUrl: true,
          collegeRank: true,
        },
      },
      codingAccounts: {
        where: { platform: 'LEETCODE' },
        select: {
          statistics: {
            select: {
              totalSolved: true,
              hardSolved: true,
              contestRating: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  const candidates = activeStudents
    .map((s) => {
      const stats = s.codingAccounts[0]?.statistics;
      return {
        displayName: s.profile?.displayName || 'Anonymous Student',
        leetcodeUsername: s.profile?.leetcodeUsername || '',
        avatarUrl: s.profile?.avatarUrl || null,
        collegeRank: s.profile?.collegeRank ?? 999999,
        totalSolved: stats?.totalSolved ?? 0,
        hardSolved: stats?.hardSolved ?? 0,
        contestRating: stats?.contestRating ?? null,
      };
    })
    .filter((c) => Boolean(c.leetcodeUsername));

  // 1. Most Solved
  const sortedBySolved = [...candidates].sort((a, b) => {
    if (b.totalSolved !== a.totalSolved) {
      return b.totalSolved - a.totalSolved;
    }
    return a.collegeRank - b.collegeRank;
  });
  const topSolved = sortedBySolved.length > 0 && sortedBySolved[0].totalSolved > 0 ? sortedBySolved[0] : null;

  // 2. Top Contest Rating
  const ratedCandidates = candidates.filter((c) => typeof c.contestRating === 'number' && c.contestRating > 0);
  ratedCandidates.sort((a, b) => {
    if (b.contestRating! !== a.contestRating!) {
      return b.contestRating! - a.contestRating!;
    }
    return a.collegeRank - b.collegeRank;
  });
  const topRating = ratedCandidates.length > 0 ? ratedCandidates[0] : null;

  // 3. Most Hard Solved
  const sortedByHard = [...candidates].sort((a, b) => {
    if (b.hardSolved !== a.hardSolved) {
      return b.hardSolved - a.hardSolved;
    }
    return a.collegeRank - b.collegeRank;
  });
  const topHard = sortedByHard.length > 0 && sortedByHard[0].hardSolved > 0 ? sortedByHard[0] : null;

  const tieRule = 'Tie broken by College Rank (lower rank number wins)';

  return [
    {
      category: 'MOST_SOLVED',
      title: 'Most Problems Solved',
      description: 'Leader in total solved LeetCode challenges across the entire college',
      student: topSolved
        ? {
            displayName: topSolved.displayName,
            leetcodeUsername: topSolved.leetcodeUsername,
            avatarUrl: topSolved.avatarUrl,
            collegeRank: topSolved.collegeRank < 999999 ? topSolved.collegeRank : null,
            value: topSolved.totalSolved,
            sublabel: `${topSolved.totalSolved} solved`,
          }
        : null,
      tieBreakerRule: tieRule,
    },
    {
      category: 'TOP_RATING',
      title: 'Top Contest Rating',
      description: 'Highest active contest rating among competitive programmers',
      student: topRating
        ? {
            displayName: topRating.displayName,
            leetcodeUsername: topRating.leetcodeUsername,
            avatarUrl: topRating.avatarUrl,
            collegeRank: topRating.collegeRank < 999999 ? topRating.collegeRank : null,
            value: Math.round(topRating.contestRating!),
            sublabel: `${Math.round(topRating.contestRating!)} rating`,
          }
        : null,
      tieBreakerRule: tieRule,
    },
    {
      category: 'MOST_HARD',
      title: 'Most Hard Solved',
      description: 'Highest mastery in advanced algorithms and complex problem solving',
      student: topHard
        ? {
            displayName: topHard.displayName,
            leetcodeUsername: topHard.leetcodeUsername,
            avatarUrl: topHard.avatarUrl,
            collegeRank: topHard.collegeRank < 999999 ? topHard.collegeRank : null,
            value: topHard.hardSolved,
            sublabel: `${topHard.hardSolved} hard solved`,
          }
        : null,
      tieBreakerRule: tieRule,
    },
  ];
}