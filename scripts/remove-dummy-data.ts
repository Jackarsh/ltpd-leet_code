import { PrismaClient } from "@prisma/client";
import { recalculateAllCollegeRanks } from "../src/server/services/ranking.service";
import { recomputeAllGenderWarAggregates } from "../src/server/services/gender-war.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Scanning for dummy/demo student accounts...\n");

  const dummyEmails = [
    "student@college.edu",
    "top.solver@college.edu",
    "contest.queen@college.edu",
    "hard.grinder@college.edu",
    "consistency.king@college.edu",
    "rising.star@college.edu",
    "steady.performer@college.edu",
    "speed.demon@college.edu",
    "binary.baron@college.edu",
    "algo.artisan@college.edu",
    "graph.guru@college.edu",
    "fresh.starter@college.edu",
    "pending.student@college.edu",
  ];

  const found = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: dummyEmails } },
        { profile: { leetcodeUsername: "alex_coder" } },
      ],
    },
    include: {
      profile: true,
      codingAccounts: true,
    },
  });

  if (found.length === 0) {
    console.log("No dummy accounts found in the database. Clean state!");
    return;
  }

  console.log(`Found ${found.length} dummy account(s) to remove:`);
  for (const u of found) {
    console.log(` - ${u.email} (${u.profile?.displayName ?? "No profile"}, @${u.profile?.leetcodeUsername ?? "none"})`);
  }

  const ids = found.map((u) => u.id);

  // Delete dummy users (cascade will delete linked accounts, stats, submissions, and profiles)
  const deleted = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\n✅ Removed ${deleted.count} dummy user(s) from database.`);

  console.log("🔄 Recalculating college ranks and leaderboards...");
  await recalculateAllCollegeRanks();
  await recomputeAllGenderWarAggregates();

  console.log("\n📊 Active users remaining in database:");
  const remaining = await prisma.user.findMany({
    include: { profile: true, codingAccounts: true },
  });
  for (const u of remaining) {
    console.log(` • ${u.email} [${u.role}] — ${u.profile?.displayName ?? "No profile"} (Rank #${u.profile?.collegeRank ?? "—"})`);
  }

  console.log("\n🎉 Database is clean!");
}

main()
  .catch((e) => {
    console.error("Error cleaning dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
