import { CustomerIdSchema } from "@/lib/schemas";

const STORAGE_KEY = "vending.customerId";

const listeners = new Set<() => void>();

/**
 * The only place a Customer Identity is produced on the client. A future
 * fake-login would replace this module's body (for example with a
 * user-selected ID) and nothing else.
 *
 * Browser only: call from event handlers or effects, never during server
 * render. Use `useCustomerId` to read it in a component.
 */
export function getCustomerId(): string {
  const stored = CustomerIdSchema.safeParse(
    window.localStorage.getItem(STORAGE_KEY),
  );
  if (stored.success) return stored.data;

  const generated = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}

/** Switch identity. Anything the server would reject is refused here too. */
export function setCustomerId(
  candidate: string,
): { ok: true } | { ok: false; error: string } {
  const parsed = CustomerIdSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  window.localStorage.setItem(STORAGE_KEY, parsed.data);
  listeners.forEach((listener) => listener());
  return { ok: true };
}

/** For `useSyncExternalStore`. Also follows changes made in other tabs. */
export function subscribeCustomerId(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
