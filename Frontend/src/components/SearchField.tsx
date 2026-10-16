import { FaMagnifyingGlass } from "react-icons/fa6";

/**
 * Shared search input used across the entire app. Uses .static-search-box — no animated border.
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
    <div
      className={`static-search-box h-12 sm:h-10 md:h-11 px-3.5 sm:px-4 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-orange-200/90 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all ${className}`}
    >
      <FaMagnifyingGlass className="search-icon h-4 w-4 shrink-0 text-orange-500 dark:text-orange-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full min-w-0 h-full py-3 sm:py-2 text-sm sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 placeholder:opacity-90 bg-transparent border-0 outline-none focus:outline-none focus:ring-0"
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 rounded-full px-2.5 py-1 text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}
