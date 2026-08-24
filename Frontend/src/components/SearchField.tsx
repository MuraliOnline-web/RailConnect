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
  variant = "default",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  showClear?: boolean;
  variant?: "default" | "network";
}) {
  return (
    <div className={`static-search-box ${className}`}>
      <FaMagnifyingGlass className="search-icon" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full px-2.5 py-1 text-xs sm:text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
