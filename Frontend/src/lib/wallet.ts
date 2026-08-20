export type Txn = {
  id: string;
  userId: string;
  type: "recharge" | "booking" | "refund";
  amount: number; // positive = credit, negative = debit
  status: "success" | "pending" | "failed";
  method: "UPI" | "Card" | "NetBanking" | "Wallet";
  ref: string;
  note: string;
  createdAt: string;
  // refund-specific metadata
  ticketId?: string;
  originalTxnId?: string;
  originalFare?: number;
  refundPercent?: number;
  cancellationCharge?: number;
};

const TXN_KEY = "railconnect.txns";
const WALLET_KEY = "railconnect.wallet";

export function loadTxns(userId: string): Txn[] {
  if (typeof window === "undefined") return [];
  try {
    const all: Txn[] = JSON.parse(localStorage.getItem(TXN_KEY) || "[]");
    return all
      .filter((t) => t.userId === userId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function saveTxn(t: Txn) {
  const all: Txn[] = JSON.parse(localStorage.getItem(TXN_KEY) || "[]");
  all.push(t);
  localStorage.setItem(TXN_KEY, JSON.stringify(all));
}

export function getWallet(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const map = JSON.parse(localStorage.getItem(WALLET_KEY) || "{}");
    return Number(map[userId] ?? 0);
  } catch {
    return 0;
  }
}

export function setWallet(userId: string, amount: number) {
  const map = JSON.parse(localStorage.getItem(WALLET_KEY) || "{}");
  // Preserve paise-level precision (2 decimals) — never silently round to integers.
  map[userId] = Math.max(0, Math.round(amount * 100) / 100);
  localStorage.setItem(WALLET_KEY, JSON.stringify(map));
}

export function makeRef() {
  return "TXN" + Math.random().toString(36).slice(2, 10).toUpperCase();
}
