import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FaArrowRight, FaTrainSubway } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { STATIONS, calcFare, makePnr, saveTicket } from "../../lib/tickets";
import { makeRef, saveTxn } from "../../lib/wallet";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/platform")({
  head: () => ({ meta: [{ title: "Platform ticket · RailConnect" }] }),
  component: PlatformPage,
});

function PlatformPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [station, setStation] = useState("CCG");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const stationObj = STATIONS.find((s) => s.code === station)!;
  const fare =
    calcFare({
      fromCode: station,
      toCode: station,
      type: "platform",
      classType: "2nd",
      adults: 1,
      children: 0,
    }) * count;

  const onBook = async () => {
    if (!user) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = new Date();
    const valid = new Date(now);
    valid.setHours(valid.getHours() + 2);
    saveTicket({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "platform",
      from: stationObj.name,
      to: stationObj.name,
      line: stationObj.line,
      classType: "2nd",
      adults: count,
      children: 0,
      fare,
      createdAt: now.toISOString(),
      validUntil: valid.toISOString(),
      status: "active",
      pnr: makePnr(),
    });
    saveTxn({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "booking",
      amount: -fare,
      status: "success",
      method: "UPI",
      ref: makeRef(),
      note: `Platform ticket · ${stationObj.name}`,
      createdAt: now.toISOString(),
    });
    setLoading(false);
    navigate({ to: "/dashboard/tickets" });
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Platform ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Valid for 2 hours at the selected station.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Station
          </div>
          <select
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="mt-2 w-full rounded-xl border border-orange-100 bg-white/90 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
          >
            {STATIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code}) · {s.line}
              </option>
            ))}
          </select>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/80 p-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tickets
              </div>
              <div className="font-[Sora] text-2xl font-bold">{count}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="h-9 w-9 rounded-full bg-orange-50 text-orange-700"
              >
                −
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="bg-railway-gradient h-9 w-9 rounded-full text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <FaTrainSubway />
            </div>
            <div>
              <div className="font-[Sora] text-lg font-bold">{stationObj.name}</div>
              <div className="text-xs text-muted-foreground">{stationObj.line} line</div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-orange-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              Total fare
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {formatINR(fare)}
            </div>
          </div>
          <button
            onClick={onBook}
            disabled={loading}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70"
          >
            {loading ? "Issuing…" : "Confirm & pay"} <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
