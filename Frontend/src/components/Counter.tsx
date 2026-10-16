import React from "react";

export interface CounterProps {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function Counter({
  label,
  value,
  setValue,
  min = 0,
  max = 10,
  className = "",
}: CounterProps) {
  const isMin = value <= min;
  const isMax = max !== undefined && value >= max;

  return (
    <div
      className={`flex flex-1 items-center justify-between rounded-full border border-stone-800/80 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 shadow-2xs ${className}`}
    >
      <div className="min-w-0 pl-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 leading-none">
          {label}
        </div>
        <div className="font-[Sora] text-lg font-bold text-stone-950 dark:text-stone-100 leading-tight mt-0.5">
          {value}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={isMin}
          aria-label={`Decrease ${label}`}
          className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-orange-500 dark:border-orange-500/80 bg-[#fffaf5] dark:bg-stone-800 text-sm font-bold text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-100/80 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setValue(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={isMax}
          aria-label={`Increase ${label}`}
          className="bg-railway-gradient flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-xs transition-all hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
