# TanStack Router validateSearch Parameter Typing Guidelines

To prevent typescript compile errors when navigating routes with query parameters:

1. **Explicit Optional Return Type**: Always explicitly type the return shape of a route's `validateSearch` handler with optional fields (`?`).
   - If not annotated, the compiler infers the return shape as having required keys with `string | undefined` values, forcing all routing hooks (like `Link` or `navigate`) targeting the page to supply every query parameter in the `search` block.
   - Example:
     ```tsx
     validateSearch: (s: Record<string, unknown>): {
       from?: string;
       to?: string;
       category?: TrainCategory;
     } => ({
       from: typeof s.from === "string" ? s.from : undefined,
       to: typeof s.to === "string" ? s.to : undefined,
       category: typeof s.category === "string" ? (s.category as TrainCategory) : undefined,
     })
     ```
2. **Allows Parameter Omission**: Defining optional types ensures that standard links and redirect navigation checks can safely omit the search block.
