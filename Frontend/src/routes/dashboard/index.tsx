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
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard · RailConnect" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const tickets = useMemo(() => (user ? loadTickets(user.id) : []), [user]);
  const txns = useMemo(() => (user ? loadTxns(user.id) : []), [user]);
  const favs = useMemo(() => (user ? loadFavorites(user.id) : []), [user]);
  const balance = useMemo(() => (user ? getWallet(user.id) : 0), [user]);
  const active = tickets.filter((t) => t.status === "active");
  const lastRecharge = useMemo(
    () => txns.find((t) => t.type === "recharge" && t.status === "success"),
    [txns],
  );
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthSpent = tickets
    .filter((t) => new Date(t.createdAt) >= monthStart)
    .reduce((s, t) => s + t.fare, 0);
  const activeTicket = active[0];
  const recentRoutes = Array.from(
    new Map(
      tickets.filter((t) => t.type !== "platform").map((t) => [`${t.from}->${t.to}`, t]),
    ).values(),
  ).slice(0, 4);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.greetingMorning");
    if (h < 18) return t("dashboard.greetingAfternoon");
    return t("dashboard.greetingEvening");
  })();

  return (
    <DashboardShell>
      <section className="bg-railway-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-glow sm:p-10">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-black/15 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-medium text-white/80 whitespace-nowrap">
              {greeting}, 👋
            </div>
            <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight sm:text-4xl">
              {user?.name?.split(" ")[0] ?? "Commuter"}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Ready to ride? Book a journey ticket, renew your season pass or grab a platform ticket
              in seconds.
            </p>
          </div>
          <Link
            to="/dashboard/journey"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-soft transition hover:bg-orange-50"
          >
            {t("dashboard.bookNow")} <FaArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 sm:auto-rows-fr">
        <StatCard
          icon={<FaTicket />}
          label={t("dashboard.activeTickets")}
          value={active.length.toString()}
          compactCenteredMobile
        />
        <StatCard
          icon={<FaCalendarCheck />}
          label={t("history.title")}
          value={tickets.length.toString()}
          compactCenteredMobile
        />
        <StatCard
          icon={<FaClockRotateLeft />}
          label="Spent This Month"
          value={formatINR(monthSpent)}
        />
        <WalletCard balance={balance} lastRecharge={lastRecharge} className="sm:hidden" />
      </section>

      {/* Active ticket + wallet widgets */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300">
              <FaTicket className="text-orange-500 dark:text-orange-400" /> Active Ticket
            </div>
            <Link to="/dashboard/tickets" className="btn-premium-action">
              Open QR
            </Link>
          </div>
          {activeTicket ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-railway-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm">
                  <FaQrcode />
                </div>
                <div>
                  <div className="font-[Sora] text-xl font-bold text-orange-950 dark:text-stone-100">
                    {activeTicket.from} → {activeTicket.to}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {activeTicket.type} · {activeTicket.line} · {activeTicket.pnr}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Valid until {new Date(activeTicket.validUntil).toLocaleString()}
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/qr"
                search={{ id: activeTicket.id } as never}
                className="bg-railway-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
              >
                Show QR
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No active ticket. Book one in seconds.
              </p>
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
            <h2 className="font-[Sora] text-lg font-bold text-orange-950 dark:text-stone-100">
              Recent Routes
            </h2>
            <Link to="/dashboard/history" className="btn-premium-action">
              View All
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentRoutes.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-transparent dark:border-stone-800/80 p-3 sm:p-3.5 transition hover:bg-white dark:hover:bg-stone-800/90 gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="bg-railway-gradient flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
                    <FaTrain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-orange-950 dark:text-stone-100 leading-tight">
                      {t.from} → {t.to}
                    </div>
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">
                      {t.line} · last {formatINR(t.fare)}
                    </div>
                  </div>
                </div>
                {(() => {
                  const fromCode =
                    t.fromCode || STATIONS.find((s) => s.name === t.from)?.code || "";
                  const toCode = t.toCode || STATIONS.find((s) => s.name === t.to)?.code || "";
                  return (
                    <Link
                      to="/dashboard/journey"
                      search={{ from: fromCode, to: toCode }}
                      className="shrink-0 inline-flex items-center justify-center text-center whitespace-nowrap rounded-full bg-orange-50 dark:bg-stone-800 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-orange-700 dark:text-orange-400 transition hover:bg-orange-100 dark:hover:bg-stone-700 hover:scale-[1.02] active:scale-[0.98] border border-orange-100/60 dark:border-stone-700"
                    >
                      Book Again
                    </Link>
                  );
                })()}
              </div>
            ))}
            {recentRoutes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 text-center text-sm text-muted-foreground">
                No recent routes yet — book your first journey.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[Sora] text-lg font-bold text-orange-950 dark:text-stone-100">
              Recent Transactions
            </h2>
            <Link
              to="/dashboard/transactions"
              className="rounded-full border border-orange-300/80 dark:border-stone-700 bg-white/80 dark:bg-stone-800 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700 transition-colors shadow-2xs"
            >
              View All
            </Link>
          </div>
          <div className="mt-4 space-y-2.5 sm:space-y-3">
            {txns.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-transparent dark:border-stone-800/80 p-3 sm:p-3.5 shadow-2xs hover:bg-white dark:hover:bg-stone-800/90 transition-colors gap-2.5 sm:gap-3"
              >
                <div className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-xs">
                  <FaReceipt className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-[Sora] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug capitalize truncate sm:whitespace-normal">
                    {t.note}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5 truncate">
                    {t.method} · {t.ref}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={`font-[Sora] text-xs sm:text-sm font-extrabold ${
                      t.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {formatSignedINR(t.amount)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
            {txns.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 text-center text-sm text-muted-foreground">
                No transactions yet. Recharge your wallet to get started.
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-[Sora] text-lg font-bold text-orange-950 dark:text-stone-100">
              Favorites
            </h2>
            <Link to="/dashboard/favorites" className="btn-premium-action">
              Manage
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {favs.slice(0, 4).map((f) => {
              const a = STATIONS.find((s) => s.code === f.fromCode);
              const b = STATIONS.find((s) => s.code === f.toCode);
              if (!a || !b) return null;
              return (
                <div
                  key={f.id}
                  className="flex items-center rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-transparent dark:border-stone-800/80 p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <FaHeart className="text-rose-500 shrink-0" />
                    <div className="text-sm font-bold text-orange-950 dark:text-stone-100">
                      {a.name} → {b.name}
                    </div>
                  </div>
                </div>
              );
            })}
            {favs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-6 text-center text-xs text-muted-foreground">
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
    <div
      className={`bg-railway-gradient relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-glow sm:p-6 ${className}`}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none"
      />
      <div className="flex flex-col justify-between h-full gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/90 sm:text-xs">
            <FaWallet className="opacity-95" /> Wallet Balance
          </div>
        </div>

        {/* Middle Content Row: Balance and Large Icon */}
        <div className="flex items-center justify-between my-auto py-1">
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-[Sora] text-3xl font-extrabold leading-none sm:text-4xl">
                {formatINR(balance)}
              </span>
              {balance < 50 && (
                <span className="inline-block rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
                  Low balance
                </span>
              )}
            </div>
            <div className="hidden sm:block text-[11px] text-white/80 font-medium">
              {lastRecharge
                ? `Last recharge +${formatINR(lastRecharge.amount)} · ${new Date(lastRecharge.createdAt).toLocaleDateString()}`
                : "No recharges yet"}
            </div>
          </div>

          {/* Large glassmorphic wallet icon container on right */}
          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner shrink-0 transition-transform duration-300 hover:scale-105">
            <FaWallet className="h-6 w-6 text-white/95" />
          </div>
        </div>

        {/* Footer/Action Row with border separation on desktop */}
        <div className="flex flex-col items-center justify-center gap-3 sm:border-t sm:border-white/10 sm:pt-3.5 w-full">
          {/* Supporting info shown here on mobile */}
          <div className="sm:hidden text-[10px] text-white/80 font-medium text-center">
            {lastRecharge
              ? `Last recharge +${formatINR(lastRecharge.amount)} · ${new Date(lastRecharge.createdAt).toLocaleDateString()}`
              : "No recharges yet"}
          </div>

          <Link
            to="/dashboard/wallet"
            className="w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[10px] font-bold text-orange-700 shadow-soft hover:bg-orange-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 sm:text-xs"
          >
            <FaPlus className="h-3 w-3" /> Recharge Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  compactCenteredMobile = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compactCenteredMobile?: boolean;
}) {
  if (compactCenteredMobile) {
    return (
      <div className="glass flex flex-col justify-center rounded-3xl p-3.5 shadow-soft h-full sm:justify-between sm:p-5">
        {/* Mobile View: Centered title and icon */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950/75 dark:text-stone-300">
            {label}
          </span>
          <span className="bg-railway-gradient flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-white shadow-xs text-[10px]">
            {icon}
          </span>
        </div>
        {/* Mobile View: Centered count directly below */}
        <div className="block sm:hidden text-center font-[Sora] text-2xl font-extrabold tracking-tight text-orange-950 dark:text-stone-100 mt-1">
          {value}
        </div>

        {/* Desktop / Tablet View: Unchanged layout */}
        <div className="hidden sm:flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300">
            {label}
          </span>
          <span className="bg-railway-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            {icon}
          </span>
        </div>
        <div className="hidden sm:block font-[Sora] text-3xl font-extrabold tracking-tight text-orange-950 dark:text-stone-100 sm:mt-3">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="glass flex flex-col justify-center gap-3 rounded-3xl p-3.5 shadow-soft h-full sm:justify-between sm:gap-0 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300 sm:whitespace-normal sm:text-xs">
          {label}
        </span>
        <span className="bg-railway-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white shadow-sm sm:h-9 sm:w-9">
          {icon}
        </span>
      </div>
      <div className="font-[Sora] text-2xl font-extrabold tracking-tight text-orange-950 dark:text-stone-100 sm:mt-3 sm:text-3xl">
        {value}
      </div>
    </div>
  );
}
