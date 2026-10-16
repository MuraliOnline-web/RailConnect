# Storage Migration, Account Preference Isolation & Truthful Prototype Architecture

## 1. Zero Synthetic Business Data & Strict Provenance Matching
- Commuter business records (`railconnect.tickets`, `railconnect.txns`, `railconnect.wallet`, `railconnect.notifications`, `railconnect.journeyReminders`) must initialize empty (`[]`, `{}` or `0.00`).
- Synthetic record deletion must strictly match verified test provenance:
  - Known test account IDs: `a38af5bb-f198-47c4-97c9-a28550ebb12c`, `audit-user-guid-*`
  - Known test PNRs: `RCT7X6R7`, `RCAUDIT1`
  - Automated test runner patterns: `/^commuter\.\d+\.\d+@railconnect\.invalid$/`, `/^audit\.commuter\.\d+@railconnect\.invalid$/`, `demo@`, `test@demo`
- Do NOT delete accounts based on broad heuristics (e.g., missing plaintext passwords, missing hash fields, or unverified email domains).
- Cascade cleanup strictly to dependent business records referencing identified synthetic user IDs or PNRs.

## 2. Versioned Idempotent Storage Migrations
- Gated storage cleanup (e.g. `performTargetedStorageCleanup()`) must use a versioned sentinel key (`railconnect.storage.clean_v2`).
- The cleanup must execute exactly once on initial application boot and immediately record the sentinel flag.
- Subsequent launches and hard reloads must bypass cleanup to prevent resetting newly registered legitimate user data or active sessions.

## 3. Multi-Account Preference Isolation
- User settings must always be scoped by user ID: `railconnect.settings.user.<userId>`.
- Global settings (`railconnect.settings.v1`) serve strictly as defaults for unauthenticated users.
- Switching accounts must dynamically load the active user's preferences (language, theme, reduced motion, text scaling) and never mutate or overwrite another user's stored settings.

## 4. Truthful Prototype Architecture Over Fabricated Success
- **Ticketing & Railway Backend:** Booking screens must not claim ticket issuance without authoritative railway backend confirmation. Display clear prototype notices that tickets are client-side simulations.
- **Payment & Banking:** Payment screens must never claim a bank or payment gateway charged the user.
- **Abandoned Drafts:** In-flight checkout drafts in `sessionStorage.railconnect.paymentDraft` must be safely discarded upon abandonment without creating ghost tickets, transactions, or notifications.
- **Wallets & Refunds:** Balances, recharges, and refunds must disclose prototype simulation without claiming banking settlement.

## 5. Build, SSR & Routing Verification
- Always execute `npm run build` (deployment target) and `$env:NITRO_PRESET="node-server"; npm run build` (Node preview) sequentially to avoid competing file locks.
- Verify components using `<motion.div>` explicitly import `motion` from `framer-motion` to prevent SSR reference errors during pre-rendering.
- Validate all routes with real browser CDP automation in isolated profiles across direct navigation, hard reload (`Page.reload`), query parameter persistence, and authentication guards before deployment.
