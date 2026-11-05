import { COINS, type Coin, type CoinCounts } from "./coins";

/** Ascending, so the largest Coin is processed last and wins ties. */
const ASCENDING = [...COINS].reverse();

/**
 * The fewest Coins that add up to `amount`, using at most what `supply`
 * holds. Returns `null` when no combination works.
 *
 * Greedy is not enough: with a finite supply it can fail where a solution
 * exists. 6p from one 5p, three 2p and no 1p: greedy takes the 5p and is
 * stuck, but 2+2+2 works.
 *
 * Bounded-knapsack DP over the denominations. Among equally small answers it
 * prefers larger Coins, so the result is deterministic.
 */
export function makeChange(
  amount: number,
  supply: CoinCounts,
): Partial<CoinCounts> | null {
  if (amount === 0) return {};

  const INFEASIBLE = Number.POSITIVE_INFINITY;

  // best[a] = fewest coins for `a` using the denominations processed so far.
  let best = new Array<number>(amount + 1).fill(INFEASIBLE);
  best[0] = 0;

  // used[i][a] = how many of ASCENDING[i] the best answer for `a` uses.
  const used: Uint8Array[] = [];

  for (const coin of ASCENDING) {
    const next = new Array<number>(amount + 1).fill(INFEASIBLE);
    const chosen = new Uint8Array(amount + 1);
    const available = supply[coin];

    for (let a = 0; a <= amount; a++) {
      // Try the most of this Coin first; only a strictly better answer
      // replaces it, so ties keep the larger count of the larger Coin.
      for (let k = Math.min(available, Math.floor(a / coin)); k >= 0; k--) {
        const candidate = best[a - k * coin] + k;
        if (candidate < next[a]) {
          next[a] = candidate;
          chosen[a] = k;
        }
      }
    }

    best = next;
    used.push(chosen);
  }

  if (best[amount] === INFEASIBLE) return null;

  const change: Partial<Record<Coin, number>> = {};
  let remaining = amount;
  for (let i = ASCENDING.length - 1; i >= 0; i--) {
    const k = used[i][remaining];
    if (k > 0) change[ASCENDING[i]] = k;
    remaining -= k * ASCENDING[i];
  }
  return change;
}
