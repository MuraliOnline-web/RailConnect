import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaTrain, FaArrowRight } from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, CATEGORY_LABEL } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "Booking history · RailConnect" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const tickets = useMemo(() => (user ? loadTickets(user.id) : []), [user]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  const filtered = tickets.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      t.from.toLowerCase().includes(s) ||
      t.to.toLowerCase().includes(s) ||
      t.pnr.toLowerCase().includes(s) ||
      t.line.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Booking history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every ticket you've booked, in one place.</p>
      </div>

      <div className="glass rounded-3xl p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder="Search by PNR, station or line…"
            className="flex-1"
          />
          <div className="flex gap-2">
            {(["all", "active", "expired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  filter === f ? "bg-railway-gradient text-white shadow-soft" : "bg-white/80 text-foreground/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-10 text-center">
              <p className="text-sm text-muted-foreground">No bookings match your search.</p>
              <Link to="/dashboard/journey" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline">
                Book a journey <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/80 p-4 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
                    <FaTrain />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.from} → {t.to}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.type} · {t.category ? CATEGORY_LABEL[t.category] : "Passenger"} · {t.line} · {t.pnr} · {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-[Sora] text-sm font-bold">{formatINR(t.fare)}</div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      t.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
