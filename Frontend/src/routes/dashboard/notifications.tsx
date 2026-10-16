import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBell,
  FaCheckDouble,
  FaTrash,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCircleXmark,
  FaCircleInfo,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import {
  CATEGORY_LABEL,
  clearAll,
  loadNotifications,
  markAllAsRead,
  markAsRead,
  onNotificationsChange,
  removeNotification,
  type AppNotification,
  type NotifCategory,
  type NotifSeverity,
} from "../../lib/notifications";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications · RailConnect" }] }),
  component: NotificationsPage,
});

const TABS: { id: NotifCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "booking", label: "Booking" },
  { id: "payment", label: "Payment" },
  { id: "wallet", label: "Wallet" },
  { id: "refund", label: "Refund" },
  { id: "system", label: "System" },
];

function SeverityIcon({ s }: { s: NotifSeverity }) {
  const cls = "h-4 w-4";
  if (s === "success") return <FaCircleCheck className={`${cls} text-emerald-500`} />;
  if (s === "warning") return <FaTriangleExclamation className={`${cls} text-amber-500`} />;
  if (s === "error") return <FaCircleXmark className={`${cls} text-rose-500`} />;
  return <FaCircleInfo className={`${cls} text-orange-500`} />;
}

function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [tab, setTab] = useState<NotifCategory | "all">("all");

  useEffect(() => {
    if (!user) return;
    const refresh = () => setItems(loadNotifications(user.id));
    refresh();
    return onNotificationsChange(refresh);
  }, [user]);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((n) => n.category === tab)),
    [items, tab],
  );

  const unread = items.filter((n) => !n.read).length;
  const hasNotifications = items.length > 0;

  return (
    <DashboardShell>
      {/* Page Heading & Desktop Action Buttons */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Sora] text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t("notif.title")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
            {unread > 0
              ? `${unread} unread update${unread === 1 ? "" : "s"} across your RailConnect activity.`
              : t("notif.emptySub")}
          </p>
        </div>

        {/* Desktop / Tablet Actions */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => hasNotifications && user && markAllAsRead(user.id)}
            disabled={!hasNotifications}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition",
              hasNotifications
                ? "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 shadow-2xs cursor-pointer dark:border-stone-800 dark:bg-stone-900 dark:text-orange-400"
                : "border border-stone-200 bg-stone-50 text-stone-400 opacity-50 cursor-not-allowed shadow-none dark:border-stone-800 dark:bg-stone-900/40",
            )}
          >
            <FaCheckDouble className="h-3 w-3" /> {t("notif.markAllRead")}
          </button>
          <button
            type="button"
            onClick={() => hasNotifications && user && clearAll(user.id)}
            disabled={!hasNotifications}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition",
              hasNotifications
                ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs cursor-pointer dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                : "border border-stone-200 bg-stone-50 text-stone-400 opacity-50 cursor-not-allowed shadow-none dark:border-stone-800 dark:bg-stone-900/40",
            )}
          >
            <FaTrash className="h-3 w-3" /> {t("notif.clearAll")}
          </button>
        </div>
      </div>

      {/* Mobile-Only Action Buttons (Row directly above category dropdown) */}
      <div className="sm:hidden mb-3 grid grid-cols-2 gap-2.5 w-full">
        <button
          type="button"
          onClick={() => hasNotifications && user && markAllAsRead(user.id)}
          disabled={!hasNotifications}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition truncate",
            hasNotifications
              ? "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 shadow-2xs cursor-pointer dark:border-stone-800 dark:bg-stone-900 dark:text-orange-400"
              : "border border-stone-200 bg-stone-50 text-stone-400 opacity-50 cursor-not-allowed shadow-none dark:border-stone-800 dark:bg-stone-900/40",
          )}
        >
          <FaCheckDouble className="h-3 w-3 shrink-0" />
          <span className="truncate">{t("notif.markAllRead")}</span>
        </button>
        <button
          type="button"
          onClick={() => hasNotifications && user && clearAll(user.id)}
          disabled={!hasNotifications}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition truncate",
            hasNotifications
              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs cursor-pointer dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
              : "border border-stone-200 bg-stone-50 text-stone-400 opacity-50 cursor-not-allowed shadow-none dark:border-stone-800 dark:bg-stone-900/40",
          )}
        >
          <FaTrash className="h-3 w-3 shrink-0" />
          <span className="truncate">{t("notif.clearAll")}</span>
        </button>
      </div>

      {/* Mobile-Only Category Dropdown (Directly beneath actions, directly above card) */}
      <div className="sm:hidden mb-4 w-full">
        <Select value={tab} onValueChange={(val) => setTab(val as NotifCategory | "all")}>
          <SelectTrigger
            aria-label="Filter notifications by category"
            className="w-full h-11 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 data-[state=open]:border-orange-500 data-[state=open]:ring-2 data-[state=open]:ring-orange-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Category:</span>
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="z-50 w-(--radix-select-trigger-width) min-w-[200px] rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-1.5 shadow-xl text-foreground"
          >
            {TABS.map((t) => {
              const c =
                t.id === "all" ? items.length : items.filter((n) => n.category === t.id).length;
              return (
                <SelectItem
                  key={t.id}
                  value={t.id}
                  className="rounded-xl py-2.5 px-3 text-xs font-semibold text-foreground hover:bg-orange-50 hover:text-orange-950 dark:hover:bg-stone-800 focus:bg-orange-50 focus:text-orange-950 dark:focus:bg-stone-800 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full pr-2">
                    <span>{t.label}</span>
                    <span className="ml-2 rounded-full bg-orange-100/70 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold text-orange-800 dark:text-orange-300">
                      {c}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop & Tablet Category Tabs: Aligned 6-column grid matching the notification card's edges */}
      <div className="hidden sm:grid sm:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 w-full mb-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          const c = t.id === "all" ? items.length : items.filter((n) => n.category === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 lg:gap-2 rounded-full py-2 px-2 text-xs font-semibold transition cursor-pointer shadow-2xs min-w-0 w-full",
                active
                  ? "bg-railway-gradient text-white shadow-soft"
                  : "border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-orange-800 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-stone-800 hover:border-orange-300",
              )}
            >
              <span className="truncate">{t.label}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-orange-50 dark:bg-stone-800 text-orange-700 dark:text-orange-300",
                )}
              >
                {c}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-2 shadow-soft sm:p-4"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 shadow-2xs">
              <FaBell className="h-6 w-6" />
            </div>
            <div className="mt-3.5 font-[Sora] text-lg sm:text-xl font-bold text-foreground">
              {t("notif.empty")}
            </div>
            <p className="mx-auto mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {t("notif.emptySub")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-orange-50 dark:divide-stone-800">
            {filtered.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 rounded-2xl p-4 transition ${
                  n.read
                    ? "bg-white/60 dark:bg-stone-900/60 dark:border dark:border-stone-800/60"
                    : "bg-orange-50/60 dark:bg-stone-800/80 dark:border dark:border-orange-500/30"
                }`}
              >
                <div className="mt-0.5">
                  <SeverityIcon s={n.severity} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="font-[Sora] text-sm font-bold text-stone-900 dark:text-stone-100">
                      {n.title}
                    </div>
                    <span className="rounded-full bg-orange-50 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                      {CATEGORY_LABEL[n.category]}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-1 text-xs text-muted-foreground dark:text-stone-300">
                      {n.body}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground dark:text-stone-400">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      {n.href && (
                        <a
                          href={n.href}
                          className="font-semibold text-orange-700 dark:text-orange-400 hover:underline"
                        >
                          Open →
                        </a>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => user && markAsRead(user.id, n.id)}
                          className="font-semibold text-orange-700 dark:text-orange-400 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => user && removeNotification(user.id, n.id)}
                        className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                        aria-label="Dismiss notification"
                      >
                        <FaTrash className="h-2.5 w-2.5" /> Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </DashboardShell>
  );
}
