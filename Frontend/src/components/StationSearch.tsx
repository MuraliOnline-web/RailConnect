import { useEffect, useMemo, useRef, useState } from "react";
import { FaMagnifyingGlass, FaXmark, FaTrainSubway } from "react-icons/fa6";
import { STATIONS } from "../lib/tickets";

type Station = (typeof STATIONS)[number];

// Lightweight prefix-friendly search. Designed to be swapped later with a
// binary/indexed prefix search API without changing the component contract.
function searchStations(query: string, exclude?: string): Station[] {
  const q = query.trim().toLowerCase();
  const pool = STATIONS.filter((s) => s.code !== exclude);
  if (!q) return pool.slice(0, 8);
  const starts: Station[] = [];
  const contains: Station[] = [];
  for (const s of pool) {
    const name = s.name.toLowerCase();
    const code = s.code.toLowerCase();
    if (name.startsWith(q) || code.startsWith(q)) starts.push(s);
    else if (name.includes(q) || code.includes(q)) contains.push(s);
  }
  return [...starts, ...contains].slice(0, 8);
}

function Highlight({ text, q }: { text: string; q: string }) {
  const s = q.trim();
  if (!s) return <>{text}</>;
  const i = text.toLowerCase().indexOf(s.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-orange-100 px-0.5 text-orange-800">
        {text.slice(i, i + s.length)}
      </mark>
      {text.slice(i + s.length)}
    </>
  );
}

export function StationSearch({
  value,
  onChange,
  exclude,
  placeholder = "Search station…",
}: {
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
  placeholder?: string;
}) {
  const selected = STATIONS.find((s) => s.code === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  // Reset query when selection changes from outside
  useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => searchStations(debounced, exclude), [debounced, exclude]);
  useEffect(() => setActive(0), [debounced]);

  const pick = (s: Station) => {
    onChange(s.code);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`premium-border flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 transition ${
          open ? "ring-2 ring-orange-300/40" : ""
        }`}
      >
        <FaMagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <input
          ref={inputRef}
          value={open ? query : selected ? `${selected.name} (${selected.code})` : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {(open ? query : selected) && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              if (open) inputRef.current?.focus();
              else onChange("");
            }}
            className="rounded-full p-1 text-muted-foreground hover:bg-orange-50 hover:text-orange-700"
            aria-label="Clear"
          >
            <FaXmark className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-glow animate-in fade-in zoom-in-95 duration-150">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No stations match “{debounced}”.
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((s, i) => (
                <li key={s.code}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(s);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition ${
                      active === i ? "bg-orange-50" : "bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                          active === i ? "bg-railway-gradient text-white" : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        <FaTrainSubway />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          <Highlight text={s.name} q={debounced} />
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {s.line}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-bold text-orange-700">
                      <Highlight text={s.code} q={debounced} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}