import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  FaArrowRight,
  FaTrain,
  FaTicket,
  FaClockRotateLeft,
  FaCalendarCheck,
  FaWallet,
  FaHeart,
  FaQrcode,
  FaReceipt,
  FaPlus,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { loadTickets, STATIONS } from "../../lib/tickets";
import { getWallet, loadTxns } from "../../lib/wallet";
import { loadFavorites } from "../../lib/favorites";
import { formatINR, formatSignedINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard · RailConnect" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const tickets = useMemo(() => (user ? loadTickets(user.id) : []), [user]);
  const txns = useMemo(() => (user ? loadTxns(user.id) : []), [user]);
  const favs = useMemo(() => (user ? loadFavorites(user.id) : []), [user]);
  const balance = useMemo(() => (user ? getWallet(user.id) : 0), [user]);
  const active = tickets.filter((t) => t.status === "active");
  const lastRecharge = useMemo(
    () => txns.find((t) => t.type === "recharge" && t.status === "success"),
    [txns],
  );
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthSpent = tickets
    .filter((t) => new Date(t.createdAt) >= monthStart)
    .reduce((s, t) => s + t.fare, 0);
  const activeTicket = active[0];
  const recentRoutes = Array.from(
    new Map(tickets.filter((t) => t.type !== "platform").map((t) => [`${t.from}->${t.to}`, t])).values(),
  ).slice(0, 4);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <DashboardShell>
      <section className="bg-railway-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-glow sm:p-10">
        <div aria-hidden className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-black/15 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-medium text-white/80">{greeting},</div>
            <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight sm:text-4xl">
              {user?.name?.split(" ")[0] ?? "Commuter"} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Ready to ride? Book a journey ticket, renew your season pass or
              grab a platform ticket in seconds.
            </p>
          </div>
          <Link
            to="/dashboard/journey"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-soft transition hover:bg-orange-50"
          >
            Book a ticket <FaArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 auto-rows-fr sm:grid-cols-3 sm:gap-4">
        <StatCard icon={<FaTicket />} label="Active tickets" value={active.length.toString()} />
        <StatCard icon={<FaCalendarCheck />} label="Total bookings" value={tickets.length.toString()} />
        <StatCard icon={<FaClockRotateLeft />} label="Spent this month" value={formatINR(monthSpent)} />
        <WalletCard balance={balance} lastRecharge={lastRecharge} className="sm:hidden" />
      </section>

      {/* Active ticket + wallet widgets */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FaTicket /> Active ticket
            </div>
            <Link to="/dashboard/qr" className="text-xs font-semibold text-orange-600 hover:underline">
              Open QR →
            </Link>
          </div>
          {activeTicket ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-railway-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                  <FaQrcode />
                </div>
                <div>
                  <div className="font-[Sora] text-xl font-bold">
                    {activeTicket.from} → {activeTicket.to}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {activeTicket.type} · {activeTicket.line} · {activeTicket.pnr}
                  </div>
                  <div className="mt-0.5 text-xs text-emerald-700">
                    Valid until {new Date(activeTicket.validUntil).toLocaleString()}
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/qr"
                className="bg-railway-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
              >
                Show QR <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-white/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">No active ticket. Book one in seconds.</p>
              <Link
                to="/dashboard/journey"
                className="bg-railway-gradient mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-soft"
              >
                Book journey <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <WalletCard balance={balance} lastRecharge={lastRecharge} className="hidden sm:block" />
      </section>

      <section className="mt-6 grid gap-5">
        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-[Sora] text-lg font-bold">Recent routes</h2>
            <Link to="/dashboard/history" className="text-xs font-semibold text-orange-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentRoutes.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/80 p-3.5 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
                    <FaTrain />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.from} → {t.to}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.line} · last {formatINR(t.fare)}
                    </div>
                  </div>
                </div>
                <Link
                  to="/dashboard/journey"
                  className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                >
                  Book again
                </Link>
              </div>
            ))}
            {recentRoutes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-8 text-center text-sm text-muted-foreground">
                No recent routes yet — book your first journey.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[Sora] text-lg font-bold">Recent transactions</h2>
            <Link to="/dashboard/transactions" className="text-xs font-semibold text-orange-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {txns.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/80 p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.amount >= 0 ? "bg-emerald-500" : "bg-railway-gradient"}`}>
                    <FaReceipt />
                  </div>
                  <div>
                    <div className="text-sm font-semibold capitalize">{t.note}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.method} · {t.ref}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${t.amount >= 0 ? "text-emerald-600" : ""}`}>
                    {formatSignedINR(t.amount)}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
            {txns.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-8 text-center text-sm text-muted-foreground">
                No transactions yet. Recharge your wallet to get started.
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-[Sora] text-lg font-bold">Favorites</h2>
            <Link to="/dashboard/favorites" className="text-xs font-semibold text-orange-600 hover:underline">
              Manage →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {favs.slice(0, 4).map((f) => {
              const a = STATIONS.find((s) => s.code === f.fromCode);
              const b = STATIONS.find((s) => s.code === f.toCode);
              if (!a || !b) return null;
              return (
                <Link key={f.id} to="/dashboard/journey" className="flex items-center justify-between rounded-2xl bg-white/80 p-3 transition hover:bg-white">
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-rose-500" />
                    <div className="text-sm font-semibold">{a.name} → {b.name}</div>
                  </div>
                  <FaArrowRight className="h-3 w-3 text-orange-500" />
                </Link>
              );
            })}
            {favs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-6 text-center text-xs text-muted-foreground">
                Save your most-used routes for one-tap booking.
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function WalletCard({
  className = "",
  balance,
  lastRecharge,
}: {
  className?: string;
  balance: number;
  lastRecharge?: { amount: number; createdAt: string };
}) {
  return (
    <div className={`bg-railway-gradient relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-3.5 text-white shadow-glow sm:p-6 ${className}`}>
      <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-normal text-white/85 sm:whitespace-normal sm:gap-2 sm:text-xs sm:tracking-wider">
        <FaWallet /> Wallet balance
      </div>
      <div className="mt-1 font-[Sora] text-2xl font-extrabold sm:mt-2 sm:text-4xl">{formatINR(balance)}</div>
      {balance < 50 && (
        <div className="mt-1 inline-block rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950 sm:mt-2">
          Low balance
        </div>
      )}
      <div className="mt-1 text-[10px] text-white/80 sm:mt-2 sm:text-[11px]">
        {lastRecharge
          ? `Last recharge +${formatINR(lastRecharge.amount)} · ${new Date(lastRecharge.createdAt).toLocaleDateString()}`
          : "No recharges yet"}
      </div>
      <Link
        to="/dashboard/wallet"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-orange-700 shadow-soft sm:mt-3 sm:px-4 sm:py-2 sm:text-xs"
      >
        <FaPlus /> Recharge wallet
      </Link>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass flex h-full flex-col justify-between rounded-3xl p-3.5 shadow-soft sm:p-5">
      <div className="flex items-center justify-between">
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-normal text-muted-foreground sm:whitespace-normal sm:text-xs sm:tracking-wider">{label}</span>
        <span className="bg-railway-gradient flex h-7 w-7 items-center justify-center rounded-xl text-white sm:h-9 sm:w-9">
          {icon}
        </span>
      </div>
      <div className="mt-2 font-[Sora] text-2xl font-extrabold tracking-tight sm:mt-3 sm:text-3xl">{value}</div>
    </div>
  );
}
