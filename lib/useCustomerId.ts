import { useSyncExternalStore } from "react";
import { getCustomerId, subscribeCustomerId } from "@/lib/identity";

/** The current Customer Identity, or "" while rendering on the server. */
export function useCustomerId(): string {
  return useSyncExternalStore(subscribeCustomerId, getCustomerId, () => "");
}
