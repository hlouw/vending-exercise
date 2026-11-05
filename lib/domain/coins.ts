/** Standard UK coin denominations, in pence, largest first. */
export const COINS = [200, 100, 50, 20, 10, 5, 2, 1] as const;

export type Coin = (typeof COINS)[number];

/** How many of each Coin. */
export type CoinCounts = Record<Coin, number>;

export const COINS_PER_DENOMINATION = 10;

export function initialSupply(): CoinCounts {
  return Object.fromEntries(
    COINS.map((coin) => [coin, COINS_PER_DENOMINATION]),
  ) as CoinCounts;
}
