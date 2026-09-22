import { seedLeaderboardData } from './src/server/scripts/seed-leaderboard';

seedLeaderboardData().then(() => {
    console.log("Done");
    process.exit(0);
}).catch((e) => {
    console.error(e);
    process.exit(1);
});
