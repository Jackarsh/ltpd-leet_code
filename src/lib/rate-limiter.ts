// Simple resilient rate-limiter and circuit-breaker for external coding platform calls

class CircuitBreaker {
  private isTripped = false;
  private tripUntil: Date | null = null;
  private lastRequestTime = 0;
  private minIntervalMs = 250; // Max 4 requests / second

  public async acquire(): Promise<void> {
    const now = Date.now();

    // Check circuit breaker
    if (this.isTripped && this.tripUntil) {
      if (now < this.tripUntil.getTime()) {
        const remaining = Math.ceil((this.tripUntil.getTime() - now) / 1000);
        throw new Error(`Circuit breaker open. External API rate limited. Try again in ${remaining}s.`);
      } else {
        // Reset circuit
        this.isTripped = false;
        this.tripUntil = null;
      }
    }

    // Token rate pacing
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  public trip(retryAfterSeconds = 60): void {
    this.isTripped = true;
    this.tripUntil = new Date(Date.now() + retryAfterSeconds * 1000);
  }

  public reset(): void {
    this.isTripped = false;
    this.tripUntil = null;
  }
}

export const leetCodeRateLimiter = new CircuitBreaker();