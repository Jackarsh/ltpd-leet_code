export interface DefaultAchievementDef {
  name: string;
  slug: string;
  description: string;
  category: 'PROBLEM_SOLVING' | 'CONTESTS' | 'CONSISTENCY';
  iconKey: string;
  conditionExpression: string;
  conditionText: string;
  rarityLevel: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
}

export const DEFAULT_ACHIEVEMENTS: DefaultAchievementDef[] = [
  // Problem Solving
  {
    name: "Centurion",
    slug: "centurion",
    description: "Solve 100 or more LeetCode problems",
    category: "PROBLEM_SOLVING",
    iconKey: "target",
    conditionExpression: "total_solved >= 100",
    conditionText: "Solve at least 100 LeetCode problems",
    rarityLevel: "COMMON",
    points: 10,
  },
  {
    name: "Half Grand",
    slug: "half-grand",
    description: "Solve 500 or more LeetCode problems",
    category: "PROBLEM_SOLVING",
    iconKey: "award",
    conditionExpression: "total_solved >= 500",
    conditionText: "Solve at least 500 LeetCode problems",
    rarityLevel: "EPIC",
    points: 50,
  },
  {
    name: "Hardcore Specialist",
    slug: "hardcore-specialist",
    description: "Solve 10 or more Hard difficulty problems",
    category: "PROBLEM_SOLVING",
    iconKey: "flame",
    conditionExpression: "hard_solved >= 10",
    conditionText: "Conquer at least 10 Hard difficulty problems",
    rarityLevel: "RARE",
    points: 25,
  },
  {
    name: "Master of Algorithms",
    slug: "master-of-algorithms",
    description: "Solve 50 or more Hard difficulty problems",
    category: "PROBLEM_SOLVING",
    iconKey: "crown",
    conditionExpression: "hard_solved >= 50",
    conditionText: "Conquer at least 50 Hard difficulty problems",
    rarityLevel: "LEGENDARY",
    points: 100,
  },

  // Contests
  {
    name: "Contest Initiate",
    slug: "contest-initiate",
    description: "Participate in your first LeetCode contest",
    category: "CONTESTS",
    iconKey: "zap",
    conditionExpression: "contests_attended >= 1",
    conditionText: "Compete in at least 1 live LeetCode contest",
    rarityLevel: "COMMON",
    points: 10,
  },
  {
    name: "Contest Veteran",
    slug: "contest-veteran",
    description: "Participate in 10 or more LeetCode contests",
    category: "CONTESTS",
    iconKey: "trophy",
    conditionExpression: "contests_attended >= 10",
    conditionText: "Compete in 10 or more live contests",
    rarityLevel: "RARE",
    points: 30,
  },
  {
    name: "Knight Errant",
    slug: "knight-errant",
    description: "Achieve a confirmed contest rating of 1600 or higher",
    category: "CONTESTS",
    iconKey: "shield",
    conditionExpression: "contest_rating >= 1600",
    conditionText: "Reach a verified contest rating of 1600+",
    rarityLevel: "RARE",
    points: 40,
  },
  {
    name: "Collegiate Grandmaster",
    slug: "collegiate-grandmaster",
    description: "Achieve a confirmed contest rating of 1900 or higher",
    category: "CONTESTS",
    iconKey: "sparkles",
    conditionExpression: "contest_rating >= 1900",
    conditionText: "Reach a verified contest rating of 1900+",
    rarityLevel: "LEGENDARY",
    points: 100,
  },

  // Consistency & Streak
  {
    name: "Weekly Devotion",
    slug: "weekly-devotion",
    description: "Maintain an active daily submission streak of 7 days",
    category: "CONSISTENCY",
    iconKey: "calendar",
    conditionExpression: "current_streak >= 7",
    conditionText: "Maintain an active 7-day solve streak",
    rarityLevel: "COMMON",
    points: 15,
  },
  {
    name: "Monthly Warrior",
    slug: "monthly-warrior",
    description: "Maintain an active daily submission streak of 30 days",
    category: "CONSISTENCY",
    iconKey: "activity",
    conditionExpression: "current_streak >= 30",
    conditionText: "Maintain an active 30-day solve streak",
    rarityLevel: "EPIC",
    points: 60,
  },
  {
    name: "Iron Endurance",
    slug: "iron-endurance",
    description: "Achieve an all-time longest streak of 50 consecutive days",
    category: "CONSISTENCY",
    iconKey: "flame",
    conditionExpression: "longest_streak >= 50",
    conditionText: "Reach a historic 50-day consecutive solve streak",
    rarityLevel: "LEGENDARY",
    points: 100,
  },
];