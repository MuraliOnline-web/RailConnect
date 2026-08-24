import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaReceipt, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { SearchField } from "../../components/SearchField";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTxns } from "../../lib/wallet";
import { formatINR, formatSignedINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({ meta: [{ title: "Transactions · RailConnect" }] }),
  component: TxnPage,
});

function TxnPage() {
  const { user } = useAuth();
  const txns = useMemo(() => (user ? loadTxns(user.id) : []), [user]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "recharge" | "booking" | "refund">("all");
  const [range, setRange] = useState<"all" | "today" | "7d" | "30d" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            In view
          </div>
          <div className="mt-1 font-[Sora] text-2xl font-extrabold">{filtered.length}</div>
        </div>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credits
          </div>
          <div className="mt-1 font-[Sora] text-2xl font-extrabold text-emerald-600">
            +{formatINR(totals.credit)}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debits
          </div>
          <div className="mt-1 font-[Sora] text-2xl font-extrabold">−{formatINR(totals.debit)}</div>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder="Search by transaction id, method or note…"
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            {(["all", "recharge", "booking", "refund"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  filter === f
                    ? "bg-railway-gradient text-white shadow-soft"
                    : "bg-white/80 text-foreground/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </span>
          {(
            [
              ["all", "All time"],
              ["today", "Today"],
              ["7d", "Last 7d"],
              ["30d", "Last 30d"],
              ["custom", "Custom"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                range === k
                  ? "bg-orange-500 text-white shadow-soft"
                  : "bg-white/80 text-foreground/70 hover:bg-white"
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
              No transactions yet.
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white/80 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                      t.type === "refund"
                        ? "bg-sky-500"
                        : t.amount >= 0
                          ? "bg-emerald-500"
                          : "bg-railway-gradient"
                    }`}
                  >
                    {t.amount >= 0 ? <FaArrowDown /> : <FaArrowUp />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold capitalize">
                      {t.note}
                      <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                        {t.type}
                      </span>
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.ref} · {t.method} · {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-[Sora] text-sm font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-foreground"}`}
                  >
                    {formatSignedINR(t.amount)}
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      t.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : t.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
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
