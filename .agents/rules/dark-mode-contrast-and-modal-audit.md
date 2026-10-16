# Dark Mode Contrast & Modal Verification Guardrails

## 1. Modal Smoke Test Protocol
When testing modals, dialogs, or drawers in browser automation (CDP / Playwright / Puppeteer):
1. **Stable Selectors**: Use stable, locale-independent selectors (e.g. `data-testid`). Never rely on localized text labels.
2. **Trigger Existence**: Assert that trigger buttons exist before clicking. If a trigger is missing, fail immediately (do not silently continue).
3. **Explicit Visibility Assertion**: After clicking a trigger, explicitly assert the dialog element is present and visible (`el.checkVisibility({ checkOpacity: true })` or `el.offsetParent !== null`).
4. **Scoped Dialog Evaluation**: Run contrast evaluation exclusively on the visible modal subtree (`[data-testid="modal-..."]`), evaluating text against the modal card's effective surface.
5. **Isolated Dismissal**: Close each dialog using its actual close control (`[data-testid="close-..."]`), wait for dismissal transition, and assert that the dialog is removed or hidden before testing subsequent dialogs.

## 2. Strict Contrast & Placeholder Invariants
1. **Placeholder Resolution**: When evaluating inputs/textareas, test placeholder text using `window.getComputedStyle(el, "::placeholder").color`. Never substitute the input's normal text color.
2. **Modern CSS Color Support**: Do not use simple regex (`/rgba?\(\d+.../`) to parse `getComputedStyle(el).color` or `backgroundColor`, as modern browsers frequently return `oklab(...)`, `lab(...)`, or `oklch(...)`.
3. **Canvas 2D Color Resolution**: Use an off-screen 1x1 `<canvas>` context (`ctx.fillStyle = colorStr; ctx.fillRect(0,0,1,1); ctx.getImageData(0,0,1,1).data`) to reliably convert any browser color specification into sRGB.
4. **Alpha Compositing**: For translucent layers, walk up the DOM tree accumulating layers until reaching an opaque layer (`alpha === 1`) or the root dark base (`rgb(18, 15, 14)`).
5. **Heuristic Disclaimers**: If any ancestor between text and the opaque surface contains `linear-gradient` or `url()`, or if the text uses `bg-clip: text`, mark it as heuristic and do not falsely claim a solid verified contrast ratio.
6. **No Average Passing**: Every tested non-disabled text element must satisfy WCAG AA ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large text). An average ratio or zero white-on-white count is insufficient.

## 3. Route Mount & Public Isolation Verification
1. **Route Mount Enforcement**: If a route fails to mount or times out during navigation, record FAIL with an explicit failure reason and ensure the test process exits non-zero. Never award PASS to an unmounted route.
2. **Unauthenticated Public Isolation**: Test public routes (`/`, `/login`, `/register`) in a clean session without stored user tokens. Verify:
   - Root `dark` class is absent and `data-theme` is `light`.
   - Document `lang` is `en`.
   - `reduce-motion` and `text-scale-large` classes are absent.
   - Core public navigation and form controls are present and rendered.

## 4. Tailwind Token Sanity
1. Verify that all color shades match standard Tailwind palette numbers (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950).
2. Avoid fictitious tokens such as `stone-850` or `zinc-850`, which silently fail and cause fallback to light background styles.
