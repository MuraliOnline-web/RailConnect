import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaReceipt, FaArrowDown, FaRotateLeft, FaSliders } from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTxns, type Txn } from "../../lib/wallet";
import { formatINR, formatSignedINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({ meta: [{ title: "Transactions · RailConnect" }] }),
  component: TxnPage,
});

function TxnStatusBadge({ status }: { status: Txn["status"] | string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    success: {
      bg: "bg-emerald-50 text-emerald-700 border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    completed: {
      bg: "bg-emerald-50 text-emerald-700 border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    pending: {
      bg: "bg-amber-50 text-amber-700 border border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    failed: {
      bg: "bg-rose-50 text-rose-700 border border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
      dot: "bg-rose-500",
    },
    refunded: {
      bg: "bg-sky-50 text-sky-700 border border-sky-300/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
      dot: "bg-sky-500",
    },
  };

  const current = map[status] || map.success;

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider shadow-2xs ${current.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dot}`} />
      {status}
    </span>
  );
}

function TxnIcon({ type, amount }: { type: Txn["type"]; amount: number }) {
  if (type === "refund") {
    return (
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-xs">
        <FaRotateLeft className="h-4 w-4" />
      </div>
    );
  }
  if (amount >= 0 || type === "recharge") {
    return (
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
        <FaArrowDown className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="bg-railway-gradient flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-white shadow-xs">
      <FaReceipt className="h-4 w-4" />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70 dark:text-stone-300">
        {label}
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-orange-100 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 py-2 px-3 text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
      />
    </div>
  );
}

function TxnPage() {
  const { user } = useAuth();
  const txns = useMemo(() => (user ? loadTxns(user.id) : []), [user]);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<"all" | "recharge" | "booking" | "refund">("all");
  const [range, setRange] = useState<"all" | "today" | "7d" | "30d" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const isFiltered = filter !== "all" || range !== "all" || !!q || !!from || !!to;

  const resetFilters = () => {
    setFilter("all");
    setRange("all");
    setFrom("");
    setTo("");
    setQ("");
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    const fromTs =
      range === "today"
        ? now - day
        : range === "7d"
          ? now - 7 * day
          : range === "30d"
            ? now - 30 * day
            : range === "custom" && from
              ? new Date(from).getTime()
              : null;
    const toTs = range === "custom" && to ? new Date(to).getTime() + day : null;
    const s = q.trim().toLowerCase();
    return txns.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      const ts = new Date(t.createdAt).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      if (!s) return true;
      return (
        t.ref.toLowerCase().includes(s) ||
        t.note.toLowerCase().includes(s) ||
        t.method.toLowerCase().includes(s)
      );
    });
  }, [txns, filter, range, from, to, q]);

  const totals = useMemo(() => {
    let credit = 0,
      debit = 0;
    for (const t of filtered) {
      if (t.amount >= 0) credit += t.amount;
      else debit += Math.abs(t.amount);
    }
    return { credit, debit };
  }, [filtered]);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every rupee in and out of your RailConnect account.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-5 grid gap-3.5 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4 sm:p-5 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            In view
          </div>
          <div className="mt-1 font-[Sora] text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {filtered.length}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 sm:p-5 shadow-soft border border-emerald-100/60 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Credits
          </div>
          <div className="mt-1 font-[Sora] text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +{formatINR(totals.credit)}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 sm:p-5 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Debits
          </div>
          <div className="mt-1 font-[Sora] text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            −{formatINR(totals.debit)}
          </div>
        </div>
      </div>

      {/* Filter and List Container */}
      <div className="glass rounded-3xl p-4 sm:p-5 shadow-soft">
        {/* Search row with prominent search input & Filters button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder="Search by transaction ID, method or note…"
            className="w-full flex-1 min-w-0"
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2.5 text-xs font-semibold uppercase tracking-wider transition shrink-0 cursor-pointer ${
              showFilters
                ? "bg-railway-gradient text-white shadow-soft"
                : "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 dark:bg-stone-800 dark:border-stone-700 dark:text-orange-400 dark:hover:bg-stone-700"
            }`}
          >
            <FaSliders className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        {/* Expandable Filters Panel */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3.5 border-t border-orange-100/70 dark:border-stone-800">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {/* Dropdown 1: Transaction Type */}
                  <div>
                    <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200">
                      Transaction Type
                    </label>
                    <select
                      value={filter}
                      onChange={(e) =>
                        setFilter(e.target.value as "all" | "recharge" | "booking" | "refund")
                      }
                      className="w-full h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer shadow-2xs dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                    >
                      <option value="all">All</option>
                      <option value="recharge">Recharge</option>
                      <option value="booking">Booking</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>

                  {/* Dropdown 2: Date Range */}
                  <div>
                    <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200">
                      Date Range
                    </label>
                    <select
                      value={range}
                      onChange={(e) =>
                        setRange(e.target.value as "all" | "today" | "7d" | "30d" | "custom")
                      }
                      className="w-full h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer shadow-2xs dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {range === "custom" && (
                  <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                    <DateField label="From Date" value={from} onChange={setFrom} />
                    <DateField label="To Date" value={to} onChange={setTo} />
                  </div>
                )}

                {isFiltered && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] font-semibold text-orange-700 hover:text-orange-800 hover:underline cursor-pointer dark:text-orange-400"
                    >
                      Reset all filters to All
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction List */}
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {txns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 sm:p-10 text-center">
              <div className="bg-railway-gradient mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft mb-3">
                <FaReceipt className="h-5 w-5" />
              </div>
              <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                No transactions recorded yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground dark:text-stone-400 max-w-sm mx-auto">
                Recharges, journey bookings and refund receipts will appear here once recorded.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 sm:p-10 text-center text-sm font-medium text-muted-foreground dark:text-stone-400">
              No transactions match your filters.
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-stone-900/80 dark:border dark:border-stone-800 p-3 sm:p-3.5 shadow-2xs hover:bg-white dark:hover:bg-stone-800 hover:shadow-soft transition-all gap-2.5 sm:gap-3 group"
              >
                {/* Left: Circular transaction icon */}
                <TxnIcon type={t.type} amount={t.amount} />

                {/* Centre: Transaction information */}
                <div className="min-w-0 flex-1">
                  <div className="font-[Sora] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug capitalize sm:flex sm:items-center sm:gap-2">
                    <span className="line-clamp-2 sm:line-clamp-none sm:truncate">{t.note}</span>
                    <span className="hidden sm:inline-flex shrink-0 rounded-full border border-orange-200/80 bg-orange-50/80 dark:bg-stone-800 dark:border-stone-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">
                      {t.type}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                    <span className="sm:hidden">
                      {t.method} · {t.ref}
                    </span>
                    <span className="hidden sm:inline">
                      {t.ref} · {t.method} ·{" "}
                      {new Date(t.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Right: Amount and Status directly beneath it */}
                <div className="shrink-0 flex flex-col items-end text-right">
                  <div
                    className={`font-[Sora] text-xs sm:text-sm font-extrabold leading-tight ${
                      t.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {formatSignedINR(t.amount)}
                  </div>
                  <div className="mt-1">
                    <TxnStatusBadge status={t.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
