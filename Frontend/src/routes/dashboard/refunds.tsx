import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FaArrowDown, FaRotateLeft, FaArrowRight } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTxns } from "../../lib/wallet";
import { formatINR, formatSignedINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/refunds")({
  head: () => ({ meta: [{ title: "Refunds · RailConnect" }] }),
  component: RefundsPage,
});

function RefundsPage() {
  const { user } = useAuth();
  const txns = useMemo(() => (user ? loadTxns(user.id).filter((t) => t.type === "refund") : []), [user]);
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const [range, setRange] = useState<"all" | "today" | "7d" | "30d" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    const fromTs = range === "today" ? now - day
      : range === "7d" ? now - 7 * day
      : range === "30d" ? now - 30 * day
      : range === "custom" && from ? new Date(from).getTime() : null;
    const toTs = range === "custom" && to ? new Date(to).getTime() + day : null;
    return txns.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      const ts = new Date(t.createdAt).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });
  }, [txns, status, range, from, to]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <DashboardShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Refunds</h1>
          <p className="mt-1 text-sm text-muted-foreground">All cancellation refunds credited to your wallet.</p>
        </div>
        <Link to="/dashboard/wallet" className="text-xs font-semibold text-orange-700 hover:underline">
          Wallet <FaArrowRight className="inline h-2.5 w-2.5" />
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Refunds in view" value={filtered.length.toString()} />
        <Stat label="Total refunded" value={formatINR(total)} accent />
        <Stat label="Lifetime refunds" value={txns.length.toString()} />
      </div>

      <div className="glass rounded-3xl p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
          {(["all", "success", "pending", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                status === s ? "bg-railway-gradient text-white shadow-soft" : "bg-white/80 text-foreground/70 hover:bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</span>
          {([
            ["all", "All time"],
            ["today", "Today"],
            ["7d", "Last 7d"],
            ["30d", "Last 30d"],
            ["custom", "Custom"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                range === k ? "bg-orange-500 text-white shadow-soft" : "bg-white/80 text-foreground/70 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
          {range === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-orange-100 bg-white/90 px-2 py-1 text-xs outline-none focus:border-orange-300"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-orange-100 bg-white/90 px-2 py-1 text-xs outline-none focus:border-orange-300"
              />
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-10 text-center text-sm text-muted-foreground">
              <FaRotateLeft className="mx-auto mb-2 h-5 w-5 text-orange-400" />
              No refunds match your filters.
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                    <FaArrowDown />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.note}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.ref} · {new Date(t.createdAt).toLocaleString()}
                    </div>
                    {(t.originalFare || t.refundPercent) && (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Original {formatINR(t.originalFare ?? 0)} · charge {formatINR(t.cancellationCharge ?? 0)} ·{" "}
                        {t.refundPercent ?? 0}% refund
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                  <div className="font-[Sora] text-sm font-bold text-emerald-600">{formatSignedINR(t.amount)}</div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      t.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : t.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.ticketId && (
                    <Link
                      to="/dashboard/ticket"
                      search={{ id: t.ticketId } as never}
                      className="text-[11px] font-semibold text-orange-700 hover:underline"
                    >
                      View ticket
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-[Sora] text-2xl font-extrabold ${accent ? "text-emerald-600" : ""}`}>{value}</div>
    </div>
  );
}
