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
