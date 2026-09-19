import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FaArrowRight, FaTrainSubway } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { STATIONS, calcFare } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";
import { StationSearch } from "../../components/StationSearch";
import { savePaymentDraft } from "../../lib/payment";

export const Route = createFileRoute("/dashboard/platform")({
  head: () => ({ meta: [{ title: "Platform ticket · RailConnect" }] }),
  component: PlatformPage,
});

function PlatformPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [station, setStation] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);

  const stationObj = STATIONS.find((s) => s.code === station);
  
  const fare = useMemo(() => {
    if (!station) return 0;
    return calcFare({
      fromCode: station,
      toCode: station,
      type: "platform",
      classType: "2nd",
      adults,
      children,
    });
  }, [station, adults, children]);

  const onBook = async () => {
    if (!user || !stationObj) return;
    setLoading(true);
    savePaymentDraft({
      userId: user.id,
      type: "platform",
      fromCode: station,
      toCode: station,
      fromName: stationObj.name,
      toName: stationObj.name,
      line: stationObj.line,
      classType: "2nd",
      adults,
      children,
      fare,
      delivery: "digital",
      createdAt: new Date().toISOString(),
    });
    navigate({ to: "/dashboard/payment" });
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">
          <span className="text-railway-gradient">P</span>latform <span className="text-railway-gradient">T</span>icket
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Valid for 2 hours at the selected station.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <Field label="Station">
            <StationSearch
              value={station}
              onChange={setStation}
              placeholder="Select station / Search station"
            />
          </Field>

          <div className="mt-6">
            <Field label="Passengers">
              <div className="flex gap-2">
                <Counter label="Adults" value={adults} setValue={setAdults} min={1} />
                <Counter label="Children" value={children} setValue={setChildren} min={0} />
              </div>
            </Field>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft h-fit">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${stationObj ? 'bg-railway-gradient' : 'bg-orange-200'}`}>
              <FaTrainSubway />
            </div>
            <div>
              <div className="font-[Sora] text-lg font-bold">
                {stationObj ? stationObj.name : "Not selected"}
              </div>
              <div className="text-xs text-muted-foreground">
                {stationObj ? `${stationObj.line} line` : "Select a station"}
              </div>
            </div>
          </div>
          
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
          
          <div className="my-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Adults</span>
              <span className="font-semibold">{adults}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Children</span>
              <span className="font-semibold">{children}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-orange-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              Total fare
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {stationObj ? formatINR(fare) : "—"}
            </div>
          </div>
          
          <button
            onClick={onBook}
            disabled={loading || !stationObj || adults < 1}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Processing…" : "Confirm & pay"} <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-orange-950/70">
        {label}
      </div>
      {children}
    </div>
  );
}

function Counter({
  label,
  value,
  setValue,
  min = 0,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex flex-1 items-center justify-between rounded-xl border border-black bg-white/80 px-3 py-2">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-[Sora] text-lg font-bold leading-none">{value}</div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-700 transition disabled:opacity-40"
        >
          −
        </button>
        <button
          onClick={() => setValue(value + 1)}
          className="bg-railway-gradient flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:shadow-md"
        >
          +
        </button>
      </div>
    </div>
  );
}
