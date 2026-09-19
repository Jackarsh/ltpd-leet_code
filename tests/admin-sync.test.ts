import test from "node:test";
import assert from "node:assert/strict";
import {
  SyncCircuitBreaker,
  categorizeSyncError,
  validateBatchConfirmation,
} from "../src/lib/sync-circuit-breaker.ts";

test("Sync Error Categorization — Maps messages to standard error categories (SC-607)", () => {
  // Rate limits
  assert.equal(categorizeSyncError("429 Too Many Requests"), "RATE_LIMITED");
  assert.equal(categorizeSyncError("LeetCode GraphQL API rate limit reached"), "RATE_LIMITED");
  assert.equal(categorizeSyncError("Request throttled by remote endpoint"), "RATE_LIMITED");

  // Username not found
  assert.equal(categorizeSyncError("User does not exist on LeetCode"), "USERNAME_NOT_FOUND");
  assert.equal(categorizeSyncError("404: Not Found username 'ghost'"), "USERNAME_NOT_FOUND");
  assert.equal(categorizeSyncError("Invalid username provided"), "USERNAME_NOT_FOUND");

  // Network timeouts
  assert.equal(categorizeSyncError("Connection timed out after 10000ms"), "NETWORK_TIMEOUT");
  assert.equal(categorizeSyncError("fetch failed with ETIMEDOUT"), "NETWORK_TIMEOUT");
  assert.equal(categorizeSyncError("ECONNRESET: Socket hung up"), "NETWORK_TIMEOUT");

  // Data parsing errors
  assert.equal(categorizeSyncError("SyntaxError: Unexpected token < in JSON at position 0"), "DATA_PARSING_ERROR");
  assert.equal(categorizeSyncError("GraphQL error: Failed to parse user profile structure"), "DATA_PARSING_ERROR");

  // Fallback
  assert.equal(categorizeSyncError("Unknown database deadlock occurred"), "OTHER");
  assert.equal(categorizeSyncError(null), "OTHER");
  assert.equal(categorizeSyncError(""), "OTHER");
});

test("Sync Circuit Breaker — Normal Operation & Trips on Consecutive Rate Limits (FR-613)", () => {
  const breaker = new SyncCircuitBreaker({ failureThreshold: 3, cooldownMs: 1000 });

  // Initial state is CLOSED
  assert.equal(breaker.getState(), "CLOSED");
  assert.equal(breaker.canExecute().allowed, true);

  // Normal non-rate-limit errors do NOT trip the breaker
  breaker.recordResult(false, "User does not exist");
  breaker.recordResult(false, "Network timeout");
  assert.equal(breaker.getState(), "CLOSED");
  assert.equal(breaker.canExecute().allowed, true);

  // Record rate limit errors up to threshold
  breaker.recordResult(false, "429 Too Many Requests");
  assert.equal(breaker.getState(), "CLOSED");
  breaker.recordResult(false, "Rate limit reached");
  assert.equal(breaker.getState(), "CLOSED");

  // 3rd rate limit trips the breaker to OPEN
  breaker.recordResult(false, "Throttled by LeetCode");
  assert.equal(breaker.getState(), "OPEN");

  // Execution must now be blocked
  const check = breaker.canExecute();
  assert.equal(check.allowed, false);
  assert.match(check.reason || "", /Circuit breaker is OPEN/);
  assert.ok(check.retryAfterMs !== undefined && check.retryAfterMs > 0);

  // Manual reset restores CLOSED state
  breaker.reset();
  assert.equal(breaker.getState(), "CLOSED");
  assert.equal(breaker.canExecute().allowed, true);
});

test("Sync Circuit Breaker — Auto-Recovery Transition to HALF_OPEN After Cooldown", async () => {
  const breaker = new SyncCircuitBreaker({ failureThreshold: 2, cooldownMs: 50 });

  breaker.recordResult(false, "429 Rate Limit");
  breaker.recordResult(false, "429 Rate Limit");
  assert.equal(breaker.getState(), "OPEN");

  // Wait for cooldown to expire
  await new Promise((resolve) => setTimeout(resolve, 60));

  // Should transition to HALF_OPEN
  assert.equal(breaker.getState(), "HALF_OPEN");

  // Successful execution recovers to CLOSED
  breaker.recordResult(true);
  assert.equal(breaker.getState(), "CLOSED");
  assert.equal(breaker.canExecute().allowed, true);
});

test("Step-Up Confirmation Validator — Enforces exact 'CONFIRM' text (SC-608)", () => {
  assert.equal(validateBatchConfirmation("CONFIRM"), true);
  assert.equal(validateBatchConfirmation("  CONFIRM  "), true);

  // Invalid attempts
  assert.equal(validateBatchConfirmation("confirm"), false);
  assert.equal(validateBatchConfirmation("yes"), false);
  assert.equal(validateBatchConfirmation("OK"), false);
  assert.equal(validateBatchConfirmation(""), false);
  assert.equal(validateBatchConfirmation(null), false);
  assert.equal(validateBatchConfirmation(undefined), false);
});
