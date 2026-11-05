export interface RateLimit {
  /** Most attempts allowed within any `windowMs`. */
  limit: number;
  windowMs: number;
}

/** At most three Purchases per three seconds, per Customer. */
export const RATE_LIMIT: RateLimit = { limit: 3, windowMs: 3000 };

export type RateLimitCheck =
  | { allowed: true; timestamps: number[] }
  | { allowed: false; timestamps: number[]; retryAfterMs: number };

/**
 * Sliding window: an attempt is allowed unless `limit` attempts already fall
 * within the last `windowMs`. An attempt exactly `windowMs` old has left the
 * window.
 *
 * `timestamps` are the allowed attempts so far. The returned `timestamps`
 * are what to remember: an allowed attempt is recorded, a blocked one is not,
 * so being turned away never extends the wait.
 */
export function checkRateLimit(
  timestamps: readonly number[],
  now: number,
  { limit, windowMs }: RateLimit = RATE_LIMIT,
): RateLimitCheck {
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    // The oldest allowed attempt in the window is the first to leave it.
    return {
      allowed: false,
      timestamps: recent,
      retryAfterMs: recent[0] + windowMs - now,
    };
  }
  return { allowed: true, timestamps: [...recent, now] };
}
