Build a working vending machine application using Next.js, including its API and customer-facing interface, in your preferred development environment.

A customer pays for an item, and the machine works out the change. It hands back the fewest coins possible, using only the coins it currently holds.

The machine starts loaded with ten of each standard UK coin: 1p, 2p, 5p, 10p, 20p, 50p, £1 (100p), and £2 (200p). It is never refilled. Money inserted by customers goes into a separate, sealed cash box rather than into the supply available for change. That supply only decreases, and once a denomination runs out, the machine must manage without it. Sometimes it simply cannot make the change.

For each purchase, the customer provides their identity, the item's price, and the amount paid. A successful purchase dispenses the item and the appropriate change. Exact payment requires no change. Reject a purchase if the payment is insufficient or exact change cannot be made. A refused purchase must leave the coin supply unchanged, and the customer keeps their money.

Each customer is allowed at most three purchases per three seconds. Beyond that, turn them away before checking the price or calculating change. Each customer's limit is independent of everyone else’s.

Make the machine work, and make it look like something someone would want to use. The interface must let a customer complete a purchase, see the item's price and the amount they are paying, and understand the outcome. Show which coins they receive as change, or why a purchase was refused. The visual design and interaction are yours to decide.

You may use an AI assistant. We use them daily and would rather see how you work with your tools than without them. You are responsible for understanding and verifying the solution you submit.
