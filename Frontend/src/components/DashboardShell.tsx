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

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: FaHouse, exact: true, group: "main" },
  { to: "/dashboard/journey", label: "Journey ticket", icon: FaTrain, exact: false, group: "book" },
  {
    to: "/dashboard/platform",
    label: "Platform ticket",
    icon: FaTrainSubway,
    exact: false,
    group: "book",
  },
  { to: "/dashboard/qr", label: "QR ticket", icon: FaQrcode, exact: false, group: "book" },
  { to: "/dashboard/tickets", label: "My tickets", icon: FaTicket, exact: false, group: "manage" },
  {
    to: "/dashboard/history",
    label: "Booking history",
    icon: FaClockRotateLeft,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/transactions",
    label: "Transactions",
    icon: FaReceipt,
    exact: false,
    group: "manage",
  },
  { to: "/dashboard/refunds", label: "Refunds", icon: FaRotateLeft, exact: false, group: "manage" },
  { to: "/dashboard/wallet", label: "Wallet", icon: FaWallet, exact: false, group: "manage" },
  {
    to: "/dashboard/notifications",
    label: "Notifications",
    icon: FaBell,
    exact: false,
    group: "manage",
  },
  {
    to: "/dashboard/favorites",
    label: "Favorite routes",
    icon: FaHeart,
    exact: false,
    group: "manage",
  },
  { to: "/dashboard/profile", label: "Profile", icon: FaUser, exact: false, group: "account" },
  { to: "/dashboard/settings", label: "Settings", icon: FaGear, exact: false, group: "account" },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => setOpen(false), [pathname]);

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
    <div className="relative min-h-screen bg-[#fff8f1]">
      {/* Ambient bg */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      {/* Topbar mobile */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden">
        <RailLogo size={32} />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/80 p-2.5 text-foreground shadow-soft"
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
            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
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
                        : "text-foreground/70 hover:bg-white/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className={active ? "text-white" : "text-orange-500"} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto">
              <div className="rounded-2xl bg-white/70 p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white">
                    {initials || "RC"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 transition-all duration-200 hover:scale-[1.02] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-[0.98]"
                >
                  <FaArrowRightFromBracket /> Log out
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
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                aria-hidden
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 240 }}
                className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[88vw] flex-col overflow-y-auto overscroll-contain bg-white p-5 shadow-2xl [will-change:transform] md:hidden"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center justify-between">
                  <RailLogo />
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-orange-50 p-2 text-foreground"
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
                            ? "bg-railway-gradient text-white"
                            : "text-foreground/70 hover:bg-orange-50"
                        }`}
                      >
                        <Icon className={active ? "text-white" : "text-orange-500"} />
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>
                <button
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-xs font-semibold text-orange-700 transition-all duration-200 hover:scale-[1.02] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-[0.98]"
                >
                  <FaArrowRightFromBracket /> Log out
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content */}
        <main className="relative min-w-0 flex-1">
          <motion.div
            key={pathname}
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
