export type Ticket = {
  id: string;
  userId: string;
  type: "journey" | "season" | "platform";
  from: string;
  to: string;
  line: string;
  classType: "1st" | "2nd";
  adults: number;
  children: number;
  fare: number;
  createdAt: string;
  validUntil: string;
  status: "active" | "expired" | "cancelled";
  pnr: string;
  delivery?: "digital" | "print";
  category?: TrainCategory;
  fromCode?: string;
  toCode?: string;
  txnId?: string;
  paymentMethod?: string;
  cancelledAt?: string;
  refund?: {
    originalFare: number;
    refundPercent: number;
    cancellationCharge: number;
    refundAmount: number;
    refundTxnId: string;
    refundedAt: string;
  };
};

export type TrainCategory = "passenger" | "mail_express" | "superfast";

export const CATEGORY_LABEL: Record<TrainCategory, string> = {
  passenger: "Passenger",
  mail_express: "Mail / Express",
  superfast: "Superfast Express",
};

export const CATEGORY_SURCHARGE: Record<TrainCategory, number> = {
  passenger: 0,
  mail_express: 20,
  superfast: 45,
};

const KEY = "railconnect.tickets";

export function computeStatus(t: Ticket): Ticket["status"] {
  if (t.status === "cancelled" || t.cancelledAt) return "cancelled";
  if (new Date(t.validUntil).getTime() < Date.now()) return "expired";
  return "active";
}

export function loadTickets(userId: string): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const all: Ticket[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return all
      .filter((t) => t.userId === userId)
      .map((t) => ({ ...t, status: computeStatus(t) }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function saveTicket(t: Ticket) {
  const all: Ticket[] = JSON.parse(localStorage.getItem(KEY) || "[]");
  all.push(t);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getTicket(userId: string, id: string): Ticket | null {
  const t = loadTickets(userId).find((x) => x.id === id);
  return t ?? null;
}

export function cancelTicket(id: string, refund?: Ticket["refund"]) {
  const all: Ticket[] = JSON.parse(localStorage.getItem(KEY) || "[]");
  const i = all.findIndex((t) => t.id === id);
  if (i === -1) return;
  all[i] = {
    ...all[i],
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    refund: refund ?? all[i].refund,
  };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export const STATIONS: { code: string; name: string; line: string }[] = [
  { code: "CCG", name: "Churchgate", line: "Western" },
  { code: "MMCT", name: "Mumbai Central", line: "Western" },
  { code: "BA", name: "Bandra", line: "Western" },
  { code: "AD", name: "Andheri", line: "Western" },
  { code: "BVI", name: "Borivali", line: "Western" },
  { code: "VR", name: "Virar", line: "Western" },
  { code: "CSMT", name: "CSMT", line: "Central" },
  { code: "DR", name: "Dadar", line: "Central" },
  { code: "KYN", name: "Kalyan", line: "Central" },
  { code: "TNA", name: "Thane", line: "Central" },
  { code: "PNVL", name: "Panvel", line: "Harbour" },
  { code: "VAS", name: "Vashi", line: "Harbour" },
  { code: "SC", name: "Secunderabad Junction", line: "South Central" },
  { code: "SCE", name: "Secunderabad East", line: "South Central" },
  { code: "HYB", name: "Hyderabad Deccan", line: "South Central" },
  { code: "KCG", name: "Kacheguda", line: "South Central" },
  { code: "OGL", name: "Ongole", line: "South Central" },
  { code: "OGLE", name: "Ongole East", line: "South Central" },
  { code: "BZA", name: "Vijayawada Junction", line: "South Central" },
  { code: "MAS", name: "Chennai Central", line: "Southern" },
  { code: "SBC", name: "KSR Bengaluru", line: "South Western" },
  { code: "NDLS", name: "New Delhi", line: "Northern" },
  { code: "HWH", name: "Howrah Junction", line: "Eastern" },
  { code: "PUNE", name: "Pune Junction", line: "Central" },
];

export function calcFare(opts: {
  fromCode: string;
  toCode: string;
  type: "journey" | "season" | "platform";
  classType: "1st" | "2nd";
  adults: number;
  children: number;
  category?: TrainCategory;
}) {
  if (opts.type === "platform") return 10;
  const from = STATIONS.findIndex((s) => s.code === opts.fromCode);
  const to = STATIONS.findIndex((s) => s.code === opts.toCode);
  const distance = Math.max(1, Math.abs(from - to));
  const base = opts.classType === "1st" ? 35 : 10;
  const perStation = opts.classType === "1st" ? 12 : 4;
  let fare = (base + perStation * distance) * Math.max(1, opts.adults) + (opts.classType === "1st" ? 18 : 5) * opts.children;
  const surcharge = CATEGORY_SURCHARGE[opts.category ?? "passenger"];
  fare += surcharge * Math.max(1, opts.adults) + Math.round(surcharge * 0.5) * opts.children;
  if (opts.type === "season") fare = fare * 22; // monthly multiplier
  return Math.round(fare);
}

export function makePnr() {
  return "RC" + Math.random().toString(36).slice(2, 8).toUpperCase();
}