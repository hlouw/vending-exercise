"use client";

import { useState } from "react";
import { Cluster } from "@/components/layout/Cluster";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { setCustomerId } from "@/lib/client/identity";
import { useCustomerId } from "@/lib/client/useCustomerId";

/** Shows who the machine thinks you are, and lets you become someone else. */
export function CustomerBadge() {
  const customerId = useCustomerId();

  // null means "not editing": show the real identity.
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  function save() {
    const saved = setCustomerId(draft ?? customerId);
    setInvalid(!saved);
    if (saved) setDraft(null);
  }

  return (
    <form
      className="w-full sm:w-auto"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft !== null) save();
      }}
    >
      <Cluster gap="sm" align="end" className="flex-nowrap">
        <label className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-none">
          {/* The error shares the label's line, so the page never jumps. */}
          <span className="flex justify-between gap-2 text-xs">
            <span className="text-muted">You are</span>
            {invalid && (
              <span id="customer-id-error" className="text-warning">
                Use 1–64 letters, numbers, - or _
              </span>
            )}
          </span>
          <Input
            value={draft ?? customerId}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "customer-id-error" : undefined}
            spellCheck={false}
            autoComplete="off"
            className="w-full py-1 font-mono text-xs sm:w-72"
          />
        </label>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={draft === null}
        >
          Switch
        </Button>
      </Cluster>
    </form>
  );
}
