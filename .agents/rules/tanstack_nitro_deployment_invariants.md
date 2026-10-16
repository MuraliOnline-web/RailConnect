# TanStack Start & Nitro Deployment Invariants

1. **Preset Resolution Hierarchy:**
   - `process.env.NITRO_PRESET` (Explicit override)
   - `nitro.preset` in `vite.config.ts`
   - Platform provider auto-detection (`process.env.VERCEL`, `process.env.NETLIFY`, etc.)
   - `nitro.defaultPreset` (Fallback)

2. **Do Not Overwrite Native Provider Detection:**
   - If the deployment platform sets standard CI variables (e.g. `VERCEL=1`), Nitro will automatically generate the appropriate provider output (`.vercel/output/` Build Output API v3).
   - Do not add manual `vercel.json` rewrite rules for SSR applications; TanStack Start relies on Nitro's serverless handler (`/__server`) for server functions and route streaming.

3. **Local Simulation vs. Cloud Deployment:**
   - To simulate a Vercel build locally without cloud CLI credentials, run:
     `$env:VERCEL="1"; npm run build`
   - Always verify that `.vercel/output/config.json` and `.vercel/output/functions/__server.func/` are correctly emitted and can be loaded by Node.
