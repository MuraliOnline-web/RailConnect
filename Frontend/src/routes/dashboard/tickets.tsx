import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTrain,
  FaArrowRight,
  FaFilePdf,
  FaQrcode,
  FaMagnifyingGlass,
  FaSliders,
  FaTicket,
  FaCircleXmark,
  FaCalendarXmark,
} from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, CATEGORY_LABEL, type Ticket, type TrainCategory } from "../../lib/tickets";
import { downloadTicketAndNotify } from "../../lib/ticketPdf";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/tickets")({
  head: () => ({ meta: [{ title: "My tickets · RailConnect" }] }),
  component: TicketsPage,
});

type TabKey = "active" | "expired" | "cancelled";
type DateRange = "all" | "today" | "7d" | "30d" | "custom";

const PAGE_SIZE = 8;

function TicketsPage() {
  const { user } = useAuth();
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

  const visible = filtered.slice(0, limit);

  return (
    <DashboardShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">My tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage every active, expired and cancelled journey.
          </p>
        </div>
        <Link
          to="/dashboard/journey"
          className="bg-railway-gradient inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
        >
          New <FaArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(
          [
            { key: "active", label: "Active" },
            { key: "expired", label: "Expired" },
            { key: "cancelled", label: "Cancelled" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => {
          const selected = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                selected
                  ? "bg-railway-gradient text-white shadow-soft"
                  : "bg-white/80 text-foreground/70 hover:bg-white"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${
                  selected ? "bg-white/25 text-white" : "bg-orange-50 text-orange-700"
                }`}
              >
                {counts[t.key]}
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
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
              showFilters
                ? "bg-railway-gradient text-white shadow-soft"
                : "border border-orange-200 bg-white text-orange-700"
            }`}
          >
            <FaSliders className="h-3 w-3" /> Filters
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
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FilterGroup label="Train category">
                  {(["all", "passenger", "mail_express", "superfast"] as const).map((c) => (
                    <Chip key={c} selected={fCategory === c} onClick={() => setFCategory(c)}>
                      {c === "all" ? "All" : CATEGORY_LABEL[c as TrainCategory]}
                    </Chip>
                  ))}
                </FilterGroup>
                <FilterGroup label="Ticket type">
                  {(["all", "journey", "season", "platform"] as const).map((c) => (
                    <Chip key={c} selected={fType === c} onClick={() => setFType(c)}>
                      {c}
                    </Chip>
                  ))}
                </FilterGroup>
                <FilterGroup label="Date range">
                  {(["all", "today", "7d", "30d", "custom"] as const).map((c) => (
                    <Chip key={c} selected={fRange === c} onClick={() => setFRange(c)}>
                      {c === "all" ? "All" : c === "7d" ? "Last 7d" : c === "30d" ? "Last 30d" : c}
                    </Chip>
                  ))}
                </FilterGroup>
                {fRange === "custom" && (
                  <div className="sm:col-span-2 lg:col-span-3 grid gap-3 sm:grid-cols-2">
                    <DateField label="From" value={fFrom} onChange={setFFrom} />
                    <DateField label="To" value={fTo} onChange={setFTo} />
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
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {visible.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
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
                  className="rounded-full border border-orange-200 bg-white px-5 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"
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
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${map[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "expired" ? "bg-gray-400" : "bg-rose-500"}`}
      />
      {status}
    </span>
  );
}

function TicketCard({ t, onOpen }: { t: Ticket; onOpen: () => void }) {
  return (
    <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft transition hover:shadow-glow">
      <div className="rounded-[1.4rem] bg-white p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="font-semibold">
            {t.type} · {t.line}
          </span>
          <span className="font-mono">{t.pnr}</span>
        </div>
        {t.category && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
            {CATEGORY_LABEL[t.category]}
          </div>
        )}
        <button onClick={onOpen} className="mt-4 flex w-full items-end justify-between text-left">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-[Sora] text-xl font-bold">{t.from}</div>
            {t.fromCode && (
              <div className="text-[10px] font-mono text-muted-foreground">{t.fromCode}</div>
            )}
          </div>
          <div className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-full text-white">
            <FaTrain />
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">To</div>
            <div className="font-[Sora] text-xl font-bold">{t.to}</div>
            {t.toCode && (
              <div className="text-[10px] font-mono text-muted-foreground">{t.toCode}</div>
            )}
          </div>
        </button>
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-muted-foreground">Valid until</div>
            <div className="font-semibold">{new Date(t.validUntil).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Fare</div>
            <div className="font-[Sora] font-bold text-railway-gradient">{formatINR(t.fare)}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={t.status} />
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700 hover:bg-orange-100"
          >
            View details →
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          {t.status === "active" && t.delivery !== "print" && (
            <Link
              to="/dashboard/qr"
              search={{ id: t.id } as never}
              className="bg-railway-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-soft"
            >
              <FaQrcode /> Show QR
            </Link>
          )}
          <button
            onClick={() => downloadTicketAndNotify(t, t.userId)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
              t.status === "active" && t.delivery !== "print"
                ? "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                : "bg-railway-gradient text-white shadow-soft"
            }`}
          >
            <FaFilePdf /> PDF
          </button>
        </div>
        {t.status === "active" && (
          <button
            onClick={onOpen}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <FaCircleXmark /> Cancel ticket
          </button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider capitalize transition ${
        selected
          ? "bg-railway-gradient text-white shadow-soft"
          : "border border-orange-100 bg-white text-foreground/70 hover:bg-orange-50"
      }`}
    >
      {children}
    </button>
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
        className="w-full rounded-xl border border-orange-100 bg-white/90 py-2 px-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
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
