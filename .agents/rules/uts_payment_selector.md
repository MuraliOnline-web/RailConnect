# UTS-Style Payment Selector Design Guidelines

To maintain visual simplicity, stable transitions, and practical information density in booking and checkout flows:

1. **Natural Group Segregators**: Separate options by category (e.g., UPI, Wallet, Cards, Net Banking) using small bold uppercase headers with thin trailing dividing lines instead of placing each option in its own card widget.
2. **Consistent Selectable Rows**: Render options as compact rows of equal height.
   - Example style:
     ```tsx
     <button className="flex items-center justify-between rounded-xl border p-3 text-left shadow-sm">
       <div className="flex items-center gap-3">
         {/* Icon */}
         {/* Label and Hint */}
       </div>
       {/* Radio Indicator */}
     </button>
     ```
3. **Quiet Selection Feedback**: Provide minimal selected-state transitions:
   - Subtle selected border (`border-orange-400`).
   - Very light background tint (`bg-orange-50/45`).
   - Slight translate displacement (`-translate-y-[0.5px]`).
   - Radio dot active indicator.
   - Zero glowing, conic gradients, rotating lines, or traveling border animations.
4. **Standardized Brand Logo Boundaries**: Enclose every brand SVG inside a small standard-sized container (e.g., `h-8 w-12`) with a white background and light borders to prevent layout shifts.
