import type { TrainCategory } from "./tickets";

export type PaymentDraft = {
  userId: string;
  type: "journey" | "season" | "platform";
  fromCode: string;
  toCode: string;
  fromName: string;
  toName: string;
  line: string;
  classType: "1st" | "2nd";
  adults: number;
  children: number;
  fare: number;
  delivery?: "digital" | "print";
  category?: TrainCategory;
  createdAt: string;
};

export type PaymentMethodId =
  "gpay" | "phonepe" | "paytm" | "bhim" | "wallet" | "credit" | "debit" | "netbanking";

export type PaymentGroup = "upi" | "wallet" | "card" | "netbanking";

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  group: PaymentGroup;
  hint: string;
}[] = [
  { id: "gpay", label: "Google Pay", group: "upi", hint: "UPI · Instant" },
  { id: "phonepe", label: "PhonePe", group: "upi", hint: "UPI · Instant" },
  { id: "paytm", label: "Paytm", group: "upi", hint: "UPI · Instant" },
  { id: "bhim", label: "BHIM UPI", group: "upi", hint: "UPI · Instant" },
  { id: "wallet", label: "RailConnect Wallet", group: "wallet", hint: "Pay from balance" },
  { id: "credit", label: "Credit Card", group: "card", hint: "Visa · Mastercard · Amex" },
  { id: "debit", label: "Debit Card", group: "card", hint: "All Indian banks" },
  { id: "netbanking", label: "Net Banking", group: "netbanking", hint: "50+ banks supported" },
];

export const CONVENIENCE_FEE = 5;

const DRAFT_KEY = "railconnect.paymentDraft";
const RECEIPT_KEY = "railconnect.lastReceipt";

export function savePaymentDraft(d: PaymentDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
}
export function loadPaymentDraft(): PaymentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PaymentDraft) : null;
  } catch {
    return null;
  }
}
export function clearPaymentDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export type Receipt = {
  ticketId: string;
  pnr: string;
  txnId: string;
  method: PaymentMethodId;
  amount: number;
  fromName: string;
  toName: string;
  category?: TrainCategory;
  adults: number;
  children: number;
  delivery?: "digital" | "print";
  paidAt: string;
};

export function saveReceipt(r: Receipt) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(r));
}
export function loadReceipt(): Receipt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECEIPT_KEY);
    return raw ? (JSON.parse(raw) as Receipt) : null;
  } catch {
    return null;
  }
}
