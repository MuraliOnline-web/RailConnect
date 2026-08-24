import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FaBell,
  FaCheckDouble,
  FaTrash,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCircleXmark,
  FaCircleInfo,
} from "react-icons/fa6";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  loadNotifications,
  markAllAsRead,
  markAsRead,
  onNotificationsChange,
  removeNotification,
  unreadCount,
  type AppNotification,
  type NotifSeverity,
} from "../lib/notifications";
import { useAuth } from "../lib/auth";

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - +new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SeverityIcon({ s }: { s: NotifSeverity }) {
  const cls = "h-4 w-4 shrink-0";
  if (s === "success") return <FaCircleCheck className={`${cls} text-emerald-500`} />;
  if (s === "warning") return <FaTriangleExclamation className={`${cls} text-amber-500`} />;
  if (s === "error") return <FaCircleXmark className={`${cls} text-rose-500`} />;
  return <FaCircleInfo className={`${cls} text-orange-500`} />;
}

export function NotificationBell({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      setItems(loadNotifications(user.id).slice(0, 6));
      setCount(unreadCount(user.id));
    };
    refresh();
    return onNotificationsChange(refresh);
  }, [user, open]);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
          className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-foreground shadow-soft transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${className}`}
        >
          <FaBell className="h-4 w-4 text-orange-600" />
          {count > 0 && (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-railway-gradient px-1 text-[10px] font-bold text-white ring-2 ring-white"
            >
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,360px)] rounded-2xl border-orange-100 p-0 shadow-glow"
      >
        <div className="flex items-center justify-between border-b border-orange-100 px-4 py-3">
          <div>
            <div className="font-[Sora] text-sm font-bold">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {count > 0 ? `${count} unread` : "You're all caught up"}
            </div>
          </div>
          <button
            onClick={() => markAllAsRead(user.id)}
            disabled={count === 0}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-40"
          >
            <FaCheckDouble className="h-3 w-3" /> Mark all
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <FaBell />
              </div>
              <div className="mt-2 font-[Sora] text-sm font-semibold">No notifications yet</div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Booking, payment and refund updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-orange-50">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition ${
                    n.read ? "bg-white" : "bg-orange-50/40"
                  }`}
                >
                  <div className="pt-0.5">
                    <SeverityIcon s={n.severity} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-[Sora] text-sm font-semibold leading-tight">
                        {n.title}
                      </div>
                      {!n.read && (
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"
                        />
                      )}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="uppercase tracking-wider">
                        {n.category} · {timeAgo(n.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(user.id, n.id)}
                            className="font-semibold text-orange-700 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(user.id, n.id)}
                          className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
                          aria-label="Dismiss notification"
                        >
                          <FaTrash className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-orange-100 px-4 py-2.5 text-center">
          <Link
            to="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-orange-700 hover:underline"
          >
            View all notifications →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
