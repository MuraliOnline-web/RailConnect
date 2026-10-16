import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTrain,
  FaArrowRight,
  FaSliders,
  FaTicket,
  FaCircleXmark,
  FaCalendarXmark,
} from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, CATEGORY_LABEL, type Ticket, type TrainCategory } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/tickets")({
  head: () => ({ meta: [{ title: "My Tickets · RailConnect" }] }),
  component: TicketsPage,
});

type TabKey = "active" | "expired" | "cancelled";
type DateRange = "all" | "today" | "7d" | "30d" | "custom";

const PAGE_SIZE = 8;

function TicketsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const tickets = useMemo(() => (user ? loadTickets(user.id) : []), [user, version]);

  const [tab, setTab] = useState<TabKey>("active");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fCategory, setFCategory] = useState<TrainCategory | "all">("all");
  const [fType, setFType] = useState<"all" | "journey" | "season" | "platform">("all");
  const [fRange, setFRange] = useState<DateRange>("all");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 180);
    return () => clearTimeout(id);
  }, [query]);

  // Refresh every minute so status auto-flips active → expired
  useEffect(() => {
    const id = setInterval(() => setVersion((v) => v + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    return {
      active: tickets.filter((t) => t.status === "active").length,
      expired: tickets.filter((t) => t.status === "expired").length,
      cancelled: tickets.filter((t) => t.status === "cancelled").length,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return tickets.filter((t) => {
      if (t.status !== tab) return false;
      if (fCategory !== "all" && (t.category ?? "passenger") !== fCategory) return false;
      if (fType !== "all" && t.type !== fType) return false;
      if (debounced) {
        const hay = [t.from, t.to, t.fromCode, t.toCode, t.pnr, t.txnId, t.line]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(debounced)) return false;
      }
      const created = new Date(t.createdAt).getTime();
      if (fRange === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        if (created < start.getTime()) return false;
      } else if (fRange === "7d") {
        if (created < now - 7 * 86400000) return false;
      } else if (fRange === "30d") {
        if (created < now - 30 * 86400000) return false;
      } else if (fRange === "custom") {
        if (fFrom && created < new Date(fFrom).getTime()) return false;
        if (fTo && created > new Date(fTo).getTime() + 86400000) return false;
      }
      return true;
    });
  }, [tickets, tab, fCategory, fType, fRange, fFrom, fTo, debounced]);

  useEffect(() => setLimit(PAGE_SIZE), [tab, debounced, fCategory, fType, fRange, fFrom, fTo]);

  const isFiltered = fCategory !== "all" || fType !== "all" || fRange !== "all" || fFrom || fTo;
  const resetFilters = () => {
    setFCategory("all");
    setFType("all");
    setFRange("all");
    setFFrom("");
    setFTo("");
  };

  const visible = filtered.slice(0, limit);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {t("tickets.title")}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage every active, expired and cancelled journey.
        </p>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(
          [
            { key: "active", label: t("common.active") },
            { key: "expired", label: t("common.expired") },
            { key: "cancelled", label: t("common.cancelled") },
          ] as { key: TabKey; label: string }[]
        ).map((tabItem) => {
          const selected = tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                selected
                  ? "bg-railway-gradient text-white shadow-soft border-2 border-orange-500"
                  : "bg-white/95 dark:bg-stone-900 text-foreground border border-stone-300 dark:border-stone-800 hover:border-stone-400 hover:bg-white"
              }`}
            >
              {tabItem.label}
              <span
                className={`ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  selected
                    ? "bg-white/25 text-white border border-white/30"
                    : "bg-orange-50 dark:bg-stone-800 text-foreground border border-stone-200 dark:border-stone-700"
                }`}
              >
                {counts[tabItem.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filter toggle */}
      <div className="mt-4 glass rounded-3xl p-4 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search by station, ticket ID or transaction ID…"
            className="w-full flex-1 min-w-0"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2.5 text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
              showFilters
                ? "bg-railway-gradient text-white shadow-soft"
                : "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
            }`}
          >
            <FaSliders className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3.5 border-t border-orange-100/70">
                <div className="grid gap-3.5 sm:grid-cols-3">
                  {/* Dropdown 1: Train Category */}
                  <div>
                    <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-stone-900">
                      Train Category
                    </label>
                    <select
                      value={fCategory}
                      onChange={(e) => setFCategory(e.target.value as TrainCategory | "all")}
                      className="w-full h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer shadow-2xs"
                    >
                      <option value="all">All</option>
                      <option value="passenger">Passenger</option>
                      <option value="mail_express">Mail / Express</option>
                      <option value="superfast">Superfast Express</option>
                    </select>
                  </div>

                  {/* Dropdown 2: Ticket Type */}
                  <div>
                    <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      Ticket Type
                    </label>
                    <select
                      value={fType}
                      onChange={(e) =>
                        setFType(e.target.value as "all" | "journey" | "season" | "platform")
                      }
                      className="w-full h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer shadow-2xs"
                    >
                      <option value="all">All</option>
                      <option value="journey">Journey</option>
                      <option value="season">Season</option>
                      <option value="platform">Platform</option>
                    </select>
                  </div>

                  {/* Dropdown 3: Date Range */}
                  <div>
                    <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      Date Range
                    </label>
                    <select
                      value={fRange}
                      onChange={(e) => setFRange(e.target.value as DateRange)}
                      className="w-full h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer shadow-2xs"
                    >
                      <option value="all">All</option>
                      <option value="today">Today</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {fRange === "custom" && (
                  <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                    <DateField label="From Date" value={fFrom} onChange={setFFrom} />
                    <DateField label="To Date" value={fTo} onChange={setFTo} />
                  </div>
                )}

                {isFiltered && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:underline cursor-pointer"
                    >
                      Reset all filters to All
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState
            tab={tab}
            hasQuery={!!debounced || fCategory !== "all" || fType !== "all" || fRange !== "all"}
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 items-stretch">
              <AnimatePresence mode="popLayout">
                {visible.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="h-full flex flex-col"
                  >
                    <TicketCard
                      t={t}
                      onOpen={() => navigate({ to: "/dashboard/ticket", search: { id: t.id } })}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {visible.length < filtered.length && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setLimit((l) => l + PAGE_SIZE)}
                  className="rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-2 text-xs font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700 cursor-pointer shadow-2xs"
                >
                  Load more ({filtered.length - visible.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    active:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800 border border-emerald-300/60 dark:border-emerald-800",
    expired:
      "bg-red-50/80 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-red-400 dark:ring-red-800 border border-red-300/60 dark:border-red-800",
    cancelled:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-800 border border-rose-300/60 dark:border-rose-800",
  } as const;
  return (
    <span
      className={`inline-flex h-10 sm:h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold uppercase tracking-wider shadow-2xs ${map[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status === "expired"
              ? "bg-red-500"
              : "bg-rose-500"
        }`}
      />
      {status}
    </span>
  );
}

function TicketCard({ t, onOpen }: { t: Ticket; onOpen: () => void }) {
  const isPlatform = t.type === "platform";

  return (
    <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft transition hover:shadow-glow h-full flex flex-col">
      <div className="rounded-[1.4rem] bg-white dark:bg-stone-900 p-5 h-full flex flex-col justify-between flex-1">
        {/* Top Header Region */}
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {isPlatform
                ? `PLATFORM · ${t.line || "WESTERN"}`
                : `${t.type} · ${t.line || "WESTERN"}`}
            </span>
            <span className="font-mono text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              {t.pnr}
            </span>
          </div>

          {/* Sub-badge: Category for Journey, or Platform Ticket identification */}
          <div className="mt-2 min-h-[24px] flex items-center">
            {isPlatform ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                PLATFORM TICKET
              </span>
            ) : t.category ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {CATEGORY_LABEL[t.category]}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {t.type === "season" ? "Season Pass" : "Ordinary"}
              </span>
            )}
          </div>
        </div>

        {/* Middle Content Region: Journey Route vs Platform Ticket Layout */}
        <div className="my-auto py-2">
          {isPlatform ? (
            /* Dedicated Platform Ticket Layout: NO FROM/TO, Station-centric */
            <button
              type="button"
              onClick={onOpen}
              className="flex w-full items-center justify-between rounded-2xl bg-orange-50/50 dark:bg-stone-800/60 border border-orange-100/70 dark:border-stone-700 p-3.5 text-left transition hover:bg-orange-50 dark:hover:bg-stone-800 hover:border-orange-200 dark:hover:border-stone-600 cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-orange-800/80 dark:text-orange-300">
                  Station
                </div>
                <div className="font-[Sora] text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {t.from}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                  {t.fromCode && (
                    <span className="font-mono text-[10px] font-bold bg-white dark:bg-stone-900 px-1.5 py-0.5 rounded border border-orange-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-200">
                      {t.fromCode}
                    </span>
                  )}
                  <span>{t.adults || 1} Person(s)</span>
                  <span>·</span>
                  <span className="text-orange-700 dark:text-orange-400 font-semibold">
                    2 hrs validity
                  </span>
                </div>
              </div>
              <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-xs group-hover:scale-105 transition-transform">
                <FaTicket className="h-5 w-5" />
              </div>
            </button>
          ) : (
            /* Journey Ticket Layout: Preserved railway route */
            <button
              type="button"
              onClick={onOpen}
              className="flex w-full items-center justify-between text-left cursor-pointer group py-1"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  From
                </div>
                <div className="font-[Sora] text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {t.from}
                </div>
                {t.fromCode && (
                  <div className="text-[10px] font-mono font-medium text-muted-foreground">
                    {t.fromCode}
                  </div>
                )}
              </div>
              <div className="mx-2 bg-railway-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-xs group-hover:scale-105 transition-transform">
                <FaTrain className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  To
                </div>
                <div className="font-[Sora] text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {t.to}
                </div>
                {t.toCode && (
                  <div className="text-[10px] font-mono font-medium text-muted-foreground">
                    {t.toCode}
                  </div>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Lower Info & Actions Region (Pinned to bottom for equal outer heights) */}
        <div className="mt-auto pt-3">
          <div className="mb-3.5 h-px bg-gradient-to-r from-transparent via-orange-300/60 dark:via-orange-700/60 to-transparent" />
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isPlatform ? "Valid for 2 hours only" : "Valid until"}
              </div>
              <div className="font-semibold text-stone-800 dark:text-stone-200 text-[11px] sm:text-xs">
                {new Date(t.validUntil).toLocaleString([], {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Fare
              </div>
              <div className="font-[Sora] font-bold text-sm sm:text-base text-orange-600 dark:text-orange-400">
                {formatINR(t.fare)}
              </div>
            </div>
          </div>

          {/* Bottom Row: Status Badge bottom-left and View Details button bottom-right */}
          <div className="mt-4 flex items-center justify-between gap-3 pt-1">
            <StatusBadge status={t.status} />
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex h-10 sm:h-11 items-center justify-center gap-1.5 rounded-full border border-orange-300/90 dark:border-stone-700 bg-orange-50/70 dark:bg-stone-800 px-4 text-xs font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-stone-700 hover:border-orange-400 dark:hover:border-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer transition-all shadow-2xs active:scale-[0.98]"
            >
              View details →
            </button>
          </div>
        </div>
      </div>
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
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-orange-100 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-stone-900 dark:text-stone-100 py-2 px-3 text-sm outline-none focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-300/50"
      />
    </div>
  );
}

function EmptyState({ tab, hasQuery }: { tab: TabKey; hasQuery: boolean }) {
  const map: Record<TabKey, { icon: React.ReactNode; title: string; desc: string }> = {
    active: {
      icon: <FaTicket />,
      title: "No active journeys available.",
      desc: "Book a ticket and your active QR will appear here instantly.",
    },
    expired: {
      icon: <FaCalendarXmark />,
      title: "No completed journeys found.",
      desc: "Tickets you've used or that have expired will appear here.",
    },
    cancelled: {
      icon: <FaCircleXmark />,
      title: "No cancelled tickets found.",
      desc: "Tickets you cancel will be archived in this tab.",
    },
  };
  const m = map[tab];
  return (
    <div className="glass rounded-3xl p-12 text-center shadow-soft">
      <div className="bg-railway-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
        {m.icon}
      </div>
      <h2 className="mt-4 font-[Sora] text-xl font-bold">
        {hasQuery ? "No tickets match your filters." : m.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasQuery ? "Try clearing search or filters." : m.desc}
      </p>
      {tab === "active" && !hasQuery && (
        <Link
          to="/dashboard/journey"
          className="bg-railway-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
        >
          Book a ticket <FaArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
