# Glossary

**Customer**
Someone using the machine, distinguished from other customers only by their Customer Identity.

**Customer Identity**
The identifier a Customer presents with each Purchase. It is asserted by the Customer, not verified. The rate limit is tracked per Customer Identity.

**Item**
Something a Customer can buy from the machine. It has a name and a Price.

**Price**
The cost of an Item, in pence.

**Amount Paid**
The money a Customer hands over for one Purchase, in pence.

**Purchase**
One attempt by a Customer to buy an Item, given their Customer Identity, the Price and the Amount Paid. Every Purchase ends in exactly one Outcome.

**Outcome**
The result of a Purchase: Dispensed, Refused or Rate Limited.

**Dispensed**
An Outcome in which the Customer receives the Item and any Change.

**Refused**
An Outcome in which the Customer receives nothing and keeps their money. The Coin Supply is left exactly as it was. A Refusal has a reason: Insufficient Payment or Cannot Make Change.

**Insufficient Payment**
A Refusal reason: the Amount Paid is less than the Price.

**Cannot Make Change**
A Refusal reason: the Change owed cannot be made exactly from the coins in the Coin Supply.

**Rate Limited**
An Outcome in which the Customer was turned away because they had already made three Purchases in the last three seconds. It is decided before the Price or Change are considered.

**Change**
The coins handed back to a Customer when the Amount Paid exceeds the Price. It is the fewest coins possible, drawn only from the Coin Supply. Exact payment has no Change.

**Coin**
One of the eight standard UK denominations: 1p, 2p, 5p, 10p, 20p, 50p, £1 and £2.

**Coin Supply**
The Coins the machine holds for giving Change. It starts with ten of each Coin and is never refilled, so it only decreases.

**Cash Box**
The sealed store of money inserted by Customers. It is separate from the Coin Supply and is never used to make Change.
