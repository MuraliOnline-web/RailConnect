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

export function pushNotification(
  userId: string,
  data: Omit<AppNotification, "id" | "userId" | "read" | "createdAt"> &
    Partial<Pick<AppNotification, "createdAt">>,
) {
  if (!userId) return;
  const all = readAll();
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

export function markAsRead(userId: string, id: string) {
  const all = readAll();
  const next = all.map((n) =>
    n.userId === userId && n.id === id ? { ...n, read: true } : n,
  );
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