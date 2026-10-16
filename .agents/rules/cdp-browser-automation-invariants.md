# CDP Browser Automation & Localization Test Invariants

## 1. Chromium / Edge Headless Target Selection
When inspecting available targets from `http://localhost:<port>/json/list` during Chrome DevTools Protocol (CDP) automation:
- **Do not assume `pages[0]` is the active application page.** Headless Chromium and Edge instances frequently initialize browser extensions or background pages (e.g. `type: "background_page"`) as the first target in the JSON list.
- **Rule:** Always select the actual page target with a safe fallback:
  ```javascript
  const targetPage = pages.find((p) => p.type === 'page') || pages[0];
  ```
  before establishing the WebSocket debugger connection.

## 2. Locale-Independent Selectors in Testing
When testing internationalized interfaces (such as multilingual RailConnect flows supporting English, Hindi, and Telugu):
- **Do not rely on hardcoded English `aria-label` or innerText attributes for interactive controls** once the interface language changes. For example, `[aria-label="Language"]` changes to `[aria-label="భాష"]` in Telugu and `[aria-label="भाषा"]` in Hindi.
- **Rule:** Use locale-independent selectors whenever possible:
  - Stable IDs, data attributes, or form names: `[data-testid="..."]`, `[data-setting-key="..."]`, or `name="..."`.
  - Accessible semantic roles with stable values: `[role="radiogroup"] [role="radio"][data-value="te"]`.
  - Invariant native language scripts (`English`, `हिन्दी`, `తెలుగు`) rather than translated labels.

## 3. Separation of Pure Preferences Logic from DOM Side Effects & React Integration
To avoid SSR hydration mismatches, flashing untranslated content, or circular dependencies:
- **Rule:** Maintain a clear architectural boundary between pure logic, DOM side effects, and declarative React context:
  - **Pure State & Persistence Logic:** Pure data types (`AppSettings`), default settings, state reducers, preference validation, and storage key resolution must be isolated in a pure core module (e.g. `settings-core.ts`) without React or browser-only dependencies.
  - **DOM Side Effects:** Functions that mutate document elements (`applyThemeToDom`, `applyReducedMotionToDom`, `applyLargeTextToDom`, `applyLanguageToDom`) perform DOM side effects and must not be treated as pure. Guard them against SSR execution (`typeof window !== 'undefined'`).
  - **React Context:** Declarative React providers (`SettingsProvider`, `I18nProvider`) wrap these mechanisms to bind state reactively to the component tree.

## 4. Account-Scoped Settings Isolation
Personal user preferences must belong exclusively to the authenticated user account:
- **Rule:** Verify that Language, Theme, Reduced Motion, Larger Text, and Notification preferences are applied only within the authenticated session:
  - **Public Routes Retain Defaults:** Public landing (`/`), informational pages (`/about`), login (`/login`), and registration (`/register`) must always display their default appearance and English language.
  - **Account Isolation:** Persist preferences against stable account identifiers (`railconnect.settings.user.<id>`). Switching accounts must load each account's independent preferences without data leakage.
  - **Logout Reset:** Logging out must clear or deactivate account-specific DOM classes/attributes and restore standard public defaults.

## 5. Real Event Integration Verification
A visual rendering test or DOM presence check alone does not constitute proof that an event-driven feature functions:
- **Rule:** Verify notification preferences against real application events:
  - **End-to-End Event Triggers:** Test booking confirmations through actual successful Journey and Platform booking transactions.
  - **Suppression Verification:** Assert that disabling a category preference genuinely suppresses subsequent notification generation without deleting historical records.
  - **Truthful Status Reporting:** If an event source, promotional feed, or remote push service requires unavailable backend infrastructure, explicitly record it as `BLOCKED` or `NOT VERIFIED` rather than marking it as `PASS`.
