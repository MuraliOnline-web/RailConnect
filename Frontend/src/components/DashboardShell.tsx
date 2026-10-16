import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaHouse,
  FaTicket,
  FaUser,
  FaArrowRightFromBracket,
  FaBars,
  FaXmark,
  FaTrain,
  FaQrcode,
  FaWallet,
  FaClockRotateLeft,
  FaReceipt,
  FaHeart,
  FaGear,
  FaTrainSubway,
  FaRotateLeft,
  FaBell,
} from "react-icons/fa6";
import { RailLogo } from "./RailLogo";
import { useAuth } from "../lib/auth";
import { NotificationBell } from "./NotificationBell";
import { useScrollLock } from "../hooks/use-scroll-lock";
import { useTranslation, type TranslationKey } from "../lib/i18n";
import { evaluateJourneyReminders } from "../lib/notifications";

const NAV: Array<{
  to: string;
  key: TranslationKey;
  fallback: string;
  icon: typeof FaHouse;
  exact: boolean;
  group: string;
}> = [
  {
    to: "/dashboard",
    key: "nav.dashboard",
    fallback: "Dashboard",
    icon: FaHouse,
    exact: true,
    group: "main",
  },
  {
    to: "/dashboard/journey",
    key: "nav.journey",
    fallback: "Journey Ticket",
    icon: FaTrain,
    exact: false,
    group: "book",
  },
  {
    to: "/dashboard/platform",
    key: "nav.platform",
    fallback: "Platform Ticket",
    icon: FaTrainSubway,
    exact: false,
    group: "book",
  },
  {
    to: "/dashboard/qr",
    key: "nav.qr",
    fallback: "QR Ticket",
    icon: FaQrcode,
    exact: false,
    group: "book",
  },
  {
    to: "/dashboard/tickets",
    key: "nav.tickets",
    fallback: "My Tickets",
    icon: FaTicket,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/history",
    key: "nav.history",
    fallback: "Booking History",
    icon: FaClockRotateLeft,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/transactions",
    key: "nav.transactions",
    fallback: "Transactions",
    icon: FaReceipt,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/refunds",
    key: "nav.refunds",
    fallback: "Refunds",
    icon: FaRotateLeft,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/wallet",
    key: "nav.wallet",
    fallback: "Wallet",
    icon: FaWallet,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/notifications",
    key: "nav.notifications",
    fallback: "Notifications",
    icon: FaBell,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/favorites",
    key: "nav.favorites",
    fallback: "Favorite Routes",
    icon: FaHeart,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/profile",
    key: "nav.profile",
    fallback: "Profile",
    icon: FaUser,
    exact: false,
    group: "account",
  },
  {
    to: "/dashboard/settings",
    key: "nav.settings",
    fallback: "Settings",
    icon: FaGear,
    exact: false,
    group: "account",
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const matches = useRouterState({ select: (s) => s.matches });
  const activeMatch = matches[matches.length - 1];
  const matchKey = activeMatch?.id ?? pathname;
  const [open, setOpen] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => setOpen(false), [pathname]);

  // Evaluate journey reminders if user has upcoming journeys
  useEffect(() => {
    if (user?.id) {
      evaluateJourneyReminders(user.id);
    }
  }, [user?.id]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="bg-railway-gradient h-12 w-12 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative min-h-screen bg-[#fff8f1] dark:bg-[#0f0906] text-foreground overflow-x-hidden transition-colors duration-200">
      {/* Ambient bg */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-orange-200/50 dark:bg-orange-950/25 blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-amber-200/40 dark:bg-amber-950/20 blur-3xl" />
      </div>

      {/* Topbar mobile */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden">
        <RailLogo size={32} />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/80 dark:bg-stone-800 p-2.5 text-foreground shadow-soft"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 md:py-10">
        {/* Sidebar desktop */}
        <aside className="sticky top-10 hidden h-[calc(100vh-5rem)] w-64 shrink-0 md:block">
          <div className="glass flex h-full flex-col rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between px-1.5">
              <Link to="/">
                <RailLogo />
              </Link>
              <NotificationBell />
            </div>
            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1 pb-1.5">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-railway-gradient text-white shadow-soft"
                        : "text-foreground/75 hover:bg-white/70 hover:text-foreground dark:hover:bg-stone-800/60 dark:hover:text-stone-100"
                    }`}
                  >
                    <Icon className={active ? "text-white" : "text-orange-500"} />
                    {t(n.key, n.fallback)}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto shrink-0 pt-4.5">
              <div className="rounded-2xl border border-orange-200/80 bg-white/90 p-3.5 shadow-2xs dark:border-stone-700/80 dark:bg-stone-900/90 dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm">
                    {initials || "RC"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <button
                  data-testid="logout-button"
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200/90 bg-white px-3 py-2 text-xs font-semibold text-orange-700 shadow-2xs transition-all duration-200 hover:scale-[1.02] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800/80 dark:text-orange-400 dark:hover:border-stone-600 dark:hover:bg-stone-800 dark:hover:text-orange-300"
                >
                  <FaArrowRightFromBracket /> {t("nav.logout")}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                aria-hidden
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 240 }}
                className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[88vw] flex-col overflow-y-auto overscroll-contain bg-white dark:bg-stone-900 p-5 shadow-2xl [will-change:transform] md:hidden"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center justify-between">
                  <RailLogo />
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-orange-50 dark:bg-stone-800 p-2 text-foreground"
                    aria-label="Close menu"
                  >
                    <FaXmark />
                  </button>
                </div>
                <nav className="mt-6 space-y-1">
                  {NAV.map((n) => {
                    const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                          active
                            ? "bg-railway-gradient text-white shadow-sm"
                            : "text-foreground/75 hover:bg-orange-50 dark:hover:bg-stone-800"
                        }`}
                      >
                        <Icon className={active ? "text-white" : "text-orange-500"} />
                        {t(n.key, n.fallback)}
                      </Link>
                    );
                  })}
                </nav>
                <button
                  data-testid="logout-button-mobile"
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2.5 text-xs font-semibold text-orange-700 dark:text-orange-400 transition-all duration-200 hover:scale-[1.02] hover:border-orange-300 dark:hover:border-stone-700 hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-800 dark:hover:text-orange-300 active:scale-[0.98]"
                >
                  <FaArrowRightFromBracket /> {t("nav.logout")}
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content */}
        <main className="relative min-w-0 flex-1">
          <motion.div
            key={matchKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
