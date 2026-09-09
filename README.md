# RailConnect

**RailConnect** is a modern, mobile-first commuter rail ticketing platform that lets passengers book unreserved suburban rail tickets, season passes, and platform tickets — all in seconds. The project is structured as a monorepo with a single `Frontend` directory containing the complete web application.

---

## Frontend

The frontend is a full-stack, server-side rendered (SSR) React application built with **TanStack Start** and deployed via **Nitro** to edge runtimes (Cloudflare Workers by default). It is located in the `Frontend/` directory.

---

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | TanStack Start | `^1.167.x` |
| UI Library | React | `^19.2.0` |
| Language | TypeScript | `^5.8.3` |
| Styling | Tailwind CSS v4 | `^4.2.1` |
| Component Library | shadcn/ui (New York style) | — |
| Routing | TanStack Router | `^1.168.x` |
| Server-side Fetching | TanStack Query | `^5.83.0` |
| Build Tool | Vite | `^7.3.1` |
| SSR / Edge Server | Nitro | `3.0.x-beta` |
| Animations | Framer Motion | `^12.40.0` |
| Charts | Recharts | `^2.15.4` |
| PDF Generation | jsPDF | `^4.2.1` |
| Forms | React Hook Form + Zod | `^7.71.2` / `^3.24.2` |
| Icons | Lucide React + React Icons | `^0.575.0` / `^5.6.0` |
| Toast Notifications | Sonner | `^2.0.7` |
| Date Utilities | date-fns | `^4.1.0` |
| Package Manager | Bun (lockfile) / npm | — |
| Linting | ESLint `^9.x` + TypeScript ESLint | — |
| Formatting | Prettier | `^3.7.3` |

---

### Project Structure

```
Frontend/
├── src/
│   ├── components/             # Shared application components
│   │   ├── ui/                 # shadcn/ui primitives (46 components)
│   │   ├── AuthShell.tsx       # Wrapper layout for auth pages
│   │   ├── DashboardShell.tsx  # Sidebar + header layout for dashboard
│   │   ├── NotificationBell.tsx  # Live notification icon with badge
│   │   ├── RailLogo.tsx        # Brand logo component
│   │   ├── SearchField.tsx     # Reusable input search field
│   │   ├── SiteChrome.tsx      # Public-facing nav/header
│   │   └── StationSearch.tsx   # Station autocomplete combobox
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Responsive breakpoint detection hook
│   │   └── use-scroll-lock.ts  # Prevents body scroll when modals open
│   ├── lib/                    # Business logic & utilities
│   │   ├── api/                # TanStack Start server functions (RPC layer)
│   │   ├── auth.tsx            # AuthContext + AuthProvider (localStorage-backed)
│   │   ├── captcha.ts          # CAPTCHA helper utilities
│   │   ├── config.server.ts    # Server-only environment config (never sent to browser)
│   │   ├── currency.ts         # Indian Rupee formatting helpers
│   │   ├── error-capture.ts    # SSR error interception for h3/Nitro
│   │   ├── error-page.ts       # Static HTML fallback for catastrophic SSR errors
│   │   ├── favorites.ts        # Favorite routes persistence (localStorage)
│   │   ├── notifications.ts    # In-app notification store (localStorage)
│   │   ├── payment.ts          # Payment draft / receipt session helpers
│   │   ├── refund.ts           # Refund calculation logic
│   │   ├── ticketPdf.ts        # PDF ticket generation via jsPDF
│   │   ├── tickets.ts          # Ticket CRUD, fare calculator, station data
│   │   ├── utils.ts            # cn() class-merge utility
│   │   └── wallet.ts           # Wallet balance & transaction persistence
│   ├── routes/                 # File-based routing (TanStack Router)
│   │   ├── __root.tsx          # Root layout: providers, SEO meta, fonts
│   │   ├── index.tsx           # Landing / home page
│   │   ├── about.tsx           # About page
│   │   ├── login.tsx           # Login page
│   │   ├── register.tsx        # Registration page
│   │   ├── network.tsx         # Rail network map page
│   │   ├── why.tsx             # "Why RailConnect" marketing page
│   │   └── dashboard/          # Authenticated dashboard sub-routes
│   │       ├── index.tsx                  # Dashboard home / quick-book
│   │       ├── book.tsx                   # Ticket booking form
│   │       ├── tickets.tsx                # My tickets list
│   │       ├── ticket.tsx                 # Single ticket detail + QR code
│   │       ├── journey.tsx                # Journey planner
│   │       ├── payment.tsx                # Payment page (UPI / card / wallet)
│   │       ├── payment-success.tsx        # Post-payment confirmation
│   │       ├── wallet.tsx                 # Wallet balance & recharge
│   │       ├── wallet-recharge-success.tsx  # Recharge confirmation
│   │       ├── transactions.tsx           # Transaction history
│   │       ├── refunds.tsx                # Refund requests
│   │       ├── refund-success.tsx         # Refund confirmation
│   │       ├── qr.tsx                     # Live QR code display
│   │       ├── platform.tsx               # Platform ticket booking
│   │       ├── favorites.tsx              # Favourite routes
│   │       ├── history.tsx                # Travel history
│   │       ├── notifications.tsx          # Notification centre
│   │       ├── profile.tsx                # User profile & account settings
│   │       └── settings.tsx               # App preferences
│   ├── routeTree.gen.ts        # Auto-generated route tree (do not edit manually)
│   ├── router.tsx              # Router factory with QueryClient context
│   ├── server.ts               # SSR server entry – Nitro/h3 fetch handler
│   ├── start.ts                # Client entry point (hydration)
│   └── styles.css              # Global CSS – Tailwind v4 theme tokens + base styles
├── components.json             # shadcn/ui CLI configuration
├── vite.config.ts              # Vite config (via @lovable.dev/vite-tanstack-config)
├── tsconfig.json               # TypeScript compiler configuration
├── eslint.config.js            # ESLint flat config
├── .prettierrc                 # Prettier formatting rules
├── bunfig.toml                 # Bun package manager configuration
└── package.json                # Dependencies, scripts, and resolutions
```

---

### Architecture Overview

#### SSR with TanStack Start + Nitro

The application uses **TanStack Start** — a full-stack React meta-framework — in SSR mode. Each page is rendered on the server and then hydrated on the client. The server entry point is `src/server.ts`, which wraps the TanStack Start server entry with custom Nitro/h3 error handling to prevent swallowed SSR exceptions from serving malformed JSON 500 responses.

```
Request → Nitro Edge Worker → src/server.ts → TanStack Start SSR → React → Hydrate Client
```

#### File-Based Routing

Routing is handled by **TanStack Router** with file-based route discovery. The `src/routes/` directory maps directly to URL paths. The route tree is auto-generated into `src/routeTree.gen.ts` during development by the Vite plugin (`@tanstack/router-plugin`).

| Route Path | File | Description |
|---|---|---|
| `/` | `routes/index.tsx` | Landing / marketing home |
| `/about` | `routes/about.tsx` | About the platform |
| `/login` | `routes/login.tsx` | Authenticated login |
| `/register` | `routes/register.tsx` | New user registration |
| `/network` | `routes/network.tsx` | Rail network map |
| `/why` | `routes/why.tsx` | Why RailConnect page |
| `/dashboard` | `routes/dashboard/index.tsx` | Dashboard home |
| `/dashboard/book` | `routes/dashboard/book.tsx` | Ticket booking |
| `/dashboard/tickets` | `routes/dashboard/tickets.tsx` | All tickets list |
| `/dashboard/ticket` | `routes/dashboard/ticket.tsx` | Ticket detail + QR |
| `/dashboard/journey` | `routes/dashboard/journey.tsx` | Journey planner |
| `/dashboard/payment` | `routes/dashboard/payment.tsx` | Payment checkout |
| `/dashboard/wallet` | `routes/dashboard/wallet.tsx` | Wallet management |
| `/dashboard/transactions` | `routes/dashboard/transactions.tsx` | Transaction history |
| `/dashboard/refunds` | `routes/dashboard/refunds.tsx` | Refund management |
| `/dashboard/qr` | `routes/dashboard/qr.tsx` | QR code display |
| `/dashboard/platform` | `routes/dashboard/platform.tsx` | Platform tickets |
| `/dashboard/favorites` | `routes/dashboard/favorites.tsx` | Saved routes |
| `/dashboard/notifications` | `routes/dashboard/notifications.tsx` | Notification centre |
| `/dashboard/profile` | `routes/dashboard/profile.tsx` | User profile |
| `/dashboard/settings` | `routes/dashboard/settings.tsx` | Settings page |

#### State & Data Management

- **TanStack Query** (`QueryClient`) is instantiated per-request in the router factory and injected into the route context. All data-fetching and caching flows through it.
- **Auth state** is managed via a React Context (`AuthProvider` in `src/lib/auth.tsx`). User sessions are persisted in `localStorage` under the key `railconnect.auth.user`. All registered user accounts are stored under `railconnect.auth.users`.
- **Tickets, wallet, transactions, notifications, and favourites** are all persisted in `localStorage` using dedicated utility modules under `src/lib/`.

#### UI Component System

The project uses **shadcn/ui** (New York style) with **Tailwind CSS v4**. All primitives are copied into `src/components/ui/` and are fully customisable. The design system is defined in `src/styles.css` using CSS variables for theming (light and dark mode support).

**Fonts loaded from Google Fonts:**
- **Inter** (weights 400–800) — body and UI text
- **Sora** (weights 600–800) — brand headings

**shadcn/ui components included (46 total):**
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip.

#### Fare Calculation Engine

Fares are computed entirely client-side in `src/lib/tickets.ts`. The engine supports:

- **Ticket types**: Journey, Season Pass (×22 monthly multiplier), Platform (flat ₹10)
- **Class**: 1st class and 2nd class with distinct base fares and per-station rates
- **Passengers**: Separate adult and child rates
- **Train categories with surcharges:**

| Category | Surcharge |
|---|---|
| Passenger | ₹0 |
| Mail / Express | ₹20 |
| Superfast Express | ₹45 |

**Station dataset** covers major Indian rail hubs across Western, Central, Harbour, South Central, Southern, South Western, Northern, and Eastern lines (e.g. Churchgate, CSMT, Secunderabad, Chennai Central, New Delhi, Howrah).

#### Payment System

The payment flow is session-based, using `sessionStorage` for draft and receipt data (`src/lib/payment.ts`). Supported payment methods:

| Method | Group |
|---|---|
| Google Pay, PhonePe, Paytm, BHIM UPI | UPI |
| RailConnect Wallet | Wallet |
| Credit Card, Debit Card | Card |
| Net Banking (50+ banks) | Net Banking |

A **₹5 convenience fee** is applied to all non-wallet payments (`CONVENIENCE_FEE = 5`).

#### Wallet System

The wallet (`src/lib/wallet.ts`) tracks per-user balance and transaction history. Each transaction (`Txn`) records:
- **Type**: `recharge` | `booking` | `refund`
- **Status**: `success` | `pending` | `failed`
- **Payment method**, reference ID, notes, and ISO timestamp
- Balances are stored with paise-level precision (2 decimal places).

#### PDF Ticket Generation

Downloadable ticket PDFs are generated in-browser using **jsPDF** via `src/lib/ticketPdf.ts`, embedding the PNR, journey details, QR code, and fare breakdown — no server round-trip required.

---

### Key Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Delegates to `@lovable.dev/vite-tanstack-config`, which bundles TanStack Start, React, Tailwind CSS v4, TypeScript paths, and Nitro |
| `tsconfig.json` | Strict TypeScript, ES2022 target, `Bundler` module resolution, path alias `@/` → `src/` |
| `components.json` | shadcn/ui CLI config — New York style, Lucide icons, slate base colour, CSS variables enabled |
| `eslint.config.js` | ESLint flat config with TypeScript ESLint, React Hooks, and React Refresh rules |
| `.prettierrc` | Prettier code formatting rules |
| `bunfig.toml` | Bun package manager settings |

---

### Available Scripts

Run all scripts from inside the `Frontend/` directory:

```bash
# Start development server with Hot Module Replacement
npm run dev

# Production build (Nitro edge output)
npm run build

# Development build (non-minified)
npm run build:dev

# Preview the production build locally
npm run preview

# Lint the codebase with ESLint
npm run lint

# Format all files with Prettier
npm run format
```

---

### Environment Variables

Server-only secrets are accessed via `process.env` inside server functions and are never bundled into the client. Public config uses the `VITE_` prefix and is injected by Vite, making it available on both client and server.

| Variable | Scope | Purpose |
|---|---|---|
| `NODE_ENV` | Server only | Runtime environment (`development` / `production`) |
| `VITE_*` | Public (client + server) | Public runtime config — analytics IDs, API base URLs, etc. |

> **Warning:** Never put secrets in `VITE_`-prefixed variables — they are shipped to the browser bundle.

---

### Browser Storage Keys

The application uses `localStorage` and `sessionStorage` for data persistence. No external backend database is required for the current demo configuration.

| Key | Storage | Contents |
|---|---|---|
| `railconnect.auth.user` | `localStorage` | Currently logged-in user (JSON) |
| `railconnect.auth.users` | `localStorage` | All registered user accounts |
| `railconnect.tickets` | `localStorage` | All booked tickets |
| `railconnect.wallet` | `localStorage` | Per-user wallet balances |
| `railconnect.txns` | `localStorage` | All wallet transactions |
| `railconnect.notifications` | `localStorage` | In-app notification records |
| `railconnect.favorites` | `localStorage` | Saved station route pairs |
| `railconnect.paymentDraft` | `sessionStorage` | In-progress booking draft |
| `railconnect.lastReceipt` | `sessionStorage` | Last completed payment receipt |

---

### Deployment

The frontend targets **Cloudflare Workers** by default (via Nitro). To change the deployment runtime, update the Nitro preset in `vite.config.ts`. The build output is emitted to the `.output/` directory.
