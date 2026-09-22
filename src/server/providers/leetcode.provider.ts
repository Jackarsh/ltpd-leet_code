import {
  ICodingPlatformProvider,
  UserNotFoundError,
  RateLimitError,
  ProviderUnavailableError,
} from "./base.provider";
import {
  LEETCODE_GRAPHQL_ENDPOINT,
  USER_CHECK_QUERY,
  USER_STATS_QUERY,
} from "@/lib/leetcode-queries";
import { ParsedLeetCodeData } from "@/types/leetcode";
import { leetCodeRateLimiter } from "@/lib/rate-limiter";

export class LeetCodeProvider implements ICodingPlatformProvider {
  private inFlight = new Map<string, Promise<unknown>>();
  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 60 * 1000;

  private async executeGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const cacheKey = `${query.slice(0, 30)}:${JSON.stringify(variables)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey) as Promise<T>;
    }

    const promise = (async () => {
      await leetCodeRateLimiter.acquire();

      try {
        const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://leetcode.com",
          },
          body: JSON.stringify({ query, variables }),
          next: { revalidate: 0 },
        });

        if (response.status === 429) {
          leetCodeRateLimiter.trip(60);
          throw new RateLimitError(60);
        }

        if (!response.ok) {
          throw new ProviderUnavailableError(`HTTP error ${response.status} from LeetCode`);
        }

        const json = await response.json();

        if (json.errors && json.errors.length > 0) {
          const msg = json.errors[0]?.message || "Unknown GraphQL error";
          if (msg.includes("does not exist")) {
            throw new UserNotFoundError(String(variables.username));
          }
          throw new ProviderUnavailableError(msg);
        }

        const result = json.data as T;
        this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
        return result;
      } catch (err: unknown) {
        if (err instanceof UserNotFoundError || err instanceof RateLimitError || err instanceof ProviderUnavailableError) {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        throw new ProviderUnavailableError(message);
      } finally {
        this.inFlight.delete(cacheKey);
      }
    })();

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  public async validateUser(username: string): Promise<boolean> {
    interface CheckResult {
      matchedUser: {
        username: string;
      } | null;
    }

    try {
      const data = await this.executeGraphQL<CheckResult>(USER_CHECK_QUERY, { username });
      return !!data?.matchedUser?.username;
    } catch (err) {
      if (err instanceof UserNotFoundError) return false;
      throw err;
    }
  }

  public async fetchUserData(username: string): Promise<ParsedLeetCodeData> {
    interface StatsResult {
      matchedUser: {
        username: string;
        submitStatsGlobal?: {
          acSubmissionNum?: {
            difficulty: string;
            count: number;
            submissions: number;
          }[];
        };
        submissionCalendar?: string;
      } | null;
      userContestRanking?: {
        attendedContestsCount: number;
        rating: number;
        globalRanking: number;
        totalParticipants: number;
        topPercentage: number;
      } | null;
      recentAcSubmissionList?: {
        id: string;
        title: string;
        titleSlug: string;
        timestamp: string;
        statusDisplay: string;
        lang: string;
      }[];
    }

    const data = await this.executeGraphQL<StatsResult>(USER_STATS_QUERY, { username });

    if (!data?.matchedUser) {
      throw new UserNotFoundError(username);
    }

    const acList = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let totalSubmissions = 0;
    let totalAc = 0;

    for (const item of acList) {
      if (item.difficulty === "All") {
        totalSolved = item.count;
        totalAc = item.count;
        totalSubmissions = item.submissions;
      } else if (item.difficulty === "Easy") {
        easySolved = item.count;
      } else if (item.difficulty === "Medium") {
        mediumSolved = item.count;
      } else if (item.difficulty === "Hard") {
        hardSolved = item.count;
      }
    }

    const acceptanceRate = totalSubmissions > 0 ? (totalAc / totalSubmissions) * 100 : 0;

    // Parse submission calendar
    let submissionCalendar: Record<string, number> = {};
    if (data.matchedUser.submissionCalendar) {
      try {
        submissionCalendar = JSON.parse(data.matchedUser.submissionCalendar);
      } catch {
        submissionCalendar = {};
      }
    }

    // Parse recent submissions
    const recentSubmissions = (data.recentAcSubmissionList || []).map((sub) => ({
      title: sub.title,
      titleSlug: sub.titleSlug,
      timestamp: new Date(Number(sub.timestamp) * 1000),
      status: sub.statusDisplay,
      lang: sub.lang,
    }));

    return {
      username: data.matchedUser.username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      contestRating: data.userContestRanking?.rating ? Math.round(data.userContestRanking.rating) : null,
      globalContestRank: data.userContestRanking?.globalRanking ?? null,
      contestsAttended: data.userContestRanking?.attendedContestsCount ?? 0,
      submissionCalendar,
      recentSubmissions,
    };
  }
}

export const leetcodeProvider = new LeetCodeProvider();