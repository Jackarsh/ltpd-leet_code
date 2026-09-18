import { db } from "@/lib/db";
import { recalculateAllCollegeRanks } from "@/server/services/ranking.service";
import bcrypt from "bcryptjs";

export async function seedLeaderboardData() {
  console.log("Seeding leaderboard test dataset...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Diverse test profiles covering all edge cases
  const mockStudents = [
    {
      email: "top.solver@college.edu",
      name: "Aarav Sharma",
      handle: "aarav_coder",
      branch: "CSE",
      admYear: 2021,
      gradYear: 2025,
      gender: "MALE" as const,
      easy: 180,
      med: 220,
      hard: 65,
      rating: 1850.5,
      rank: 4200,
      contests: 18,
      status: "ACTIVE" as const,
      syncStatus: "SUCCESS" as const,
      isStale: false,
    },
    {
      email: "contest.queen@college.edu",
      name: "Priya Patel",
      handle: "priya_algo",
      branch: "IT",
      admYear: 2022,
      gradYear: 2026,
      gender: "FEMALE" as const,
      easy: 120,
      med: 190,
      hard: 50,
      rating: 2150.0,
      rank: 1200,
      contests: 32,
      status: "ACTIVE" as const,
      syncStatus: "SUCCESS" as const,
      isStale: false,
    },
    {
      email: "hard.grinder@college.edu",
      name: "Rohan Verma",
      handle: "rohan_dp",
      branch: "ECE",
      admYear: 2021,
      gradYear: 2025,
      gender: "MALE" as const,
      easy: 90,
      med: 160,
      hard: 110,
      rating: 1720.0,
      rank: 8900,
      contests: 12,
      status: "ACTIVE" as const,
      syncStatus: "SUCCESS" as const,
      isStale: false,
    },
    {
      email: "unrated.ninja@college.edu",
      name: "Ananya Iyer",
      handle: "ananya_py",
      branch: "CSE",
      admYear: 2023,
      gradYear: 2027,
      gender: "FEMALE" as const,
      easy: 140,
      med: 80,
      hard: 15,
      rating: null,
      rank: null,
      contests: 0,
      status: "ACTIVE" as const,
      syncStatus: "SUCCESS" as const,
      isStale: false,
    },
    {
      email: "stale.coder@college.edu",
      name: "Vikram Malhotra",
      handle: "vikram_m",
      branch: "ME",
      admYear: 2020,
      gradYear: 2024,
      gender: "MALE" as const,
      easy: 60,
      med: 40,
      hard: 5,
      rating: 1450.0,
      rank: 35000,
      contests: 4,
      status: "ACTIVE" as const,
      syncStatus: "SUCCESS" as const,
      isStale: true,
    },
    {
      email: "pending.student@college.edu",
      name: "Neha Gupta",
      handle: "neha_new",
      branch: "AIDS",
      admYear: 2023,
      gradYear: 2027,
      gender: "FEMALE" as const,
      easy: 0,
      med: 0,
      hard: 0,
      rating: null,
      rank: null,
      contests: 0,
      status: "ACTIVE" as const,
      syncStatus: "PENDING" as const,
      isStale: false,
    },
    {
      email: "deactivated.user@college.edu",
      name: "Suspended User",
      handle: "suspended_guy",
      branch: "CSE",
      admYear: 2021,
      gradYear: 2025,
      gender: "MALE" as const,
      easy: 200,
      med: 200,
      hard: 100,
      rating: 2300.0,
      rank: 500,
      contests: 40,
      status: "DISABLED" as const,
      syncStatus: "SUCCESS" as const,
      isStale: false,
    },
  ];

  for (const s of mockStudents) {
    const user = await db.user.upsert({
      where: { email: s.email },
      create: {
        email: s.email,
        passwordHash,
        status: s.status,
        emailVerified: new Date(),
        profile: {
          create: {
            displayName: s.name,
            gender: s.gender,
            leetcodeUsername: s.handle,
            branch: s.branch,
            admissionYear: s.admYear,
            graduationYear: s.gradYear,
          },
        },
      },
      update: {
        status: s.status,
      },
      include: { profile: true },
    });

    const syncDate = s.isStale
      ? new Date(Date.now() - 48 * 60 * 60 * 1000) // 48h ago (stale)
      : new Date();

    const account = await db.linkedCodingAccount.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: "LEETCODE",
        },
      },
      create: {
        userId: user.id,
        platform: "LEETCODE",
        username: s.handle,
        isVerified: true,
        syncStatus: s.syncStatus,
        lastSyncAt: s.syncStatus === "SUCCESS" ? syncDate : null,
      },
      update: {
        username: s.handle,
        syncStatus: s.syncStatus,
        lastSyncAt: s.syncStatus === "SUCCESS" ? syncDate : null,
      },
    });

    if (s.syncStatus === "SUCCESS") {
      const total = s.easy + s.med + s.hard;
      await db.codingStatistics.upsert({
        where: { accountId: account.id },
        create: {
          accountId: account.id,
          totalSolved: total,
          easySolved: s.easy,
          mediumSolved: s.med,
          hardSolved: s.hard,
          contestRating: s.rating,
          globalContestRank: s.rank,
          contestsAttended: s.contests,
        },
        update: {
          totalSolved: total,
          easySolved: s.easy,
          mediumSolved: s.med,
          hardSolved: s.hard,
          contestRating: s.rating,
          globalContestRank: s.rank,
          contestsAttended: s.contests,
        },
      });
    }
  }

  console.log("Mock students created. Materializing college rankings...");
  const rankingResult = await recalculateAllCollegeRanks();
  console.log(`Ranked ${rankingResult.totalRanked} active students successfully.`);
}