---
description: Constraints for handling business logic and actions in React components.
---

# Single Source of Truth for Business Logic

When adding features or action buttons to presentation components, **DO NOT** duplicate existing business logic, API calls, state mutations, or complex confirmation dialogs from other pages into the new component.

1. **Navigate Instead of Duplicating:** If an action (e.g., "Cancel Ticket", "Process Refund") already exists on a dedicated detail page, the new component should simply provide a link/navigation to that existing page rather than recreating the logic in-place.
2. **Respect the Architecture:** Complex side effects (like wallet transactions or refund calculations) must remain centralized in their original implementation to prevent state fragmentation.
3. **Keep Presentation Components Clean:** Presentation components should only consume existing data models and execute simple shared utilities (like downloading a PDF), delegating complex domain actions elsewhere.
