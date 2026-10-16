# TanStack Router + Framer Motion Page Transition Invariant

To prevent layout flickers, component flashing, or rendering previous-page content during navigation transitions:

1. **Do Not Key on Location Pathname**: Never use raw URL state (`location.pathname`) as the `key` for transition containers (like `<motion.div>`) wrapping router children or `<Outlet />`.
2. **Key on Resolved Matches**: Always retrieve the resolved matches list and key the container on the active match ID:
   ```tsx
   const matches = useRouterState({ select: (s) => s.matches });
   const activeMatch = matches[matches.length - 1];
   const matchKey = activeMatch?.id ?? pathname;
   
   <motion.div key={matchKey}>
     {children}
   </motion.div>
   ```
3. **Rationale**: This guarantees that key updates and child component swaps commit to the DOM in the same React render cycle, ensuring entry animations only run on the finalized destination route.

## 4. TanStack Router Sub-page Route Naming (Avoiding Nested Layout Pitfalls)
When creating standalone sub-pages that should NOT be nested inside a parent page's layout (especially when the parent page lacks an `<Outlet />`), use the trailing underscore syntax:
- **Correct**: `src/routes/dashboard/profile_.change-password.tsx` -> URL `/dashboard/profile/change-password`
- **Avoid**: `src/routes/dashboard/profile.change-password.tsx` (causes TanStack Router to infer `profile.tsx` as parent layout, failing to render if `profile.tsx` has no `<Outlet />`).

## 5. Direct Deep-Link Entry, Hard Refresh & Query Preservation Invariants

To guarantee that any valid URL can be directly loaded, bookmarked, or refreshed without unexpected redirects, blank screens, or lost state:

1. **Resilient Direct-Entry States**:
   - Flow-dependent routes (such as `/dashboard/payment`, `/dashboard/ticket`, `/dashboard/refund-success`) must support direct URL access when flow state (e.g., `sessionStorage` draft) is missing.
   - Render a safe empty, recovery, or informational state within the layout (e.g., "No active payment draft found" or "Select a ticket to view details").
   - Never unconditionally redirect away from a valid route unless enforcing an explicit, documented authentication guard.

2. **Query Parameter Preservation via `validateSearch`**:
   - Always define `validateSearch` with robust parsers for routes supporting search parameters (e.g., `from`, `to`, `category`, `adults`, `id`).
   - Form inputs and page views must synchronize with search parameters on initial mount, ensuring that direct links and hard browser refreshes (`Page.reload`) maintain identical state.

3. **Trailing-Slash Normalization**:
   - Define all route paths without trailing slashes.
   - Rely on standard framework 307 normalization (`/path/` -> `/path`) rather than declaring duplicate trailing-slash route files.

4. **SSR Production Build & Deployment Awareness**:
   - The application uses TanStack Start with Nitro SSR.
   - On deployment platforms (Vercel), Nitro compiles server routes to platform-native functions (e.g. `.vercel/output`).
   - For local production preview testing of `.output/server/index.mjs`, use the Node SSR test wrapper (`prod_preview_server.cjs`) to accurately simulate production edge routing.


