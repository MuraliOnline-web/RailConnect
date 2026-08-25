# Vector SVG Brand Logo Integration Invariant

To maintain visual consistency, performance, and cross-platform offline reliability when rendering third-party brand logos (e.g. payment method brands):

1. **Design Clean Inline Vector SVGs**: Do not use generic icons or load external image assets (like PNGs or JPEGs) from a CDN, which can fail to render. Instead, embed crisp inline Vector SVG brand components directly in the code.
2. **Aspect-Ratio Logo Container**: Always wrap SVGs in a standard aspect-ratio flex container with a uniform footprint.
   - Example style:
     ```tsx
     <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-xl bg-white border border-orange-100 shadow-sm p-1.5 overflow-hidden transition-transform duration-200 group-hover:scale-105">
       {brandLogo}
     </div>
     ```
3. **Prevent Logo Distortion**: Set specific `viewBox` coordinates and responsive dimensions (like `h-4.5 w-auto` or `h-5.5 w-auto`) on the SVG tag so logos scale cleanly and do not stretch.
