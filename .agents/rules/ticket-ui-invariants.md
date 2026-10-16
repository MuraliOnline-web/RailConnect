# Railway Ticket UI Invariants & State Protections

## 1. Empty Draft Protections
- Checkout and payment routes (e.g. `/dashboard/payment`) must explicitly handle empty states when navigated to without an active booking draft.
- Do not fabricate or silently fall back to mock journeys or arbitrary non-zero fares.
- Set base fare, category charges, convenience fee, and total to ₹0.00.
- Journey details must display neutral placeholders (e.g., `—`) with descriptive empty state helper text.
- Disable checkout and pay triggers until a valid booking draft is present.

## 2. Ticket Type Semantics
- **Journey Tickets**: Always display directional origin-to-destination routes (`FROM` station, railway icon/connector, `TO` station, station codes, category).
- **Platform Tickets**: Represent single-station admission, never a transit route. Never display `FROM`/`TO` directional labels or route arrows. Use dedicated station identification, person count, issue timestamp, ticket reference, and explicit duration constraints (e.g., "Valid for 2 hours only").

## 3. Card Grid Consistency
- Mixed ticket listings (Journey and Platform) sharing a responsive grid must maintain equal outer heights across each row.
- Use `h-full flex flex-col justify-between` on card containers and `items-stretch` on parent grid containers.
- Structure internal regions with flexible upper content and pinned lower meta/action sections (`mt-auto`) to ensure buttons and status badges align symmetrically across different card types.

## 4. Transaction and History List Rows
- **Three-Part Structure**:
  1. **Left**: Vertically centered circular orange icon (`bg-railway-gradient rounded-full text-white`) representing the record category (e.g. ticket or receipt). Never place rectangular/capsule badges inside the circle.
  2. **Centre**: Prominent title (`font-[Sora] font-bold`) with muted secondary metadata (`text-[10px] sm:text-[11px] uppercase tracking-wider`). Never fabricate `From → To` for Platform Tickets; use `Platform Ticket · <Station>`.
  3. **Right**: Fare/amount right-aligned (`font-[Sora] font-extrabold`) with the status badge positioned **directly beneath the amount**, aligned to the same right edge with a small vertical gap.
- **Status Badges**:
  - `Active`: Emerald border and green dot.
  - `Expired`: Red border, red dot, and light red background.
  - `Cancelled`: Rose border and rose dot.
- **Filter Tabs**:
  - Unselected tabs must maintain a visible neutral border (`border-stone-300`).
  - Selected tab must maintain a prominent orange border (`border-2 border-orange-500`) with count badges clearly legible in both states.

## 5. Journey Reminder Semantics & Scheduling Verification
- **Scheduled Departure Requirement**: Journey reminder notifications must trigger exclusively from genuine scheduled journey departure timestamps (`ticket.departureTime`), not ticket validity expiration (`ticket.validUntil`).
- **UTS Unreserved Ticket Handling**: Standard suburban UTS journey tickets do not carry a timetable departure time and only have booking validity (`validUntil`). If `ticket.departureTime` is absent or undefined, the ticket is ineligible for departure reminders and must never fabricate or substitute validity expiry as departure time.
- **Eligibility Criteria for Journey Reminders**:
  1. `ticket.status === "active"` (and `computeStatus(ticket) === "active"`).
  2. `ticket.type === "journey"` (platform and pass tickets excluded).
  3. `Boolean(ticket.departureTime) && new Date(ticket.departureTime).getTime() > Date.now()`.
  4. User notification preference `settings.notifications.journey === true`.
  5. Ticket ID has not already been recorded in the reminder sent registry (`railconnect.reminders.sent`).


