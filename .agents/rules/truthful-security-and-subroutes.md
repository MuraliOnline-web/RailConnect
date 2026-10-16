# Security UI & Subroute Architecture Guidelines

## 1. TanStack Router Sibling Subroutes
- When creating a mobile or dedicated subroute under an existing standalone route that lacks `<Outlet />` (e.g., `/dashboard/profile`):
  - Use the file convention `src/routes/<parent>_.<subroute>.tsx` (e.g., `src/routes/dashboard/profile_.login-activity.tsx`).
  - Do NOT modify the parent route to include an unnecessary `<Outlet />` if the parent route is designed as an independent page.
  - Exclude mobile-only detail subroutes from global sidebar/dashboard navigation lists.

## 2. Zero Fabrication for Security & Session Data
- **No Mock Security Artifacts:** Never fabricate IP addresses (e.g., `192.168.1.1`), synthetic geo-locations ("Mumbai, India"), or fake sign-in timestamps.
- **Client-Side Derivation Transparency:** When displaying current device information, derive browser and OS details truthfully from `navigator.userAgent` and viewport dimensions. Label the scope honestly (e.g., "Current browser", "Demo session", "Active in this window").
- **Truthful Pending States:** For features requiring server-side authority (such as remote session revocation, multi-device listing, or historical audit logs), render elegant empty/informative states explaining that backend integration is required, rather than providing dummy buttons that silently do nothing or show fake success toasts.
