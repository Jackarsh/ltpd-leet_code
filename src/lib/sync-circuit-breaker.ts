/**
 * Sync Circuit Breaker & Error Categorization Utility (FR-613, SC-607)
 *
 * Protects against external LeetCode API throttling and categorizes sync failures.
 */

export type SyncErrorCategory =
  | "USERNAME_NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_TIMEOUT"
  | "DATA_PARSING_ERROR"
  | "OTHER";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number; // e.g. 5 rate-limit errors
  cooldownMs: number; // e.g. 60,000 ms (1 minute)
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  cooldownMs: 60 * 1000,
};

export class SyncCircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private consecutiveRateLimits: number = 0;
  private lastTrippedAt: number | null = null;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Returns current state, auto-recovering to HALF_OPEN if cooldown has elapsed.
   */
  getState(): CircuitBreakerState {
    if (this.state === "OPEN" && this.lastTrippedAt) {
      if (Date.now() - this.lastTrippedAt >= this.config.cooldownMs) {
        this.state = "HALF_OPEN";
      }
    }
    return this.state;
  }

  /**
   * Checks if an execution is allowed.
   */
  canExecute(): { allowed: boolean; reason?: string; retryAfterMs?: number } {
    const currentState = this.getState();
    if (currentState === "OPEN") {
      const remainingMs = Math.max(
        0,
        this.config.cooldownMs - (Date.now() - (this.lastTrippedAt || 0))
      );
      return {
        allowed: false,
        reason: `Circuit breaker is OPEN due to repeated rate limiting. Cooldown active.`,
        retryAfterMs: remainingMs,
      };
    }
    return { allowed: true };
  }

  /**
   * Records a sync result and adjusts circuit breaker state.
   */
  recordResult(success: boolean, error?: string): void {
    if (success) {
      this.consecutiveRateLimits = 0;
      this.state = "CLOSED";
      this.lastTrippedAt = null;
      return;
    }

    const category = categorizeSyncError(error);
    if (category === "RATE_LIMITED") {
      this.consecutiveRateLimits++;
      if (this.consecutiveRateLimits >= this.config.failureThreshold) {
        this.state = "OPEN";
        this.lastTrippedAt = Date.now();
      }
    }
  }

  /**
   * Manually resets the circuit breaker.
   */
  reset(): void {
    this.state = "CLOSED";
    this.consecutiveRateLimits = 0;
    this.lastTrippedAt = null;
  }

  getMetrics() {
    return {
      state: this.getState(),
      consecutiveRateLimits: this.consecutiveRateLimits,
      lastTrippedAt: this.lastTrippedAt ? new Date(this.lastTrippedAt).toISOString() : null,
      cooldownMs: this.config.cooldownMs,
    };
  }
}

/**
 * Singleton circuit breaker instance for the application runtime.
 */
export const globalSyncCircuitBreaker = new SyncCircuitBreaker();

/**
 * Categorizes an error message into a standardized sync error category (SC-607).
 */
export function categorizeSyncError(error?: string | null): SyncErrorCategory {
  if (!error) return "OTHER";
  const lower = error.toLowerCase();

  if (
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("too many requests") ||
    lower.includes("throttled")
  ) {
    return "RATE_LIMITED";
  }

  if (
    lower.includes("not found") ||
    lower.includes("does not exist") ||
    lower.includes("user not found") ||
    lower.includes("404") ||
    lower.includes("invalid username")
  ) {
    return "USERNAME_NOT_FOUND";
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("network") ||
    lower.includes("fetch failed")
  ) {
    return "NETWORK_TIMEOUT";
  }

  if (
    lower.includes("json") ||
    lower.includes("parse") ||
    lower.includes("syntaxerror") ||
    lower.includes("unexpected token") ||
    lower.includes("graphql error")
  ) {
    return "DATA_PARSING_ERROR";
  }

  return "OTHER";
}

/**
 * Validates step-up confirmation text for batch platform operations (SC-608).
 */
export function validateBatchConfirmation(text?: string | null): boolean {
  return typeof text === "string" && text.trim() === "CONFIRM";
}
