import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { id: string; name: string; email: string; mobile?: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, mobile: string, email: string, password: string) => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
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
      // Demo convenience: allow any login if account does not exist yet
      const demo: User = {
        id: crypto.randomUUID(),
        name: email.split("@")[0] || "Commuter",
        email,
      };
      persist(demo);
      return;
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

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, register, logout, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
