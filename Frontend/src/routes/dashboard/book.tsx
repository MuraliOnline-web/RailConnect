import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaTrain } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { STATIONS, calcFare, type Ticket } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";
import { savePaymentDraft } from "../../lib/payment";
import { Counter } from "../../components/Counter";

export const Route = createFileRoute("/dashboard/book")({
  head: () => ({ meta: [{ title: "Book ticket · RailConnect" }] }),
  component: BookPage,
});

function BookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<Ticket["type"]>("journey");
  const [from, setFrom] = useState("AD");
  const [to, setTo] = useState("CCG");
  const [classType, setClassType] = useState<"1st" | "2nd">("2nd");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const fare = useMemo(
    () => calcFare({ fromCode: from, toCode: to, type, classType, adults, children }),
    [from, to, type, classType, adults, children],
  );

  const fromS = STATIONS.find((s) => s.code === from)!;
  const toS = STATIONS.find((s) => s.code === to)!;

  const onBook = () => {
    if (!user) return;
    savePaymentDraft({
      userId: user.id,
      type,
      fromCode: fromS.code,
      toCode: type === "platform" ? fromS.code : toS.code,
      fromName: fromS.name,
      toName: type === "platform" ? fromS.name : toS.name,
      line: fromS.line,
      classType,
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
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Book a ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paperless tickets, valid the moment you tap book.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {(["journey", "season", "platform"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  type === t
                    ? "bg-railway-gradient text-white shadow-soft"
                    : "bg-white/80 dark:bg-stone-800 text-foreground/70 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700"
                }`}
              >
                {t === "journey" ? "Journey" : t === "season" ? "Season pass" : "Platform"}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="From">
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-orange-100 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-4 py-3 text-sm outline-none focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-300/50"
              >
                {STATIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </Field>
            {type !== "platform" && (
              <Field label="To">
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border border-orange-100 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-4 py-3 text-sm outline-none focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-300/50"
                >
                  {STATIONS.filter((s) => s.code !== from).map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Class">
              <div className="grid grid-cols-2 gap-2">
                {(["2nd", "1st"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setClassType(c)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      classType === c
                        ? "border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-stone-800 text-orange-700 dark:text-orange-400"
                        : "border-orange-100 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 text-foreground/70 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800"
                    }`}
                  >
                    {c === "2nd" ? "2nd class" : "1st class"}
                  </button>
                ))}
              </div>
            </Field>
            {type !== "platform" && (
              <Field label="Passengers">
                <div className="flex gap-2">
                  <Counter label="Adults" value={adults} setValue={setAdults} min={1} />
                  <Counter label="Children" value={children} setValue={setChildren} min={0} />
                </div>
              </Field>
            )}
          </div>
        </div>

        {/* Summary */}
        <motion.div layout className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Booking summary
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="font-[Sora] text-xl font-bold text-foreground">{fromS.name}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {fromS.code}
              </div>
            </div>
            <div className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-full text-white">
              <FaTrain />
            </div>
            <div className="text-right">
              <div className="font-[Sora] text-xl font-bold text-foreground">
                {type === "platform" ? "—" : toS.name}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {type === "platform" ? "Platform" : toS.code}
              </div>
            </div>
          </div>
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-700 to-transparent" />
          <Row k="Type" v={type} />
          <Row k="Class" v={classType === "2nd" ? "2nd class" : "1st class"} />
          {type !== "platform" && <Row k="Passengers" v={`${adults} adult · ${children} child`} />}
          <Row k="Line" v={fromS.line} />
          <div className="mt-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 p-4 border border-orange-100/60 dark:border-stone-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              Total fare
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {formatINR(fare)}
            </div>
          </div>
          <button
            onClick={onBook}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
          >
            Proceed to payment <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold capitalize">{v}</span>
    </div>
  );
}
