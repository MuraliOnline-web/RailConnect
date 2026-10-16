# RailConnect UI Design System Invariants

## 1. Shared Counter Controls
- Both increment (+) and decrement (−) buttons must maintain identical outer dimensions, circular `rounded-full` silhouettes, and visual weight.
- Decrement controls must retain a distinct orange circular border (`border border-orange-500`) to balance filled circular accent buttons.
- Increment and decrement controls should be extracted into shared components (such as `Counter.tsx`) rather than re-implemented inline with varying borders or dimensions.

## 2. Segmented Capsule Selectors
- Dual-state selectors (e.g. Single Journey vs. Season Pass) must use a unified outer capsule container (`rounded-full border border-orange-200/90 bg-[#fffaf5] p-1`) with inner items, rather than disconnected buttons.
- On mobile viewports, child options should share width symmetrically (`flex-1`) to avoid awkward wrapping or overflow.

## 3. Mobile Dashboard Vertical Balance
- Prevent unbounded stretching of stat cards on mobile grids (`grid-cols-2`) by scoping `auto-rows-fr` to desktop (`sm:auto-rows-fr`) when lower rows contain tall multi-action cards (such as the Wallet Balance card).
- Metric titles and values should use centered vertical hierarchies on mobile viewports for compact readability without clipping.

## 4. Status Tab Contrast
- Unselected tab labels and item count badges must maintain strong near-black foreground color (`text-stone-900 font-bold`) rather than low-contrast muted opacities against white pill capsules.

## 5. Mobile Viewport Overflow Protection
- Ambient decorative elements (e.g. `blur-3xl`, radial gradients, or negative margins like `-right-24`) must always be wrapped in an `overflow-hidden` container or have the shell styled with `overflow-x-hidden`.
- Every mobile route must pass `scrollWidth === clientWidth` at 360px and 390px viewports with zero horizontal overflow.

## 6. Live Password Requirements Pattern
- **Single Source of Truth**: All password rules, minimum length constraints, and regexes must be declared in a centralized module (`src/lib/passwordValidation.ts`) and imported by both the indicator component (`PasswordRequirements.tsx`) and form submission handlers.
- **Default Visibility**: Requirement lists must be rendered immediately upon form display with all criteria in the unmet state (red), preventing unexpected vertical layout shifts.
- **Field Placement**: Place live requirement lists immediately beneath the primary password input and above any confirmation input. Do not render requirements under confirmation or verification fields.
- **Accessibility**: Link the input to the list via `aria-describedby="{id}"` with `aria-hidden="true"` on indicator icons.

## 7. Interactive Controls, Cursors & Hover Feedback Invariants
- **Explicit Pointer Affordance**: All interactive controls—including segmented selectors, switches, actionable rows, buttons, and links—must explicitly apply `cursor-pointer`.
- **Static Content Protection**: Static section cards, headers, read-only paragraphs, and informational text must never display a pointer cursor (`cursor-default` or `cursor-text`).
- **Unavailable Control Styling**: Unimplemented or roadmap features must not look actionable. Apply `aria-disabled="true"`, `cursor-not-allowed`, muted opacity (`opacity-70`), and a status badge (e.g. "Coming soon"). Never display an interactive chevron on unavailable rows.
- **Single-Event Switch Containers**: When making a full row clickable to toggle a switch, maintain a single root `[role="switch"]` container with `tabIndex={0}`. Avoid nested interactive elements to prevent accidental double-toggle event bubbling.
- **Tactile Hover Feedback**:
  - Interactive rows: Gentle surface lightening and border enrichment (`hover:border-orange-200 hover:bg-white dark:hover:border-stone-700 dark:hover:bg-stone-800/80`).
  - Actionable rows with chevrons: Subtle chevron translation (`group-hover:translate-x-1`) and accent color transition.
  - Switch tracks: Subtle track glow on row hover (`group-hover:ring-2`).
  - Keep transition durations restrained between 150ms and 200ms with subtle active compression (`active:scale-[0.98]`).
