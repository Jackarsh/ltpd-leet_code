import { ParsedLeetCodeData } from "@/types/leetcode";

export class UserNotFoundError extends Error {
  constructor(username: string) {
    super(`LeetCode user '${username}' not found or account is private.`);
    this.name = "UserNotFoundError";
  }
}

export class RateLimitError extends Error {
  public retryAfterSeconds: number;
  constructor(retryAfterSeconds = 60) {
    super(`Rate limit reached on coding platform API. Retry after ${retryAfterSeconds}s.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ProviderUnavailableError extends Error {
  constructor(reason: string) {
    super(`Coding platform provider is currently unavailable: ${reason}`);
    this.name = "ProviderUnavailableError";
  }
}

export interface ICodingPlatformProvider {
  validateUser(username: string): Promise<boolean>;
  fetchUserData(username: string): Promise<ParsedLeetCodeData>;
}