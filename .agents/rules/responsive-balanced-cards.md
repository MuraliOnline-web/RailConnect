# Responsive Balanced Cards & Circular Icon Container Invariants

### 1. Dual-Card Side-by-Side Balancing (Desktop vs. Stacked)
- When two cards must align top and bottom edges side-by-side:
  - Container: Use CSS Grid with `items-stretch` (e.g., `grid grid-cols-1 lg:grid-cols-12 items-stretch gap-5 lg:gap-6`).
  - Desktop (`lg:` and above): Apply `lg:h-full` to both cards so the outer borders stretch to identical heights. Use internal flex distribution (`flex flex-col justify-between`) to cleanly space top items and bottom action controls without arbitrary pixel spacers.
  - Tablet & Mobile (`< lg`): Apply `h-auto` to both cards so they stack vertically and occupy their natural content-driven height without dead whitespace.

### 2. Consistent Option Card Rows
- In multi-column option grids (e.g., UPI / Card methods):
  - Enforce uniform row height using `min-h-[58px] sm:min-h-[62px]` and single-line truncated text (`truncate`).
  - Keep label and hint text in flex-1 containers to prevent mismatched heights between adjacent cards.

### 3. Strict Circular Logo Containers
- When circular brand marks are required:
  - Container must use `rounded-full`, equal aspect ratio (`h-11 w-11 sm:h-12 sm:w-12`), and `shrink-0`.
  - Never wrap a circular logo in a rectangular or capsule-shaped badge.
  - Scale inner brand vectors with `object-contain` to preserve aspect ratio without edge clipping.

### 4. Summary Card Internal Content Distribution (Preventing Central Void)
- When a summary card stretches to match an adjacent options panel:
  - Do NOT group only at extreme top and extreme bottom, which causes a large, awkward void.
  - Structure content into three distinct groups:
    1. **Group A (Top)**: Heading and detailed breakdown with comfortable row padding (`py-3 sm:py-3.5`) and subtle row separators (`divide-y divide-stone-100`).
    2. **Group B (Middle)**: Subtle divider line and prominent Total Amount (`my-auto`), positioned right after the breakdown.
    3. **Group C (Bottom)**: Full-width action button (Pay) and security/trust guarantee.
  - Use flex distribution (`justify-between` across the three groups) so vertical space is shared equally between the breakdown, total, and call-to-action.

### 5. Shared Sidebar Layout & Account Card Invariants
- **Explicit Separation Anchor**: In flex-column sidebars (`flex flex-col h-full`), always apply explicit top padding or spacing to the trailing account card container (e.g., `pt-4.5` / `18px`, targeting 16–20px) rather than relying solely on `mt-auto`. This prevents the trailing card from abutting the final navigation item.
- **Internal Scroll Buffer**: Include `pb-1.5` or `pb-2` inside scrollable navigation containers (`overflow-y-auto`) so the final item and scrollbar never visually merge with or touch the trailing card boundary.
- **No Squashing (`shrink-0`)**: Ensure trailing account cards have `shrink-0` to prevent flex compression when navigation lists expand or when viewport height decreases.
- **Surface & Border Visibility**:
  - *Light Theme*: Use warm-neutral or orange-tinted borders (e.g., `border-orange-200/80` or `border-orange-200`) on clean light card surfaces (`bg-white/90`) with subtle elevation (`shadow-2xs`).
  - *Dark Theme*: Differentiate the card surface (`dark:bg-stone-900/90`) from the outer glass sidebar (`dark:bg-stone-950/80`). Use distinct borders (`dark:border-stone-700/80`). Elevate interactive controls inside the card (such as Logout) using a distinct surface (`dark:bg-stone-800/80`), visible border (`dark:border-stone-700`), and accessible text/icon colors (`dark:text-orange-400`).
- **Responsive Breakpoint Isolation**: Refinements intended for desktop and tablet layouts must be strictly scoped to `md:` (>= 768px). Mobile drawers and bottom bars (< 768px) must remain completely independent to prevent layout regressions.

