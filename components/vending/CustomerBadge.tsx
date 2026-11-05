"use client";

import { useState } from "react";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { setCustomerId } from "@/lib/identity";
import { useCustomerId } from "@/lib/useCustomerId";

/** Shows who the machine thinks you are, and lets you become someone else. */
export function CustomerBadge() {
  const customerId = useCustomerId();

  // null means "not editing": show the real identity.
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    const result = setCustomerId(draft ?? customerId);
    if (result.ok) {
      setDraft(null);
      setError(null);
    } else {
      setError(result.error);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (draft !== null) save();
      }}
    >
      <Stack gap="sm">
        <Cluster gap="sm" align="end">
          <label className="flex flex-col gap-1">
            <span className="text-sm">You are</span>
            <Input
              value={draft ?? customerId}
              onChange={(e) => setDraft(e.target.value)}
              aria-invalid={error !== null}
              aria-describedby={error ? "customer-id-error" : undefined}
              spellCheck={false}
              autoComplete="off"
              className="w-72 max-w-full font-mono text-sm"
            />
          </label>
          <Button type="submit" variant="coin" disabled={draft === null}>
            Switch
          </Button>
        </Cluster>
        {error && (
          <p id="customer-id-error" className="text-sm text-amber-300">
            {error}
          </p>
        )}
      </Stack>
    </form>
  );
}
