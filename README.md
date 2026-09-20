# RailConnect

## Overview

RailConnect is a modern, mobile-first railway ticketing frontend inspired by commuter/unreserved railway ticketing workflows.

**IMPORTANT NOTE:** RailConnect is currently a frontend-focused project. It is **not** the official Indian Railways, IRCTC, UTS, or RailOne application. There is currently no backend, real production API, real payment processing, or railway verification integration. All current data, authentication, and logic are simulated purely through frontend state and routing.

---

## Current Project Status

- Frontend application is implemented.
- Major booking/ticket/payment/dashboard flows are implemented.
- Data currently uses client-side localStorage/sessionStorage.
- Real backend persistence is not yet connected.
- Real payment gateway integration is not yet connected.
- Real railway/QR verification APIs are not yet connected.
- The current application is suitable as a frontend/demo/portfolio implementation.
- Production deployment with real users requires backend/API/auth/payment infrastructure.

---

## Tech Stack

The project relies on a modern React ecosystem:

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Lucide React / React Icons
- jsPDF
- React Hook Form
- Zod
- Recharts
- Sonner
- date-fns
- Nitro
- ESLint
- Prettier
- npm/Bun support

---

## Project Structure

Frontend/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── components.json
├── .gitignore
└── ...

---

## Application Routes

Public Routes:
/
/why
/network
/about
/login
/register

Dashboard Routes:
/dashboard
/dashboard/book
/dashboard/journey
/dashboard/platform
/dashboard/payment
/dashboard/payment-success
/dashboard/tickets
/dashboard/ticket
/dashboard/qr
/dashboard/wallet
/dashboard/wallet-recharge-success
/dashboard/transactions
/dashboard/refunds
/dashboard/refund-success
/dashboard/history
/dashboard/favorites
/dashboard/notifications
/dashboard/profile
/dashboard/settings

---

# Core Features

## Authentication

- Login
- Registration
- OTP-style frontend flow where implemented
- Protected dashboard routes
- Local client-side authentication state
- localStorage persistence
- Current limitation: no production authentication backend

---

## Dashboard

- Sidebar navigation
- Responsive mobile drawer
- Overlay
- Body scroll locking
- Independent sidebar scrolling
- Dashboard quick actions
- Recent routes
- Favorites
- Notifications
- Wallet summary
- Ticket summary

*Note: Mobile navigation was specifically hardened to prevent background scrolling.*

---

# Journey Ticket

- Station search/autocomplete
- FROM / TO station selection
- Passenger counts
- Adult/child support
- Class selection
- Train category
- Journey/season ticket support
- Fare calculation
- Book & Travel / QR workflow where implemented
- Book & Print / PDF workflow where implemented
- Payment handoff
- Book Again support

*Note: The passenger counters use the intentionally approved static 1px black border.*

---

# Platform Ticket

- Station search
- Empty/default state
- Adults and children
- State-driven fare calculation
- Summary remains neutral until station selection
- Confirm & Pay disabled until required data is available
- Payment handoff
- Static 1px black counter borders

---

# Payment

Supported simulated payment methods:
- Google Pay
- PhonePe
- Paytm
- BHIM UPI
- RailConnect Wallet
- Credit Card
- Debit Card
- Net Banking

Payment method IDs are normalized into human-readable labels when displayed on tickets/PDFs. Note: There is no real payment gateway processing.

---

# Ticket Data Model

Important fields included in the Ticket model:
- id
- userId
- type
- from
- to
- line
- classType
- adults
- children
- fare
- createdAt
- validUntil
- status
- pnr
- delivery
- category
- fromCode
- toCode
- txnId
- paymentMethod
- cancellation/refund information

Optional enriched ticket metadata where currently implemented:
- via
- distanceKm
- journeyType
- validityRule

Optional fields are rendered only when real ticket data contains them. Railway information is never fabricated.

---

# My Tickets

- Active Tickets
- Expired Tickets
- Cancelled Tickets
- Search
- Debounced search
- Station/PNR/Transaction ID matching
- Train category filtering
- Ticket type filtering
- Date filtering
- Ticket Details navigation
- Book Again

---

# Ticket Details

- Complete ticket information
- QR access
- Download PDF
- Book Again
- Cancellation
- Refund information
- Payment information
- Transaction ID
- Ticket reference
- Status

*Architectural rule: Ticket cancellation is centralized through Ticket Details. QR Ticket does NOT duplicate cancellation/refund/wallet/transaction business logic.*

---

# QR Ticket

The QR Ticket provides a premium, responsive presentation:
- Premium responsive QR ticket presentation
- Active ticket state
- Empty state
- QR code hero
- Ticket ID
- Ticket Reference
- Transaction ID
- Journey information
- station codes where available
- Via where available
- Distance where available
- Journey Type where available
- passenger information
- ticket details
- payment method
- total fare
- booked time
- validity
- journey validity where available
- railway-style journey connector
- responsive mobile layout
- desktop/tablet two-column information sets
- equal-height two-set layout on wider screens
- mobile stacking
- three desktop actions: Download Ticket, Book Again, Cancel Ticket

QR verification presentation:
SCAN TO VERIFY
Show this QR code for ticket verification.

The current QR presentation is a frontend representation. Real verification remains a backend integration task. (No real backend verification, fake countdowns, or QR regeneration).

---

# Empty QR State

When no ticket is active, the exact empty state reads:

No Active Ticket
Your active QR ticket will appear here after booking.

---

# PDF Ticket

The PDF Ticket implementation features:
- jsPDF
- A4-style professional ticket layout
- RailConnect branding
- Digital Railway Ticket title
- Ticket Reference
- Transaction ID
- QR section
- ACTIVE status
- SCAN TO VERIFY
- Journey section
- Passenger section
- Ticket Details
- Booking Details
- Journey Validity where available
- Payment Method
- Total Fare
- responsive/dynamic content positioning
- optional fields omitted when unavailable
- same Ticket object as QR Ticket

*QR Ticket and PDF Ticket use the same Ticket data source to maintain information parity.*

---

# Cancellation & Refund

- centralized cancellation
- cancellation status
- cancelledAt
- refund calculation
- refund percentage
- cancellation charge
- refund amount
- refund transaction reference
- wallet/transaction integration

(Does not claim real bank/payment-provider refunds.)

---

# Wallet

- balance
- recharge
- transaction history
- ticket spending
- refunds
- payment methods
- recharge validation
- local persistence

---

# Transactions

Booking, recharge, and refund transaction records and payment method presentation.

---

# Favorites

- saved station pairs
- Manage
- Book Again
- navigation into Journey Ticket
- FROM/TO prefill

---

# Booking History

Completed/previous booking visibility where implemented.

---

# Notifications

Local in-app notifications and booking-related notifications.

---

# Profile & Settings

Frontend profile/settings shell (frontend-only settings).

---

# UI / UX Design System

- mobile-first responsive design
- premium railway-inspired visual language
- orange railway accent
- glass cards
- Sora headings
- Inter body/UI text
- shadcn/ui
- Tailwind CSS v4
- Lucide/React Icons
- Framer Motion

Protected UI decisions:
1. Master Ticket alignment is frozen.
2. Do not disturb the approved Master Ticket layout.
3. Search boxes must NOT have travelling-border animations.
4. Passenger counters use static 1px black borders.
5. Dashboard mobile drawer uses scroll locking and an opaque drawer.
6. Avoid unnecessary animation.
7. Keep visual hierarchy clean and production-oriented.

---

# Responsive Behavior

- Mobile
- Tablet
- Desktop
- responsive dashboard sidebar
- mobile drawer
- QR card stacking
- ticket information stacking
- action button behavior
- journey/platform layouts
- equal-height desktop information sets where applicable

---

# Data Persistence

Exact storage architecture:

localStorage:
- railconnect.auth.user
- railconnect.auth.users
- railconnect.tickets
- railconnect.wallet
- railconnect.txns
- railconnect.notifications
- railconnect.favorites

sessionStorage:
- railconnect.paymentDraft
- railconnect.lastReceipt

This is a frontend/demo persistence architecture.

---

# PDF / QR Data Integrity

The QR Ticket, Ticket Details, My Tickets, Transactions and generated PDF are designed to consume the same Ticket/payment state rather than maintaining separate duplicated ticket records.

---

# Production Limitations / Future Backend

- real authentication API
- database persistence
- real railway station/train APIs
- real payment gateway
- server-side ticket issuance
- secure QR verification
- real refund gateway
- production notification infrastructure
- server-side authorization
- audit logging
- secure secret management

---

# Validation / Audit

Frontend production-readiness baseline verified:
- production build passed
- route smoke test passed
- dashboard flows inspected
- booking/payment/ticket flows inspected
- QR flow inspected
- PDF generation inspected
- responsive behavior inspected
- no critical runtime failure reported
- no hardcoded payment/API secrets reported
- protected dashboard routes inspected
- final audit reported zero issues found/fixed

---

# Development Commands

npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format

---

# Environment Variables

NODE_ENV
VITE_*

(Warning: VITE_* values are public and must never contain secrets.)

---

# Deployment

Current Nitro/Cloudflare-oriented deployment configuration (frontend deployment).
