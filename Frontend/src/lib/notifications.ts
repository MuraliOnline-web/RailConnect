export type NotifCategory = "booking" | "wallet" | "payment" | "refund" | "system";
export type NotifSeverity = "success" | "warning" | "error" | "info";

export type AppNotification = {
  id: string;
  userId: string;
  category: NotifCategory;
  severity: NotifSeverity;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

const KEY = "railconnect.notifications";
const EVT = "railconnect.notifications.changed";

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  try {
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* noop */
  }
}

export function loadNotifications(userId: string): AppNotification[] {
  return readAll()
    .filter((n) => n.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function unreadCount(userId: string): number {
  return readAll().filter((n) => n.userId === userId && !n.read).length;
}

import { getNotificationPreferences } from "./settings-core";
import { loadTickets } from "./tickets";

const REMINDERS_KEY = "railconnect.reminders.sent";

function getSentReminders(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function recordSentReminder(ticketId: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getSentReminders();
    if (!list.includes(ticketId)) {
      list.push(ticketId);
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore */
  }
}

export function pushNotification(
  userId: string,
  data: Omit<AppNotification, "id" | "userId" | "read" | "createdAt"> &
    Partial<Pick<AppNotification, "createdAt">>,
) {
  if (!userId) return;

  // Enforce user notification preferences
  const prefs = getNotificationPreferences(userId);

  // 1. Booking confirmations
  if (data.category === "booking" && !data.title.toLowerCase().includes("reminder")) {
    if (!prefs.booking) {
      return; // Suppressed by user preference
    }
  }

  // 2. Journey reminders
  if (
    data.title.toLowerCase().includes("reminder") ||
    data.body?.toLowerCase().includes("valid until")
  ) {
    if (!prefs.journey) {
      return; // Suppressed by user preference
    }
  }

  // 3. Offers & promotions
  const isOfferOrPromo =
    data.category === "system" &&
    (data.title.toLowerCase().includes("offer") ||
      data.title.toLowerCase().includes("deal") ||
      data.title.toLowerCase().includes("promo") ||
      data.title.toLowerCase().includes("discount"));
  if (isOfferOrPromo && !prefs.offers) {
    return; // Suppressed by user preference
  }

  const all = readAll();

  // Deduplication check: prevent identical notification within 10 seconds
  const isDuplicate = all.some(
    (n) =>
      n.userId === userId &&
      n.title === data.title &&
      n.body === data.body &&
      Math.abs(Date.now() - new Date(n.createdAt).getTime()) < 10000,
  );
  if (isDuplicate) return;

  all.push({
    id: crypto.randomUUID(),
    userId,
    read: false,
    createdAt: data.createdAt || new Date().toISOString(),
    category: data.category,
    severity: data.severity,
    title: data.title,
    body: data.body,
    href: data.href,
  });
  writeAll(all);
}

/**
 * Evaluates upcoming active tickets and issues in-app journey reminders if enabled.
 * NOTE: Reminders require genuine scheduled departure date/time (ticket.departureTime).
 * Ticket validity expiration (validUntil) is NOT treated as a departure time.
 */
export function evaluateJourneyReminders(userId: string) {
  if (!userId || typeof window === "undefined") return;
  const prefs = getNotificationPreferences(userId);
  if (!prefs.journey) return;

  const tickets = loadTickets(userId);
  const sent = getSentReminders();
  const now = Date.now();

  for (const t of tickets) {
    // 1. Only active journey tickets
    if (t.status !== "active") continue;
    if (t.type === "platform") continue;
    if (sent.includes(t.id)) continue;

    // 2. Journey reminders require genuine scheduled departure date/time data.
    // Tickets lacking scheduled departure data (or only possessing validity expiry)
    // are ineligible for departure reminders.
    if (!t.departureTime) continue;

    const depTime = new Date(t.departureTime).getTime();
    if (isNaN(depTime) || depTime <= now) continue;

    // 3. Record reminder as sent for this ticket to prevent duplicate alerts
    recordSentReminder(t.id);

    pushNotification(userId, {
      category: "booking",
      severity: "info",
      title: "Journey Reminder",
      body: `${t.from} → ${t.to} · Departs at ${new Date(t.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      href: `/dashboard/tickets/${t.id}`,
    });
    break; // One reminder per evaluation cycle to prevent alert fatigue
  }
}

export function markAsRead(userId: string, id: string) {
  const all = readAll();
  const next = all.map((n) => (n.userId === userId && n.id === id ? { ...n, read: true } : n));
  writeAll(next);
}

export function markAllAsRead(userId: string) {
  const all = readAll();
  const next = all.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  writeAll(next);
}

export function removeNotification(userId: string, id: string) {
  const all = readAll().filter((n) => !(n.userId === userId && n.id === id));
  writeAll(all);
}

export function clearAll(userId: string) {
  const all = readAll().filter((n) => n.userId !== userId);
  writeAll(all);
}

export function onNotificationsChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

export const CATEGORY_LABEL: Record<NotifCategory, string> = {
  booking: "Booking",
  wallet: "Wallet",
  payment: "Payment",
  refund: "Refund",
  system: "System",
};
