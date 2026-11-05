import { describe, expect, it } from "vitest";
import { makeChange } from "@/lib/domain/change";
import {
  COINS,
  initialSupply,
  totalOf,
  type CoinCounts,
} from "@/lib/domain/coins";

function supplyOf(counts: Partial<CoinCounts>): CoinCounts {
  return Object.fromEntries(
    COINS.map((coin) => [coin, counts[coin] ?? 0]),
  ) as CoinCounts;
}

const countOf = (coins: Partial<CoinCounts>) =>
  Object.values(coins).reduce((sum, n) => sum + n, 0);

describe("makeChange", () => {
  it("gives no coins for no change", () => {
    expect(makeChange(0, initialSupply())).toEqual({});
  });

  it("uses the fewest coins from a full supply", () => {
    expect(makeChange(35, initialSupply())).toEqual({ 20: 1, 10: 1, 5: 1 });
    expect(makeChange(388, initialSupply())).toEqual({
      200: 1,
      100: 1,
      50: 1,
      20: 1,
      10: 1,
      5: 1,
      2: 1,
      1: 1,
    });
  });

  it("succeeds where greedy gets stuck", () => {
    // Greedy takes the 5p and has no 1p to finish. 2+2+2 works.
    const supply = supplyOf({ 5: 1, 2: 3 });
    expect(makeChange(6, supply)).toEqual({ 2: 3 });
  });

  it("only uses coins that are in stock", () => {
    const supply = supplyOf({ 20: 1, 5: 6 });
    expect(makeChange(30, supply)).toEqual({ 20: 1, 5: 2 });
    // Two 20p would be shorter but only one is held.
    expect(makeChange(40, supply)).toEqual({ 20: 1, 5: 4 });
  });

  it("copes without a denomination that has run out", () => {
    const supply = { ...initialSupply(), 20: 0 };
    expect(makeChange(40, supply)).toEqual({ 10: 4 });
  });

  it("returns null when the amount cannot be made", () => {
    expect(makeChange(1, supplyOf({ 2: 10 }))).toBeNull();
    expect(makeChange(7, supplyOf({ 5: 1, 2: 1 }))).not.toBeNull();
    expect(makeChange(8, supplyOf({ 5: 1, 2: 1 }))).toBeNull();
    expect(makeChange(1, supplyOf({}))).toBeNull();
  });

  it("returns null when the amount exceeds everything held", () => {
    // Full supply holds 10 * 388p = £38.80.
    expect(makeChange(3880, initialSupply())).not.toBeNull();
    expect(makeChange(3881, initialSupply())).toBeNull();
  });

  it("breaks ties towards larger coins", () => {
    // 4p: 2+2 (2 coins) is the only 2-coin answer; sanity check determinism.
    expect(makeChange(4, initialSupply())).toEqual({ 2: 2 });
    // 3p: 2+1 is the only minimal answer.
    expect(makeChange(3, initialSupply())).toEqual({ 2: 1, 1: 1 });
  });

  it("matches a brute-force search on small supplies", () => {
    // Exhaustively enumerate every selection of coins to find the true minimum.
    function bruteForce(amount: number, supply: CoinCounts): number | null {
      let best: number | null = null;
      const walk = (i: number, left: number, used: number) => {
        if (left === 0) {
          best = best === null ? used : Math.min(best, used);
          return;
        }
        if (i === COINS.length) return;
        for (let k = 0; k <= supply[COINS[i]] && k * COINS[i] <= left; k++) {
          walk(i + 1, left - k * COINS[i], used + k);
        }
      };
      walk(0, amount, 0);
      return best;
    }

    const randomInt = (n: number) => Math.floor(Math.random() * n);

    for (let trial = 0; trial < 150; trial++) {
      const supply = supplyOf(
        Object.fromEntries(COINS.map((coin) => [coin, randomInt(4)])),
      );
      const amount = randomInt(120);
      // On failure, these inputs are all you need to reproduce the case.
      const context = JSON.stringify({ amount, supply });
      const expected = bruteForce(amount, supply);
      const actual = makeChange(amount, supply);

      if (expected === null) {
        expect(actual, context).toBeNull();
      } else {
        expect(actual, context).not.toBeNull();
        expect(totalOf(actual!), context).toBe(amount);
        expect(countOf(actual!), context).toBe(expected);
        for (const coin of COINS) {
          expect(actual![coin] ?? 0, context).toBeLessThanOrEqual(supply[coin]);
        }
      }
    }
  });
});
