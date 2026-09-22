# RailConnect

## A. PROJECT OVERVIEW

RailConnect is a modern digital railway ticket booking frontend inspired by the type of workflows found in commuter/unreserved railway ticketing applications.

**IMPORTANT NOTE:** RailConnect is currently a frontend-focused project and demo. It is **not** the official Indian Railways, IRCTC, UTS, or RailOne application. Do not imply any affiliation with government organizations. There is currently no backend, real production API, real payment processing, or railway verification integration. All current data, authentication, and logic are simulated purely through frontend state and routing.

## B. LIVE DEMO

[Live Demo](https://railconnect-frontend-psi.vercel.app/)

## C. GITHUB REPOSITORY

[https://github.com/MuraliOnline-web/RailConnect](https://github.com/MuraliOnline-web/RailConnect)

## D. TECH STACK

The project relies on a modern React ecosystem:
- React 19
- TypeScript
- TanStack Start
- TanStack Router
- Vite
- Tailwind CSS (v4)
- Framer Motion
- jsPDF (PDF generation)
- QR-related frontend functionality
- localStorage / sessionStorage for client-side persistence
- Vercel Deployment

## E. APPLICATION MODULES

**PUBLIC:**
- Home
- Why RailConnect
- Network
- About
- Login
- Register

**DASHBOARD:**
- Dashboard
- Journey Ticket
- Platform Ticket
- QR Ticket
- My Tickets
- Booking History
- Transactions
- Refunds
- Wallet
- Notifications
- Favorite Routes
- Profile
- Settings

## F. JOURNEY TICKET

The implemented Journey Ticket functionality includes:
- Station search with smart station suggestions
- Single Journey
- Season Pass
- Passenger selection
- Train category
- Fare calculation
- Book & Travel flow
- Book & Print flow
- Payment flow
- Ticket generation

## G. BOOK & TRAVEL / BOOK & PRINT

**BOOK & TRAVEL:**
- Ticket is issued for digital travel/QR flow.
- Existing QR ticket workflow remains available.

**BOOK & PRINT:**
- Successful payment triggers the PDF ticket workflow.
- Automatic PDF download is implemented.
- Existing manual PDF download functionality remains where applicable.

*(Note: There is no backend PDF storage or server-side document generation.)*

## H. PLATFORM TICKET

Platform Ticket is a separate ticket workflow. Features include:
- Station selection
- Passenger count
- Fare calculation
- Payment
- Platform-specific Payment Success presentation

*Platform Ticket success does not use Journey Ticket-specific source, destination, or train category information.*

## I. TICKET MANAGEMENT

- Active Tickets
- Expired Tickets
- Cancelled Tickets
- Ticket Details
- Book Again
- Ticket search and filters
- Ticket status handling
- QR Ticket
- PDF ticket generation
- Cancellation/refund flow

## J. PAYMENT

Supported simulated frontend payment options include:
- Google Pay
- PhonePe
- Paytm
- BHIM UPI
- RailConnect Wallet
- Credit Card
- Debit Card
- Net Banking

*Note: These are frontend/demo payment flows. Real payment gateways do not process money in this application.*

## K. WALLET / TRANSACTIONS / REFUNDS

**Wallet:** Balance, Recharge, Recharge amounts, Payment method selection.
**Transactions:** Transaction records and state visualization.
**Refunds:** Existing frontend refund and cancellation behavior.

*(Does not claim real banking or payment settlement.)*

## L. QR TICKET

The QR Ticket functionality includes:
- QR display
- Ticket identity
- Journey information
- Passenger information
- Ticket details
- Payment information
- Ticket actions
- Empty state
- Cancellation navigation
- PDF relationship where applicable

*(There is no real QR verification or real railway backend validation.)*

## M. PDF TICKET

The PDF Ticket implementation features:
- A4 PDF layout
- RailConnect ticket layout
- Ticket reference
- Transaction ID
- QR section
- Journey information (where applicable)
- Passenger information
- Booking details
- Payment method
- Total fare
- Validity (where available)
- Automatic Book & Print download

*Optional fields are included only when actual ticket data exists.*

## N. RESPONSIVE DESIGN

The UI is designed for:
- Mobile
- Tablet
- Desktop

Responsive improvements include:
- Dashboard statistic-card alignment
- Mobile Journey selector with Single Journey / Season Pass side-by-side
- Responsive Payment Success layouts
- Responsive ticket/QR/PDF workflows

## O. UI/UX

Design characteristics:
- Mobile-first, Modern, and Premium
- Clean interfaces
- Responsive design
- Accessible interaction states
- Controlled animations
- Consistent RailConnect visual system

## P. DATA / STORAGE ARCHITECTURE

The current application uses client-side state and browser storage (localStorage and sessionStorage) for the demo/persistence behavior where applicable.

The current project does NOT yet provide:
- Real backend authentication
- Server-side database persistence
- Real railway booking APIs
- Real payment gateway processing
- Real QR verification backend
- Production banking integration

## Q. PROJECT STRUCTURE

```text
Frontend/
  src/
    components/
    hooks/
    lib/
    routes/
    styles.css
```

## R. DEVELOPMENT

Development commands:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

## S. DEPLOYMENT

Current production deployment:
[https://railconnect-frontend-psi.vercel.app/](https://railconnect-frontend-psi.vercel.app/)
The application is deployed from the `Frontend` directory on Vercel.

## T. TESTING / AUDIT

The latest validation included:
- TypeScript type check
- ESLint
- Production build
- Browser smoke testing
- Dashboard responsive verification
- Journey selector responsive verification
- Journey booking/payment flow
- Platform Ticket Payment Success verification
- QR verification
- PDF regression testing
- Book & Print implementation with automatic-download logic

*Automatic PDF download logic is implemented and duplicate-trigger protection was verified; filesystem-level automatic download interception was not available in the automated browser environment.*

## U. RECENT ENHANCEMENTS

1. Dashboard statistic-card spacing/alignment improved.
2. Book & Print automatic PDF download implemented.
3. Platform Ticket Payment Success separation logic added.
4. Journey Ticket "Season Pass" selector refined for mobile side-by-side display.
5. StrictMode-safe one-time download guard implemented.
6. Responsive layout refinements applied across viewport sizes.
