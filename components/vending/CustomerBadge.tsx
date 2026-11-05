"use client";

import { useState } from "react";
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
      className="flex w-full flex-col gap-1 sm:w-auto lg:flex-row-reverse lg:items-center lg:gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft !== null) save();
      }}
    >
      <div className="flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
          <span className="text-xs whitespace-nowrap text-muted">You are</span>
          <Input
            value={draft ?? customerId}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "customer-id-error" : undefined}
            spellCheck={false}
            autoComplete="off"
            className="h-8 w-full min-w-0 py-0 font-mono text-xs sm:w-72"
          />
        </label>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={draft === null}
          className="h-8 py-0"
        >
          Switch
        </Button>
      </div>
      {/* Beside the input on large screens, so the page does not jump. Below it otherwise. */}
      {invalid && (
        <p id="customer-id-error" className="text-xs text-warning">
          Use 1–64 letters, numbers, - or _
        </p>
      )}
    </form>
  );
}
