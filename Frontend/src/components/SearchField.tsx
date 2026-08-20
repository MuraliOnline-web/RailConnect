import { FaMagnifyingGlass } from "react-icons/fa6";

/**
 * Shared search input. Every search box in the app uses this so they all
 * inherit the same premium animated orange border (see .premium-border).
 */
export function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
  showClear = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  showClear?: boolean;
}) {
  return (
    <div
      className={`premium-border flex items-center gap-2 rounded-xl bg-white/90 px-3.5 py-2.5 transition focus-within:ring-2 focus-within:ring-orange-300/50 ${className}`}
    >
      <FaMagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-orange-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
