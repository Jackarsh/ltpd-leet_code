import type { RankingFormulaConfigDTO } from '@/types/leaderboard';

export const RANKING_CONFIG: RankingFormulaConfigDTO = {
  easyWeight: 1.0,
  mediumWeight: 3.0,
  hardWeight: 6.0,
  contestRatingWeight: 0.5,
  inactivityThresholdDays: 30,
  staleThresholdHours: 24,
  tieBreakingSequence: [
    '1. Highest Weighted Overall Score (descending)',
    '2. Most Hard Problems Solved (descending)',
    '3. Most Medium Problems Solved (descending)',
    '4. Most Easy Problems Solved (descending)',
    '5. Highest Contest Rating (descending; unrated treated as 0)',
    '6. Display Name (alphabetical ascending)',
  ],
};

export function calculateWeightedScore(
  easySolved: number,
  mediumSolved: number,
  hardSolved: number,
  contestRating: number | null | undefined
): {
  totalWeightedScore: number;
  easyContribution: number;
  mediumContribution: number;
  hardContribution: number;
  contestRatingContribution: number;
} {
  const easyContribution = easySolved * RANKING_CONFIG.easyWeight;
  const mediumContribution = mediumSolved * RANKING_CONFIG.mediumWeight;
  const hardContribution = hardSolved * RANKING_CONFIG.hardWeight;
  const ratingVal = typeof contestRating === 'number' && contestRating > 0 ? contestRating : 0;
  const contestRatingContribution = ratingVal * RANKING_CONFIG.contestRatingWeight;

  const totalWeightedScore = Number(
    (easyContribution + mediumContribution + hardContribution + contestRatingContribution).toFixed(2)
  );

  return {
    totalWeightedScore,
    easyContribution,
    mediumContribution,
    hardContribution,
    contestRatingContribution,
  };
}