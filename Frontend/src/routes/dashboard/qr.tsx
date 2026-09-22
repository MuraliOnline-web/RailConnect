import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaQrcode,
  FaTrain,
  FaShieldHalved,
  FaDownload,
  FaRotateRight,
  FaCircleXmark,
  FaArrowDown,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, CATEGORY_LABEL, cancelTicket, type Ticket } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";
import { downloadTicketAndNotify } from "../../lib/ticketPdf";
import { getPaymentLabel } from "../../lib/payment";

export const Route = createFileRoute("/dashboard/qr")({
  head: () => ({ meta: [{ title: "QR ticket · RailConnect" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: QrPage,
});

function QrPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const [version, setVersion] = useState(0);

  const active = useMemo(
    () => (user ? loadTickets(user.id).filter((t) => t.status === "active") : []),
    [user, version],
  );
  const allTickets = useMemo(() => (user ? loadTickets(user.id) : []), [user, version]);
  const t = id ? allTickets.find((x) => x.id === id) : active[0];

  if (!t) {
    return (
      <DashboardShell>
        <div className="mb-6">
          <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">QR Ticket</h1>
        </div>
        <div className="glass rounded-3xl p-10 text-center shadow-soft max-w-lg mx-auto">
          <div className="bg-railway-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
            <FaQrcode />
          </div>
          <h2 className="mt-4 font-[Sora] text-xl font-bold">No Active Ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your active QR ticket will appear here after booking.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const onCancel = () => {
    navigate({ to: "/dashboard/ticket", search: { id: t.id } as never });
  };

  const onBookAgain = () => {
    navigate({
      to: "/dashboard/journey",
      search: {
        from: t.fromCode,
        to: t.toCode,
        category: t.category,
        adults: t.adults,
        children: t.children,
      } as never,
    });
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">QR Ticket</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-5xl"
      >
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* PRIMARY QR AREA */}
          <div className="lg:col-span-5 glass overflow-hidden rounded-3xl p-1 shadow-soft flex flex-col h-full">
            <div className="rounded-t-[1.4rem] bg-orange-50/50 p-4 px-6 border-b border-orange-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Digital Journey Ticket
                </div>
                <div className="font-[Sora] text-sm font-extrabold text-foreground">
                  Ticket Reference: {t.pnr || t.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>

            <div className="rounded-b-[1.4rem] bg-white p-8 text-center flex-1 flex flex-col items-center justify-center">
              <div className="mb-4">
                <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 ring-1 ring-orange-200">
                  <QrSvg seed={t.pnr} />
                </div>
              </div>

              <h3 className="mt-6 font-[Sora] text-xl font-extrabold text-foreground tracking-tight">
                SCAN TO VERIFY
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Show this QR code for ticket verification.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* JOURNEY INFORMATION */}
              <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft flex flex-col h-full">
                <div className="rounded-[1.4rem] bg-white p-6 flex-1 flex flex-col">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Journey
                  </div>

                  <div className="flex-1 flex flex-col justify-center relative pl-6">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-[7px] top-[14px] bottom-[14px] w-px bg-orange-200"></div>

                    <div className="relative">
                      {/* Station Dot */}
                      <div className="absolute left-[-24px] top-4 h-4 w-4 rounded-full border-[3px] border-orange-100 bg-orange-500"></div>
                      <div className="font-[Sora] text-xl font-extrabold text-foreground">
                        {t.from}
                      </div>
                      {t.fromCode && (
                        <div className="text-sm font-semibold text-muted-foreground">
                          {t.fromCode}
                        </div>
                      )}
                    </div>

                    <div className="h-4"></div>

                    <div className="relative">
                      {/* Station Dot */}
                      <div className="absolute left-[-24px] top-4 h-4 w-4 rounded-full border-[3px] border-orange-100 bg-foreground"></div>
                      <div className="font-[Sora] text-xl font-extrabold text-foreground">
                        {t.to}
                      </div>
                      {t.toCode && (
                        <div className="text-sm font-semibold text-muted-foreground">
                          {t.toCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 text-sm font-semibold text-muted-foreground flex flex-col gap-3">
                    <div className="flex items-center gap-2 uppercase tracking-wider">
                      <FaTrain className="text-orange-500" />
                      {t.line}
                    </div>
                    {(t.via || t.distanceKm || t.journeyType) && (
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                        {t.via && (
                          <div>
                            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px] block mb-0.5">
                              Via
                            </span>{" "}
                            <span className="font-bold text-foreground">{t.via}</span>
                          </div>
                        )}
                        {t.distanceKm && (
                          <div>
                            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px] block mb-0.5">
                              Distance
                            </span>{" "}
                            <span className="font-bold text-foreground">{t.distanceKm} KM</span>
                          </div>
                        )}
                        {t.journeyType && (
                          <div>
                            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px] block mb-0.5">
                              Journey Type
                            </span>{" "}
                            <span className="font-bold text-foreground">{t.journeyType}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PASSENGER INFORMATION */}
              <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft flex flex-col h-full">
                <div className="rounded-[1.4rem] bg-white p-6 flex-1 flex flex-col">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Passengers
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex justify-between items-center rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Adults
                      </span>
                      <span className="font-[Sora] text-xl font-extrabold text-foreground">
                        {t.adults}
                      </span>
                    </div>
                    <div className="flex justify-between items-center rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Children
                      </span>
                      <span className="font-[Sora] text-xl font-extrabold text-foreground">
                        {t.children}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TICKET INFORMATION */}
            <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft">
              <div className="rounded-[1.4rem] bg-white p-6">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Ticket Details
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <KV
                    k="Ticket Type"
                    v={
                      t.type === "journey"
                        ? "Journey Ticket"
                        : t.type === "season"
                          ? "Season Ticket"
                          : "Platform Ticket"
                    }
                  />
                  <KV
                    k="Train Category"
                    v={t.category ? CATEGORY_LABEL[t.category] : "Passenger"}
                  />
                  <KV k="Class" v={t.classType === "1st" ? "First Class" : "Second Class"} />

                  <KV k="Ticket Reference" v={t.pnr || t.id.slice(0, 8).toUpperCase()} mono />
                  <KV k="Transaction ID" v={t.txnId || "—"} mono />
                  {t.journeyType && <KV k="Journey Type" v={t.journeyType} />}

                  <KV k="Booked On" v={formatDateTime(t.createdAt)} />
                  <KV k="Valid Until" v={formatDateTime(t.validUntil)} />
                  {t.paymentMethod && (
                    <KV k="Payment Method" v={getPaymentLabel(t.paymentMethod)} />
                  )}
                </div>

                {t.validityRule && (
                  <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Journey Validity
                    </div>
                    <div className="text-sm font-semibold text-foreground/80">{t.validityRule}</div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-50/60 p-5">
                  <div className="text-sm font-semibold uppercase tracking-wider text-orange-700">
                    Total Fare
                  </div>
                  <div className="font-[Sora] text-2xl font-extrabold text-railway-gradient">
                    {formatINR(t.fare)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`mt-6 grid grid-cols-1 gap-4 ${t.status === "active" ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          <button
            onClick={() => downloadTicketAndNotify(t, user?.id)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3.5 text-sm font-semibold text-orange-700 shadow-sm transition-colors hover:bg-orange-50"
          >
            <FaDownload /> Download Ticket
          </button>

          <button
            onClick={onBookAgain}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3.5 text-sm font-semibold text-foreground/80 shadow-sm transition-colors hover:bg-orange-50/50"
          >
            <FaRotateRight /> Book Again
          </button>

          {t.status === "active" && (
            <button
              onClick={onCancel}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-100"
            >
              <FaCircleXmark /> Cancel Ticket
            </button>
          )}
        </div>
      </motion.div>
    </DashboardShell>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {k}
      </div>
      <div
        className={`truncate font-[Sora] text-[15px] font-extrabold text-foreground ${mono ? "font-mono uppercase tracking-tight" : "capitalize"}`}
      >
        {v}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    active: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    expired: "bg-gray-100 text-gray-600 ring-gray-300",
    cancelled: "bg-rose-100 text-rose-700 ring-rose-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ring-1 ${map[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status === "expired"
              ? "bg-gray-400"
              : "bg-rose-500"
        }`}
      />
      {status}
    </span>
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
    const inBox = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
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
      {[
        [0, 0],
        [size - 7, 0],
        [0, size - 7],
      ].map(([fx, fy], i) => (
        <g key={i}>
          <rect x={fx} y={fy} width={7} height={7} fill="#e8470e" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="white" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#1a1a1a" />
        </g>
      ))}
    </svg>
  );
}
