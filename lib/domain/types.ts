import type { CoinCounts } from "./coins";

/** Everything the machine remembers. */
export interface MachineState {
  /** Coins available for giving Change. Only ever decreases. */
  supply: CoinCounts;
  /** Total pence inserted by Customers. Sealed: never used for Change. */
  cashBox: number;
  /**
   * When each Customer's recent Purchase attempts happened, in ms. A Map, not
   * an object, because Customer Identity is client-supplied and names like
   * `__proto__` or `constructor` must be ordinary keys.
   */
  attempts: ReadonlyMap<string, readonly number[]>;
}
