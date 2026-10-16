import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FaTicket, FaArrowRight } from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, computeStatus, CATEGORY_LABEL, type Ticket } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "Booking history · RailConnect" }] }),
  component: HistoryPage,
});

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    active:
      "bg-emerald-50 text-emerald-700 border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    expired:
      "bg-red-50/80 text-red-700 border border-red-300/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    cancelled:
      "bg-rose-50 text-rose-700 border border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  } as const;

  const currentStyle = map[status] || map.expired;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-2xs ${currentStyle}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
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

function HistoryPage() {
  const { user } = useAuth();
  const rawTickets = useMemo(() => (user ? loadTickets(user.id) : []), [user]);
  const tickets = useMemo(
    () => rawTickets.map((t) => ({ ...t, status: computeStatus(t) })),
    [rawTickets],
  );

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  const counts = useMemo(
    () => ({
      all: tickets.length,
      active: tickets.filter((t) => t.status === "active").length,
      expired: tickets.filter((t) => t.status === "expired").length,
    }),
    [tickets],
  );

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
  ] as const;

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        t.from.toLowerCase().includes(s) ||
        t.to.toLowerCase().includes(s) ||
        t.pnr.toLowerCase().includes(s) ||
        (t.line && t.line.toLowerCase().includes(s))
      );
    });
  }, [tickets, filter, q]);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Booking history</h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-stone-400">
          Every ticket you've booked, in one place.
        </p>
      </div>

      <div className="glass rounded-3xl p-4 sm:p-5 shadow-soft">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder="Search by PNR, station or line…"
            className="w-full flex-1 min-w-0"
          />
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">
            {tabs.map((t) => {
              const selected = filter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilter(t.key)}
                  className={`relative flex items-center justify-center min-w-0 rounded-full px-2 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                    selected
                      ? "bg-railway-gradient text-white shadow-soft border-2 border-orange-500"
                      : "bg-white/95 text-stone-900 border border-stone-300 hover:border-stone-400 hover:bg-white dark:bg-stone-800/80 dark:text-stone-200 dark:border-stone-700 dark:hover:bg-stone-700"
                  }`}
                >
                  <span className="truncate">{t.label}</span>
                  <span
                    className={`ml-1 sm:ml-2 inline-flex h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] shrink-0 items-center justify-center rounded-full px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-bold ${
                      selected
                        ? "bg-white/25 text-white border border-white/30"
                        : "bg-orange-50 text-stone-900 border border-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:border-stone-600"
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 sm:p-10 text-center">
              <div className="bg-railway-gradient mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft mb-3">
                <FaTicket className="h-5 w-5" />
              </div>
              <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                No booking history yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground dark:text-stone-400 max-w-sm mx-auto">
                Every ticket, pass and platform ticket you book will be archived here.
              </p>
              <Link
                to="/dashboard/journey"
                className="bg-railway-gradient mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-soft transition hover:shadow-glow"
              >
                Book a journey <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 sm:p-10 text-center">
              <p className="text-sm font-medium text-muted-foreground dark:text-stone-400">
                No bookings match your search.
              </p>
            </div>
          ) : (
            filtered.map((t) => {
              const isPlatform = t.type === "platform";
              const title = isPlatform ? `Platform Ticket · ${t.from}` : `${t.from} → ${t.to}`;
              const metaParts = [
                isPlatform
                  ? "Platform Ticket"
                  : t.type === "season"
                    ? "Season Pass"
                    : "Journey Ticket",
                !isPlatform && t.category
                  ? CATEGORY_LABEL[t.category]
                  : isPlatform
                    ? `${t.adults || 1} Person(s)`
                    : "Passenger",
                t.line ? `${t.line} Zone` : "Western Zone",
                t.pnr,
                new Date(t.createdAt).toLocaleDateString(),
              ].filter(Boolean);

              return (
                <Link
                  key={t.id}
                  to="/dashboard/ticket"
                  search={{ id: t.id }}
                  className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-stone-900/80 dark:border dark:border-stone-800 p-3 sm:p-3.5 shadow-2xs hover:bg-white dark:hover:bg-stone-800 hover:shadow-soft transition-all gap-2.5 sm:gap-3 group cursor-pointer"
                >
                  {/* Left Section: Orange circular ticket icon */}
                  <div className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-xs group-hover:scale-105 transition-transform">
                    <FaTicket className="h-4 w-4" />
                  </div>

                  {/* Centre Section: Ticket information */}
                  <div className="min-w-0 flex-1">
                    <div className="font-[Sora] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug truncate sm:whitespace-normal">
                      {title}
                    </div>
                    <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                      {metaParts.join(" · ")}
                    </div>
                  </div>

                  {/* Right Section: Amount and Status */}
                  <div className="shrink-0 flex flex-col items-end text-right">
                    <div className="font-[Sora] text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                      {formatINR(t.fare)}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
