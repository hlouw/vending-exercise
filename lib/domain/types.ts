import type { CoinCounts } from "./coins";

/** Everything the machine remembers. */
export interface MachineState {
  /** Coins available for giving Change. Only ever decreases. */
  supply: CoinCounts;
  /** Total pence inserted by Customers. Sealed: never used for Change. */
  cashBox: number;
}
