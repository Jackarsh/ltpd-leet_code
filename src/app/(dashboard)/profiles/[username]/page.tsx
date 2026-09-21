import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicStudentProfile } from "@/server/services/profile.service";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DifficultyDonutChart } from "@/components/profile/DifficultyDonutChart";
import { ContestPerformanceCard } from "@/components/profile/ContestPerformanceCard";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { AchievementGallery } from "@/components/profile/AchievementGallery";
import { RecentActivityFeed } from "@/components/profile/RecentActivityFeed";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return {
    title: `${username} — Student Coding Profile | CodeRank`,
    description: `View ${username}'s collegiate coding statistics, verified LeetCode progress, and achievements.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();

  const profile = await getPublicStudentProfile(username, session?.user?.id);
  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Student Identity Header */}
      <ProfileHeader profile={profile} />

      {/* Coding & Contest Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DifficultyDonutChart stats={profile.stats} isSynced={profile.isSynced} />
        <ContestPerformanceCard contest={profile.contest} isSynced={profile.isSynced} />
      </div>

      {/* 12-Month Activity Heatmap with 6 Metrics (FR-314, FR-317) */}
      <ActivityHeatmap days={profile.heatmap.days} metrics={profile.heatmap.metrics} />

      {/* Achievements Showcase (FR-332, FR-333, FR-334) */}
      <AchievementGallery
        achievements={profile.achievements}
        lockedAchievements={profile.lockedAchievements}
      />

      {/* Recent Verified Activity Feed (FR-319, FR-320, FR-321) */}
      <RecentActivityFeed feed={profile.feed} />
    </div>
  );
}