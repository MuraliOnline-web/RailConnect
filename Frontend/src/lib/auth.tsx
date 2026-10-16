import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { id: string; name: string; email: string; mobile?: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, mobile: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: { name: string; email: string; mobile?: string }) => Promise<void>;
  verifyCurrentPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "railconnect.auth.user";
const USERS_KEY = "railconnect.auth.users";

function readUsers(): Array<User & { password: string }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(u: Array<User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

const CLEANUP_V2_KEY = "railconnect.storage.clean_v2";
const CLEANUP_V3_KEY = "railconnect.storage.clean_v3";

const KNOWN_SYNTHETIC_PNRS = new Set(["RCT7X6R7", "RCAUDIT1"]);
const KNOWN_SYNTHETIC_TICKET_IDS = new Set([
  "371c1e3e-d474-4533-8e92-741d612d3bf5",
  "sample-ticket-pnr-123",
]);
const KNOWN_SYNTHETIC_USER_IDS = new Set(["a38af5bb-f198-47c4-97c9-a28550ebb12c"]);

function getIdentifiedSyntheticIds() {
  const userIds = new Set<string>(KNOWN_SYNTHETIC_USER_IDS);
  const ticketIds = new Set<string>(KNOWN_SYNTHETIC_TICKET_IDS);

  try {
    const rawTickets = localStorage.getItem("railconnect.tickets");
    if (rawTickets) {
      const tickets = JSON.parse(rawTickets);
      if (Array.isArray(tickets)) {
        for (const t of tickets) {
          if (
            t &&
            ((t.pnr && KNOWN_SYNTHETIC_PNRS.has(t.pnr)) ||
              (t.id && KNOWN_SYNTHETIC_TICKET_IDS.has(t.id)))
          ) {
            if (t.userId) userIds.add(t.userId);
            if (t.id) ticketIds.add(t.id);
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      if (Array.isArray(users)) {
        for (const u of users) {
          if (u && typeof u === "object") {
            const rec = u as Record<string, unknown>;
            if (typeof rec.id === "string") {
              if (
                rec.id.startsWith("audit-user-guid-") ||
                (typeof rec.email === "string" &&
                  (rec.email.toLowerCase().includes("demo@") ||
                    rec.email.toLowerCase().includes("test@demo") ||
                    /^commuter\.\d+\.\d+@railconnect\.invalid$/.test(rec.email.toLowerCase()) ||
                    /^audit\.commuter\.\d+@railconnect\.invalid$/.test(rec.email.toLowerCase())))
              ) {
                userIds.add(rec.id);
              }
            }
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return { userIds, ticketIds };
}

export function performTargetedStorageCleanup() {
  if (typeof window === "undefined") return;
  try {
    const v2Done = localStorage.getItem(CLEANUP_V2_KEY) === "true";
    const v3Done = localStorage.getItem(CLEANUP_V3_KEY) === "true";

    if (v2Done && v3Done) return;

    // --- STEP 1: MIGRATION V2 (Core accounts, tickets, txns, wallet, notifs, reminders) ---
    if (!v2Done) {
      const { userIds: identifiedSyntheticUserIds, ticketIds: identifiedSyntheticTicketIds } =
        getIdentifiedSyntheticIds();

      // Narrow matching: only exact synthetic runner patterns or missing passwords, never broad domains
      const isSyntheticAccount = (u: unknown): boolean => {
        if (!u || typeof u !== "object") return true;
        const rec = u as Record<string, unknown>;
        if (typeof rec.id === "string" && identifiedSyntheticUserIds.has(rec.id)) return true;
        if (typeof rec.id === "string" && rec.id.startsWith("audit-user-guid-")) return true;
        if (typeof rec.email === "string") {
          const em = rec.email.toLowerCase();
          if (em.includes("demo@") || em.includes("test@demo")) return true;
          if (/^commuter\.\d+\.\d+@railconnect\.invalid$/.test(em)) return true;
          if (/^audit\.commuter\.\d+@railconnect\.invalid$/.test(em)) return true;
        }
        return false;
      };

      // 1. Purge synthetic accounts
      const rawUsers = localStorage.getItem(USERS_KEY);
      if (rawUsers) {
        try {
          const users = JSON.parse(rawUsers);
          if (Array.isArray(users)) {
            for (const u of users) {
              if (
                u &&
                typeof u === "object" &&
                "id" in u &&
                typeof u.id === "string" &&
                isSyntheticAccount(u)
              ) {
                identifiedSyntheticUserIds.add(u.id);
              }
            }
            const cleanedUsers = users.filter((u) => !isSyntheticAccount(u));
            localStorage.setItem(USERS_KEY, JSON.stringify(cleanedUsers));
          }
        } catch {
          /* ignore */
        }
      }

      // 2. Purge active user session if it belongs to a synthetic test account
      const rawUser = localStorage.getItem(KEY);
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          const users = readUsers();
          const exists = users.some(
            (reg) => reg.id === u.id || reg.email.toLowerCase() === u.email.toLowerCase(),
          );
          if (!exists || (u.id && identifiedSyntheticUserIds.has(u.id)) || isSyntheticAccount(u)) {
            localStorage.removeItem(KEY);
          }
        } catch {
          /* ignore */
        }
      }

      // 3. Purge synthetic tickets
      try {
        const rawTickets = localStorage.getItem("railconnect.tickets");
        if (rawTickets) {
          const tickets = JSON.parse(rawTickets);
          if (Array.isArray(tickets)) {
            const cleanedTickets = tickets.filter(
              (t) =>
                t &&
                (!t.userId || !identifiedSyntheticUserIds.has(t.userId)) &&
                (!t.id || !identifiedSyntheticTicketIds.has(t.id)) &&
                (!t.pnr || !KNOWN_SYNTHETIC_PNRS.has(t.pnr)),
            );
            localStorage.setItem("railconnect.tickets", JSON.stringify(cleanedTickets));
          }
        }
      } catch {
        /* ignore */
      }

      // 4. Purge synthetic transactions (recharges, cancellations, refunds)
      try {
        const rawTxns = localStorage.getItem("railconnect.txns");
        if (rawTxns) {
          const txns = JSON.parse(rawTxns);
          if (Array.isArray(txns)) {
            const cleanedTxns = txns.filter(
              (tx: { userId?: string; ticketId?: string; ref?: string }) =>
                tx &&
                (!tx.userId || !identifiedSyntheticUserIds.has(tx.userId)) &&
                (!tx.ticketId || !identifiedSyntheticTicketIds.has(tx.ticketId)) &&
                tx.ref !== "RCWAUDIT" &&
                tx.ref !== "RCREFAUDIT",
            );
            localStorage.setItem("railconnect.txns", JSON.stringify(cleanedTxns));
          }
        }
      } catch {
        /* ignore */
      }

      // 5. Purge synthetic wallet balances
      try {
        const rawWallet = localStorage.getItem("railconnect.wallet");
        if (rawWallet) {
          const walletMap = JSON.parse(rawWallet);
          if (walletMap && typeof walletMap === "object") {
            for (const uid of identifiedSyntheticUserIds) {
              delete (walletMap as Record<string, unknown>)[uid];
            }
            localStorage.setItem("railconnect.wallet", JSON.stringify(walletMap));
          }
        }
      } catch {
        /* ignore */
      }

      // 6. Purge synthetic notifications
      try {
        const rawNotifs = localStorage.getItem("railconnect.notifications");
        if (rawNotifs) {
          const notifs = JSON.parse(rawNotifs);
          if (Array.isArray(notifs)) {
            const cleanedNotifs = notifs.filter(
              (n: { userId?: string; ticketId?: string }) =>
                n &&
                (!n.userId || !identifiedSyntheticUserIds.has(n.userId)) &&
                (!n.ticketId || !identifiedSyntheticTicketIds.has(n.ticketId)),
            );
            localStorage.setItem("railconnect.notifications", JSON.stringify(cleanedNotifs));
          }
        }
      } catch {
        /* ignore */
      }

      // 7. Purge synthetic journey reminders
      try {
        const rawReminders = localStorage.getItem("railconnect.journeyReminders");
        if (rawReminders) {
          const reminders = JSON.parse(rawReminders);
          if (Array.isArray(reminders)) {
            const cleanedReminders = reminders.filter(
              (id: string) => !identifiedSyntheticTicketIds.has(id),
            );
            localStorage.setItem("railconnect.journeyReminders", JSON.stringify(cleanedReminders));
          }
        }
      } catch {
        /* ignore */
      }

      // 8. Purge per-user settings belonging only to synthetic users
      for (const uid of identifiedSyntheticUserIds) {
        localStorage.removeItem(`railconnect.settings.user.${uid}`);
      }

      localStorage.setItem(CLEANUP_V2_KEY, "true");
    }

    // --- STEP 2: MIGRATION V3 (Incremental: Synthetic favorites, stale synthetic drafts, synthetic receipts) ---
    if (!v3Done) {
      const { userIds: identifiedSyntheticUserIds, ticketIds: identifiedSyntheticTicketIds } =
        getIdentifiedSyntheticIds();

      // 1. Purge synthetic favorites (preserves legitimate favorites)
      try {
        const rawFavs = localStorage.getItem("railconnect.favorites");
        if (rawFavs) {
          const favs = JSON.parse(rawFavs);
          if (Array.isArray(favs)) {
            const cleanedFavs = favs.filter(
              (f: { userId?: string; id?: string }) =>
                f &&
                (!f.id || !f.id.startsWith("synthetic-fav-")) &&
                (!f.userId ||
                  (!identifiedSyntheticUserIds.has(f.userId) &&
                    !f.userId.startsWith("audit-user-guid-"))),
            );
            localStorage.setItem("railconnect.favorites", JSON.stringify(cleanedFavs));
          }
        }
      } catch {
        /* ignore */
      }

      // 2. Purge stale synthetic payment drafts in sessionStorage (preserves legitimate drafts)
      try {
        const rawDraft = sessionStorage.getItem("railconnect.paymentDraft");
        if (rawDraft) {
          try {
            const draft = JSON.parse(rawDraft);
            if (
              draft &&
              typeof draft === "object" &&
              ((typeof draft.userId === "string" &&
                (identifiedSyntheticUserIds.has(draft.userId) ||
                  draft.userId.startsWith("audit-user-guid-"))) ||
                (typeof draft.ticketId === "string" &&
                  identifiedSyntheticTicketIds.has(draft.ticketId)) ||
                (typeof draft.id === "string" && draft.id.startsWith("synthetic-")))
            ) {
              sessionStorage.removeItem("railconnect.paymentDraft");
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }

      // 3. Purge synthetic receipts across all three receipt keys in sessionStorage
      const receiptKeys = [
        "railconnect.lastReceipt",
        "railconnect.lastRefundReceipt",
        "railconnect.lastRechargeReceipt",
      ];
      for (const rk of receiptKeys) {
        try {
          const raw = sessionStorage.getItem(rk);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (
                !parsed ||
                typeof parsed !== "object" ||
                (parsed.userId &&
                  (identifiedSyntheticUserIds.has(parsed.userId) ||
                    parsed.userId.startsWith("audit-user-guid-"))) ||
                (parsed.ticketId && identifiedSyntheticTicketIds.has(parsed.ticketId)) ||
                parsed.pnr === "RCT7X6R7" ||
                parsed.pnr === "RCAUDIT1" ||
                (typeof parsed.id === "string" && parsed.id.startsWith("synthetic-receipt-")) ||
                parsed.ref === "RCWAUDIT" ||
                parsed.ref === "RCREFAUDIT" ||
                parsed.reference === "RCWAUDIT" ||
                parsed.reference === "RCREFAUDIT"
              ) {
                sessionStorage.removeItem(rk);
              }
            } catch {
              sessionStorage.removeItem(rk);
            }
          }
        } catch {
          /* ignore */
        }
      }

      localStorage.setItem(CLEANUP_V3_KEY, "true");
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performTargetedStorageCleanup();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // Ignore parse errors
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const users = readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) {
      throw new Error("Invalid email or password. Please verify your credentials or register.");
    }
    persist({ id: found.id, name: found.name, email: found.email, mobile: found.mobile });
  };

  const register = async (name: string, mobile: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const u = { id: crypto.randomUUID(), name, mobile, email, password };
    users.push(u);
    writeUsers(users);
    persist({ id: u.id, name: u.name, email: u.email, mobile: u.mobile });
  };

  const updateProfile = async (updates: { name: string; email: string; mobile?: string }) => {
    if (!user) return;
    const updated: User = {
      ...user,
      name: updates.name.trim(),
      email: updates.email.trim(),
      mobile: updates.mobile !== undefined ? updates.mobile.trim() : user.mobile,
    };
    persist(updated);

    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile || users[idx].mobile,
      };
      writeUsers(users);
    }
  };

  const verifyCurrentPassword = async (
    currentPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 450));
    if (!user) return { success: false, error: "No active session" };

    const users = readUsers();
    const found = users.find(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase(),
    );

    if (found) {
      if (found.password === currentPassword) {
        return { success: true };
      }
      return { success: false, error: "Current password is incorrect" };
    }

    return {
      success: false,
      error: "Account credentials could not be verified. Please log in again.",
    };
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 550));
    if (!user) return { success: false, error: "No active session" };

    const verifyResult = await verifyCurrentPassword(currentPassword);
    if (!verifyResult.success) {
      return verifyResult;
    }

    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase(),
    );

    if (idx !== -1) {
      users[idx].password = newPassword;
      writeUsers(users);
    } else {
      users.push({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: newPassword,
      });
      writeUsers(users);
    }

    return { success: true };
  };

  const logout = () => persist(null);

  return (
    <Ctx.Provider
      value={{
        user,
        login,
        register,
        updateProfile,
        verifyCurrentPassword,
        changePassword,
        logout,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
