# TanStack Router Reusable Route Prefill State Invariant

To pass field parameters securely and cleanly between routes (e.g. from Dashboard Recent Routes -> Journey Ticket form) without using side-effects or local storage overrides:

1. **Leverage ValidateSearch Schema**: Always define search schemas directly on the target route using the router's `validateSearch` hook:
   ```tsx
   validateSearch: (s: Record<string, unknown>) => ({
     from: typeof s.from === "string" ? s.from : undefined,
     to: typeof s.to === "string" ? s.to : undefined,
   })
   ```
2. **Sanitize State Initialization**: Always sanitize and validate the prefilled query values against a local whitelist or valid dataset before assigning it to the state:
   ```tsx
   const prefill = Route.useSearch();
   const isValidStation = (code: string) => STATIONS.some((s) => s.code === code);
   const [from, setFrom] = useState(prefill.from && isValidStation(prefill.from) ? prefill.from : "");
   ```
3. **Use Declarative Link Search Parameters**: Navigate using `<Link>` with typed `search` attributes:
   ```tsx
   <Link to="/dashboard/journey" search={{ from: f.fromCode, to: f.toCode }}>
     Book Again
   </Link>
   ```
   This ensures states are bookmarkable, clean, and automatically reset when a page is loaded directly without parameters.
