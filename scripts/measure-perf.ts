import "dotenv/config";
import { db } from "../src/lib/db";
import { getLeaderboardData } from "../src/server/services/leaderboard.service";
import { getGenderWarData } from "../src/server/services/gender-war.service";

async function run() {
  console.log("--- Performance Measurement ---");
  
  const t0 = Date.now();
  await db.$connect();
  const t1 = Date.now();
  console.log(`Prisma $connect(): ${t1 - t0}ms`);

  const t2 = Date.now();
  const count = await db.user.count();
  const t3 = Date.now();
  console.log(`db.user.count() [${count} users]: ${t3 - t2}ms`);

  const t4 = Date.now();
  const lbData = await getLeaderboardData({ page: 1, limit: 25 });
  const t5 = Date.now();
  console.log(`getLeaderboardData() [${lbData.students.length} rows returned of ${lbData.total}]: ${t5 - t4}ms`);

  const t6 = Date.now();
  const gwData = await getGenderWarData("ALL_TIME", null);
  const t7 = Date.now();
  console.log(`getGenderWarData() [Cold DB Cache Hit]: ${t7 - t6}ms`);

  const t8 = Date.now();
  const gwDataWarm = await getGenderWarData("ALL_TIME", null);
  const t9 = Date.now();
  console.log(`getGenderWarData() [Warm In-Memory Cache Hit]: ${t9 - t8}ms`);

  await db.$disconnect();
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
