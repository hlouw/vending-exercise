import { initialSupply } from "@/lib/domain/coins";
import type { MachineState } from "@/lib/domain/types";

/**
 * The only way to touch machine state.
 *
 * `transact` runs `fn` against the current state and commits `next` in one
 * step. `fn` must be synchronous. A database-backed store would wrap the same
 * call in a real transaction, so callers would not change.
 */
export interface MachineStore {
  transact<T>(
    fn: (state: MachineState) => { result: T; next: MachineState },
  ): T;
  read(): MachineState;
}

export function createMemoryStore(): MachineStore {
  let state: MachineState = { supply: initialSupply(), cashBox: 0 };
  return {
    transact(fn) {
      const { result, next } = fn(state);
      state = next;
      return result;
    },
    read: () => state,
  };
}

const globalForStore = globalThis as unknown as { vendingStore?: MachineStore };

/** One store per server process, surviving dev hot reloads. */
export function getStore(): MachineStore {
  return (globalForStore.vendingStore ??= createMemoryStore());
}
