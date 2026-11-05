# Vending machine

A Next.js vending machine with an API and a customer-facing interface. A Customer picks an Item, pays, and gets the fewest Coins possible back as Change, using only the Coins the machine still holds.

Terms (Customer, Purchase, Coin Supply, Cash Box, Refused, Rate Limited, …) are defined in [`GLOSSARY.md`](GLOSSARY.md). The original brief is in [`docs/EXERCISE.md`](docs/EXERCISE.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command                | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm test`             | Vitest: domain, schemas, route handlers        |
| `npm run lint`         | ESLint                                         |
| `npx tsc --noEmit`     | Type-check                                     |
| `npm run format`       | Prettier (with Tailwind class sorting)         |
| `npm run format:check` | Fail if anything is unformatted                |
| `npm run build`        | Production build                               |
| `npm start`            | Serve the production build (run `build` first) |

## The rules, as built

- The machine starts with ten of each Coin: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2. It is never refilled.
- Money a Customer pays goes into the **Cash Box**, which is never used for Change. The **Coin Supply** only ever decreases.
- Change is the fewest Coins possible from what is in the Coin Supply right now.
- A Purchase is **Refused** if the Amount Paid is below the Price (`INSUFFICIENT_PAYMENT`) or exact Change can't be made (`CANNOT_MAKE_CHANGE`). A Refusal leaves the Coin Supply and Cash Box exactly as they were.
- Each Customer may make three Purchase attempts per three seconds. The fourth is **Rate Limited** before the Price or Change are considered. Limits are per Customer.
- All money is integer pence. Price and Amount Paid must be whole pence from 1 to 10000 (£100).

## API

Both endpoints are JSON. Customer Identity travels in a request header, not the body, to mirror an authenticated request.

### `POST /api/purchase`

Headers: `X-Customer-Id: <id>`, where the id is 1–64 characters of letters, digits, `-` or `_`.

Body (unknown keys are rejected):

```json
{ "price": 65, "amountPaid": 100 }
```

| Status | When                                                       | Body                                                                                   |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 200    | Dispensed                                                  | `{ "status": "dispensed", "change": { "20": 1, "10": 1, "5": 1 }, "changeTotal": 35 }` |
| 400    | Body isn't valid JSON or fails validation                  | `{ "status": "invalid", "issues": ["…"] }`                                             |
| 401    | `X-Customer-Id` missing or invalid                         | `{ "status": "unauthorized" }`                                                         |
| 422    | Refused                                                    | `{ "status": "refused", "reason": "INSUFFICIENT_PAYMENT" \| "CANNOT_MAKE_CHANGE" }`    |
| 429    | Rate Limited. Header `Retry-After: <seconds>` (rounded up) | `{ "status": "rate_limited", "retryAfterMs": 2957 }`                                   |

`change` maps a Coin (in pence) to how many are handed back; it is empty for exact payment. Customers who are Refused keep their money.

### `GET /api/stock`

```json
{
  "supply": {
    "1": 10,
    "2": 10,
    "5": 9,
    "10": 9,
    "20": 9,
    "50": 10,
    "100": 10,
    "200": 10
  }
}
```

Only the Coin Supply. The Cash Box is never exposed.

```bash
curl -X POST localhost:3000/api/purchase \
  -H 'Content-Type: application/json' -H 'X-Customer-Id: alice' \
  -d '{"price":65,"amountPaid":100}'
```

### Order of checks

1. **Identity**: no valid `X-Customer-Id` gives 401. These requests are not counted.
2. **Rate limit**: over the limit gives 429. This runs before the body is even read, so a Customer who is over their limit is turned away without the Price or Change being looked at.
3. **Validation**: Zod checks the body (400).
4. **Domain rules**: Insufficient Payment, then making Change (422), otherwise Dispensed (200).

Every request that passes step 1 counts toward the limit, including malformed ones and ones that end up Refused. Rate Limited attempts are not recorded, so hammering the machine never extends the wait.

The rate limit is a **sliding window**: an attempt is blocked if three earlier attempts fall within the last 3000 ms, and an attempt exactly 3000 ms old has left the window.

## Making change

Greedy (always take the largest Coin that fits) is not enough once stock is finite. With one 5p, three 2p and no 1p, 6p of Change defeats greedy: it takes the 5p and is stuck with 1p to find. The answer is 2p + 2p + 2p.

So `makeChange` (`lib/domain/change.ts`) is a bounded minimum-coin dynamic programme over the eight denominations. It returns the fewest Coins within what is in stock, or `null` when the amount can't be made, which becomes `CANNOT_MAKE_CHANGE`. When several answers use the same number of Coins it prefers larger Coins, so results are deterministic.

The unit tests compare it against an exhaustive brute-force search on randomly generated small supplies.

## Design seams

The brief is a self-contained exercise, so storage and identity are deliberately simple, but each sits behind one small seam.

- **Store** (`lib/server/store.ts`): `MachineStore.transact(fn)` is the only way to change state. `fn` is synchronous, and it computes the next state and commits it in one step. The domain logic (`lib/domain/`) is pure, with no Zod, HTTP or storage. A database-backed store would wrap `transact` in a real transaction without callers changing. Note that the rate limiter and the purchase are two separate `transact` calls, which is fine because the limiter's record doesn't depend on the Purchase outcome.
- **Server identity** (`lib/server/resolveCustomer.ts`): the only place the server learns who a Customer is. Today it validates the `X-Customer-Id` header. A real login would read a session cookie or bearer token here.
- **Client identity** (`lib/client/identity.ts`): the only place the browser produces a Customer Identity. It generates a UUID, keeps it in `localStorage`, and lets you switch to another valid ID from the UI. A fake-login flow with user-selected IDs would replace this module and nothing else.
- **Validation**: Zod schemas in `lib/schemas.ts` are shared by client and server, and all external data is parsed with them (header, body, the stored client ID, and API responses on the client).
- **Time**: the limiter takes `now` as a parameter, so its tests need no fake timers. The route supplies `Date.now()`.

## Caveats

- **State is in memory.** Restarting the server resets the Coin Supply to ten of each Coin and forgets the Cash Box and rate-limit history. There is no refill or reset endpoint, as the brief says the machine is never refilled.
- **One process only.** State lives in a single Node process (kept on `globalThis` so dev hot-reloads don't reset it). Running several instances would give each its own machine.
- **Customer Identity is asserted, not verified.** Anyone can send any `X-Customer-Id`, so the per-Customer rate limit can be evaded by changing it. That is by design for this exercise. It is also why the UI lets you switch identity, to make the independent limits easy to demonstrate.
- **The Price comes from the client**, as the brief specifies. The server does no Item lookup, so the catalogue in the UI is presentation only.
- **Rate-limit memory is bounded loosely.** Once more than 1000 Customers are remembered, those whose newest attempt has left the window are dropped. It is a simple guard, not a complete defence against ID flooding.
- **No Cash Box view.** The sealed Cash Box is tracked and tested but not shown anywhere.

## How AI was used, and how it was checked

This was built with Claude Code. The process, in order:

1. **Requirements grilling** before any code: Item catalogue versus free-form price, integer pence, identity, the change algorithm, storage, rate-limit semantics, atomicity, testing and the response shape. The answers became `GLOSSARY.md` and a set of vertical-slice tickets.
2. **Seven small tickets**, each reviewed and committed separately: tooling, an exact-payment tracer bullet through every layer, change and Refusals, live stock, rate limiting, visual design, and this README.
3. **Review changed the design.** Examples: body validation moved into the route so `attemptPurchase` only deals with domain logic, the rate limiter moved to the route level, and the brute-force test uses `Math.random()` with the failing inputs in the assertion message.

What was verified, and how:

- **Automated**: 86 tests, plus type-check, lint, Prettier and `next build`. Refusals are tested to leave the Coin Supply and Cash Box untouched, the limiter is tested at its exact boundaries, and `makeChange` is checked against brute force.
- **Production build**: with Cache Components on, a `GET` that reads no request data is prerendered. Building `/api/stock` without `await connection()` showed it as static, which would serve frozen stock, so it opts out and the build shows it as dynamic.
- **Real server**: curl against `next start` for every status code, including a drained machine returning `CANNOT_MAKE_CHANGE`.
- **Real browser** (headless Chromium): selecting, paying, each outcome, rate limiting, switching identity, a keyboard-only purchase, reduced motion, and no horizontal overflow at phone width. That pass found two real bugs: a layout overflow at 375 px, and the coin animation ignoring reduced motion.
- **Not verified**: dark-mode appearance, browsers other than Chromium, and real screen-reader use.
- **Corrected along the way**: an early example of a case where greedy fails (30p) was wrong, since greedy handles it. The 6p case above is the real one.

## Layout

```
app/api/purchase, app/api/stock   thin route handlers
lib/domain/                       pure rules: coins, change, purchase, rate limit (shared)
lib/schemas.ts                    Zod schemas shared by client and server
lib/server/                       server-only (guarded by `import "server-only"`):
                                  store, vending, resolveCustomer
lib/client/                       browser-only: api, identity, useCustomerId
lib/*.ts                          small shared helpers: format, cn, catalogue, identity-header
components/layout/                Every Layout primitives: Stack, Cluster, Grid, Center, Sidebar, Box
components/ui/                    Button, Input, CoinChip (cva variants)
components/vending/               the machine itself
```

`lib/server/` modules import `server-only`, so importing one from a Client Component fails the build instead of silently shipping a second, private machine to the browser. `lib/client/` is organisational only; nothing is enforced there.
