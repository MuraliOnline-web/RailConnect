import { createFileRoute, Link } from "@tanstack/react-router";
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
  FaArrowRight,
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

  return (
    <DashboardShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0
              ? `${unread} unread update${unread === 1 ? "" : "s"} across your RailConnect activity.`
              : "You're all caught up."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => user && markAllAsRead(user.id)}
            disabled={unread === 0}
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
          >
            <FaCheckDouble className="h-3 w-3" /> Mark all as read
          </button>
          <button
            onClick={() => user && clearAll(user.id)}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          >
            <FaTrash className="h-3 w-3" /> Clear all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          const c =
            t.id === "all"
              ? items.length
              : items.filter((n) => n.category === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-railway-gradient text-white shadow-soft"
                  : "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-white/20 text-white" : "bg-orange-50 text-orange-700"
                }`}
              >
                {c}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-2 shadow-soft sm:p-4"
      >
        {filtered.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <FaBell className="h-6 w-6" />
            </div>
            <div className="mt-3 font-[Sora] text-lg font-bold">No notifications</div>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Once you book tickets, make payments or get refunds, the updates will appear here.
            </p>
            <Link
              to="/dashboard/journey"
              className="bg-railway-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white shadow-soft"
            >
              Book a ticket <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-orange-50">
            {filtered.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 rounded-2xl p-4 transition ${
                  n.read ? "bg-white/60" : "bg-orange-50/60"
                }`}
              >
                <div className="mt-0.5">
                  <SeverityIcon s={n.severity} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="font-[Sora] text-sm font-bold">{n.title}</div>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
                      {CATEGORY_LABEL[n.category]}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      {n.href && (
                        <a
                          href={n.href}
                          className="font-semibold text-orange-700 hover:underline"
                        >
                          Open →
                        </a>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => user && markAsRead(user.id, n.id)}
                          className="font-semibold text-orange-700 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => user && removeNotification(user.id, n.id)}
                        className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
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