import { describe, expect, it } from "vitest";
import { checkRateLimit, RATE_LIMIT } from "@/lib/domain/rateLimit";

describe("checkRateLimit", () => {
  it("allows three attempts and blocks the fourth within three seconds", () => {
    let timestamps: readonly number[] = [];
    for (const now of [0, 100, 200]) {
      const check = checkRateLimit(timestamps, now);
      expect(check.allowed).toBe(true);
      timestamps = check.timestamps;
    }

    const fourth = checkRateLimit(timestamps, 300);
    expect(fourth.allowed).toBe(false);
  });

  it("tells the Customer how long until the oldest attempt leaves the window", () => {
    const check = checkRateLimit([1000, 1100, 1200], 1500);

    expect(check).toMatchObject({ allowed: false, retryAfterMs: 2500 });
  });

  it("allows again at exactly the moment the oldest attempt leaves the window", () => {
    const history = [1000, 1100, 1200];

    expect(checkRateLimit(history, 3999).allowed).toBe(false);
    expect(checkRateLimit(history, 4000).allowed).toBe(true);
  });

  it("does not record a blocked attempt, so it never extends the wait", () => {
    const history = [0, 100, 200];

    const blocked = checkRateLimit(history, 2000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.timestamps).toEqual(history);
    // Still free to go as soon as the first attempt expires.
    expect(checkRateLimit(blocked.timestamps, 3000).allowed).toBe(true);
  });

  it("slides: old attempts stop counting one by one", () => {
    const history = [0, 1000, 2000];

    // At 3000 only the attempt at 0 has expired: one slot is free.
    const first = checkRateLimit(history, 3000);
    expect(first.allowed).toBe(true);
    expect(first.timestamps).toEqual([1000, 2000, 3000]);
    // Straight after, the window is full again.
    expect(checkRateLimit(first.timestamps, 3001).allowed).toBe(false);
  });

  it("does not mutate its input", () => {
    const history = Object.freeze([0, 100, 200]);
    expect(() => checkRateLimit(history, 5000)).not.toThrow();
    expect(history).toEqual([0, 100, 200]);
  });

  it("is three attempts per three seconds", () => {
    expect(RATE_LIMIT).toEqual({ limit: 3, windowMs: 3000 });
  });
});
