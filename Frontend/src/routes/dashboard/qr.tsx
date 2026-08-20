import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { FaQrcode, FaTrain, FaArrowRight, FaShieldHalved } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, CATEGORY_LABEL } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/qr")({
  head: () => ({ meta: [{ title: "QR ticket · RailConnect" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: QrPage,
});

function QrPage() {
  const { user } = useAuth();
  const { id } = Route.useSearch();
  const active = useMemo(
    () => (user ? loadTickets(user.id).filter((t) => t.status === "active") : []),
    [user],
  );
  const t = (id ? active.find((x) => x.id === id) : undefined) ?? active[0];

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">QR ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">Show this QR at the gate to scan and board.</p>
      </div>

      {!t ? (
        <div className="glass rounded-3xl p-10 text-center shadow-soft">
          <div className="bg-railway-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
            <FaQrcode />
          </div>
          <h2 className="mt-4 font-[Sora] text-xl font-bold">No active ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">Book a ticket to generate your QR.</p>
          <Link
            to="/dashboard/journey"
            className="bg-railway-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            Book journey <FaArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md"
        >
          <div className="glass overflow-hidden rounded-3xl p-1 shadow-glow">
            <div className="rounded-[1.4rem] bg-white p-6 text-center">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                <span className="font-semibold">{t.type} · {t.line}</span>
                <span>{t.pnr}</span>
              </div>

              {/* QR placeholder */}
              <div className="relative mx-auto mt-5 flex h-56 w-56 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 ring-1 ring-orange-200">
                <QrSvg seed={t.pnr} />
                <motion.div
                  aria-hidden
                  initial={{ y: 0 }}
                  animate={{ y: [0, 180, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute left-4 right-4 top-4 h-0.5 bg-orange-500/70 blur-[1px]"
                />
              </div>

              <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

              <div className="grid grid-cols-2 gap-3 text-left">
                <Info k="From" v={t.from} />
                <Info k="To" v={t.to} />
                <Info k="Category" v={t.category ? CATEGORY_LABEL[t.category] : "Passenger"} />
                <Info k="Passengers" v={`${t.adults}A · ${t.children}C`} />
                <Info k="Issued" v={new Date(t.createdAt).toLocaleString()} />
                <Info k="Valid until" v={new Date(t.validUntil).toLocaleString()} />
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <FaShieldHalved /> Verified by RailConnect
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-700">
                  <FaTrain />
                  <span className="text-xs font-semibold uppercase tracking-wider">Ready to board</span>
                </div>
                <div className="font-[Sora] text-lg font-bold text-railway-gradient">{formatINR(t.fare)}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardShell>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-orange-50/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold">{v}</div>
    </div>
  );
}

// Deterministic pseudo-QR pattern from PNR
function QrSvg({ seed }: { seed: string }) {
  const size = 21;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  const isFinder = (x: number, y: number) => {
    const inBox = (cx: number, cy: number) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        if (isFinder(x, y)) return null;
        if (!cells[i]) return null;
        return <rect key={i} x={x} y={y} width={1} height={1} fill="#1a1a1a" />;
      })}
      {[[0, 0], [size - 7, 0], [0, size - 7]].map(([fx, fy], i) => (
        <g key={i}>
          <rect x={fx} y={fy} width={7} height={7} fill="#e8470e" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="white" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#1a1a1a" />
        </g>
      ))}
    </svg>
  );
}
