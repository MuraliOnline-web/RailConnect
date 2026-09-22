import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaCheck,
  FaCircleNotch,
  FaCreditCard,
  FaGooglePay,
  FaMobileScreen,
  FaPhone,
  FaShieldHalved,
  FaTrain,
  FaWallet,
  FaBuildingColumns,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import {
  CATEGORY_LABEL,
  CATEGORY_SURCHARGE,
  makePnr,
  saveTicket,
  type Ticket,
} from "../../lib/tickets";
import {
  CONVENIENCE_FEE,
  PAYMENT_METHODS,
  clearPaymentDraft,
  loadPaymentDraft,
  saveReceipt,
  type PaymentMethodId,
} from "../../lib/payment";
import { getWallet, makeRef, saveTxn, setWallet } from "../../lib/wallet";
import { formatINR, round2 } from "../../lib/currency";
import { pushNotification } from "../../lib/notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payment")({
  head: () => ({ meta: [{ title: "Payment · RailConnect" }] }),
  component: PaymentPage,
});

type Phase = "idle" | "initiated" | "processing" | "success";

const GooglePayLogo = () => (
  <svg viewBox="0 0 45 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-auto">
    <path
      d="M7.74 3.75c0-.26-.02-.51-.07-.76H0v1.44h4.34c-.19 1-.75 1.84-1.6 2.41v2h2.58c1.51-1.4 2.38-3.46 2.38-5.09z"
      fill="#4285F4"
    />
    <path d="M3.75 8.16A4.95 4.95 0 0 1 0 9.75v1.43c2.72 0 5-1.8 5.76-4.22H3.75z" fill="#34A853" />
    <path
      d="M0.95 4.54A3 3 0 0 0 0.95 8l1.6 1.25A5 5 0 0 1 0.95 3.3L2.55 2.05A4.9 4.9 0 0 1 3.75 4.54z"
      fill="#FBBC05"
    />
    <path
      d="M3.75 3.75c-.76-2.42-3.04-4.22-5.76-4.22v1.43c1.7 0 3.19 1.1 3.75 2.79h1.68l.33-1.07-.33 1.07z"
      fill="#EA4335"
    />
    <text x="17" y="11.5" fontFamily="sans-serif" fontWeight="bold" fontSize="10.5" fill="#5F6368">
      Pay
    </text>
  </svg>
);

const PhonePeLogo = () => (
  <svg viewBox="0 0 45 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
    <rect width="45" height="18" rx="3.5" fill="#5f259f" />
    <path
      d="M11 4h-1.5c-.8 0-1.5.7-1.5 1.5v7c0 .8.7 1.5 1.5 1.5H11c.8 0 1.5-.7 1.5-1.5v-7c0-.8-.7-1.5-1.5-1.5zm-.8 8.5c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zm0-4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2z"
      fill="#ffffff"
    />
    <text x="16.5" y="11.8" fontFamily="sans-serif" fontWeight="bold" fontSize="7" fill="#ffffff">
      PhonePe
    </text>
  </svg>
);

const PaytmLogo = () => (
  <svg viewBox="0 0 45 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
    <text x="2" y="13" fontFamily="sans-serif" fontWeight="bold" fontSize="13" fill="#00baf2">
      pay
    </text>
    <text x="22" y="13" fontFamily="sans-serif" fontWeight="bold" fontSize="13" fill="#002e6e">
      tm
    </text>
  </svg>
);

const BhimLogo = () => (
  <svg viewBox="0 0 45 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
    <path d="M2.5 3 L7.5 3 L5 7.5 Z" fill="#F48221" />
    <path d="M2.5 13 L7.5 13 L5 8.5 Z" fill="#0EA051" />
    <text x="10.5" y="10.5" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="#0072B8">
      BHIM
    </text>
    <text x="10.5" y="15.5" fontFamily="sans-serif" fontWeight="bold" fontSize="5" fill="#F48221">
      UPI
    </text>
  </svg>
);

const CreditCardLogo = () => (
  <svg viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-auto">
    <rect width="45" height="28" rx="4" fill="#1e293b" />
    <rect x="3" y="5" width="39" height="4" fill="#334155" />
    <circle cx="31" cy="20" r="3.5" fill="#eb001b" opacity="0.95" />
    <circle cx="35.5" cy="20" r="3.5" fill="#f79e1b" opacity="0.95" />
    <rect x="3" y="17" width="7" height="5" rx="0.75" fill="#f59e0b" />
  </svg>
);

const DebitCardLogo = () => (
  <svg viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-auto">
    <rect width="45" height="28" rx="4" fill="#0f172a" />
    <rect x="3" y="5" width="39" height="4" fill="#334155" />
    <rect x="29" y="16" width="12" height="7" rx="0.75" fill="#00579f" />
    <rect x="3" y="17" width="7" height="5" rx="0.75" fill="#e2e8f0" opacity="0.85" />
  </svg>
);

const NetBankingLogo = () => (
  <svg viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-auto">
    <rect width="45" height="28" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
    <rect x="7" y="21" width="31" height="2" fill="#475569" />
    <rect x="9" y="8" width="27" height="1.5" fill="#475569" />
    <polygon points="22.5,2 7,8 38,8" fill="#475569" />
    <rect x="12" y="9.5" width="2.5" height="11.5" fill="#475569" />
    <rect x="21.25" y="9.5" width="2.5" height="11.5" fill="#475569" />
    <rect x="30.5" y="9.5" width="2.5" height="11.5" fill="#475569" />
  </svg>
);

const WalletLogo = () => (
  <svg viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-auto">
    <rect width="45" height="28" rx="4" fill="#ea580c" />
    <path
      d="M11 8h23a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H11a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 11 8zm23 3.5h-5a1 1 0 1 0 0 2h5v-2z"
      fill="#ffffff"
    />
  </svg>
);

const methodIcon: Record<PaymentMethodId, React.ReactNode> = {
  gpay: <GooglePayLogo />,
  phonepe: <PhonePeLogo />,
  paytm: <PaytmLogo />,
  bhim: <BhimLogo />,
  wallet: <WalletLogo />,
  credit: <CreditCardLogo />,
  debit: <DebitCardLogo />,
  netbanking: <NetBankingLogo />,
};

function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => loadPaymentDraft());
  const [method, setMethod] = useState<PaymentMethodId>("gpay");
  const [phase, setPhase] = useState<Phase>("idle");
  const balance = user ? getWallet(user.id) : 0;

  useEffect(() => {
    if (!draft) navigate({ to: "/dashboard/journey" });
  }, [draft, navigate]);

  const summary = useMemo(() => {
    if (!draft) return { base: 0, categoryCharges: 0, conv: 0, total: 0 };
    let categoryCharges = 0;
    if (draft.category) {
      const surcharge = CATEGORY_SURCHARGE[draft.category];
      categoryCharges =
        surcharge * Math.max(1, draft.adults) + Math.round(surcharge * 0.5) * draft.children;
    }
    const seasonMult = draft.type === "season" ? 22 : 1;
    const base = draft.fare - categoryCharges * seasonMult;
    const conv = CONVENIENCE_FEE;
    return { base, categoryCharges: categoryCharges * seasonMult, conv, total: draft.fare + conv };
  }, [draft]);

  const walletShort = method === "wallet" && balance < summary.total;

  const pay = async () => {
    if (!user || !draft || walletShort) return;
    setPhase("initiated");
    await wait(700);
    setPhase("processing");
    await wait(1400);
    const now = new Date();
    const valid = new Date(now);
    if (draft.type === "season") valid.setMonth(valid.getMonth() + 1);
    else valid.setHours(valid.getHours() + 3);
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: draft.type,
      from: draft.fromName,
      to: draft.toName,
      fromCode: draft.fromCode,
      toCode: draft.toCode,
      line: draft.line,
      classType: draft.classType,
      adults: draft.adults,
      children: draft.children,
      fare: summary.total,
      createdAt: now.toISOString(),
      validUntil: valid.toISOString(),
      status: "active",
      pnr: makePnr(),
      delivery: draft.delivery,
      category: draft.category,
      txnId: "",
      paymentMethod: method,
    };
    const txnId = makeRef();
    ticket.txnId = txnId;
    saveTicket(ticket);
    saveTxn({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "booking",
      amount: -summary.total,
      status: "success",
      method:
        method === "wallet"
          ? "Wallet"
          : method === "netbanking"
            ? "NetBanking"
            : method === "credit" || method === "debit"
              ? "Card"
              : "UPI",
      ref: txnId,
      note: `${draft.type} ${draft.category ? "· " + CATEGORY_LABEL[draft.category] + " " : ""}· ${draft.fromName} → ${draft.toName}`,
      createdAt: now.toISOString(),
    });
    if (method === "wallet") setWallet(user.id, round2(balance - summary.total));
    saveReceipt({
      ticketId: ticket.id,
      type: ticket.type,
      pnr: ticket.pnr,
      txnId,
      method,
      amount: summary.total,
      fromName: ticket.from,
      toName: ticket.to,
      category: ticket.category,
      adults: ticket.adults,
      children: ticket.children,
      delivery: ticket.delivery,
      paidAt: now.toISOString(),
    });
    clearPaymentDraft();
    // Notifications
    pushNotification(user.id, {
      category: "booking",
      severity: "success",
      title: `${ticket.type === "season" ? "Season pass" : "Journey ticket"} booked`,
      body: `${ticket.from} → ${ticket.to} · ${formatINR(summary.total)}`,
      href: "/dashboard/ticket",
    });
    pushNotification(user.id, {
      category: "payment",
      severity: "success",
      title: "Payment completed",
      body: `${formatINR(summary.total)} via ${method === "wallet" ? "Wallet" : method.toUpperCase()} · Ref ${txnId}`,
      href: "/dashboard/transactions",
    });
    if (method === "wallet") {
      pushNotification(user.id, {
        category: "wallet",
        severity: "info",
        title: "Wallet payment successful",
        body: `Debited ${formatINR(summary.total)}. New balance ${formatINR(getWallet(user.id))}.`,
        href: "/dashboard/wallet",
      });
      // Low balance warning
      if (getWallet(user.id) < 50) {
        pushNotification(user.id, {
          category: "wallet",
          severity: "warning",
          title: "Low wallet balance",
          body: `Your wallet is below ${formatINR(50)}. Recharge to keep travelling smoothly.`,
          href: "/dashboard/wallet",
        });
        toast.warning("Low wallet balance", {
          description: `Balance ${formatINR(getWallet(user.id))} — recharge to continue.`,
        });
      }
    }
    toast.success("Ticket booked successfully", {
      description: `${ticket.from} → ${ticket.to}`,
    });
    setPhase("success");
    await wait(600);
    navigate({ to: "/dashboard/payment-success" });
  };

  if (!draft) return null;

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Payment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure checkout for your RailConnect ticket.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Methods */}
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <SectionTitle>Journey Details</SectionTitle>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-orange-50/70 p-4">
            <div>
              <div className="font-[Sora] text-lg font-bold text-orange-950">{draft.fromName}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {draft.fromCode}
              </div>
            </div>
            <div className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm">
              <FaTrain />
            </div>
            <div className="text-right">
              <div className="font-[Sora] text-lg font-bold text-orange-950">{draft.toName}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {draft.toCode}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini k="Category" v={draft.category ? CATEGORY_LABEL[draft.category] : "-"} />
            <Mini k="Passengers" v={`${draft.adults}A · ${draft.children}C`} />
            <Mini k="Type" v={draft.type} />
            <Mini k="Delivery" v={draft.delivery === "print" ? "PDF" : "QR"} />
          </div>

          <div className="mt-7">
            <SectionTitle>Choose Payment Method</SectionTitle>
            {balance >= summary.total && method !== "wallet" && (
              <button
                type="button"
                onClick={() => setMethod("wallet")}
                className="group mt-3 flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-left transition hover:bg-emerald-50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-emerald-100 p-1">
                    <WalletLogo />
                  </div>
                  <div>
                    <div className="font-[Sora] text-sm font-bold text-emerald-900">
                      Pay using RailConnect Wallet
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Balance {formatINR(balance)} · instant, no convenience fee charged twice
                    </div>
                  </div>
                </div>
                <FaArrowRight className="h-3.5 w-3.5 text-emerald-700" />
              </button>
            )}
            <PaymentGroupSection
              title="UPI"
              group="upi"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="Wallet"
              group="wallet"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="Cards"
              group="card"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="Net Banking"
              group="netbanking"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
          </div>

          {walletShort && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
              Wallet balance {formatINR(balance)} is short by {formatINR(summary.total - balance)}.
              Recharge or pick another method.
            </div>
          )}
        </div>

        {/* Summary */}
        <motion.div layout className="glass rounded-3xl p-6 shadow-soft h-fit">
          <SectionTitle>Payment Summary</SectionTitle>
          <div className="mt-4 space-y-1">
            <SumRow k="Base fare" v={summary.base} />
            <SumRow k="Category charges" v={summary.categoryCharges} />
            <SumRow k="Convenience fee" v={summary.conv} />
          </div>
          <div className="my-5 h-px bg-orange-100" />
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold uppercase tracking-wider text-orange-950/70">
              Total Amount
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-orange-600">
              {formatINR(summary.total)}
            </div>
          </div>
          <button
            onClick={pay}
            disabled={phase !== "idle" || walletShort}
            className="bg-railway-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-white shadow-soft hover:shadow-glow transition duration-200 active:scale-[0.98] disabled:opacity-70"
          >
            {phase === "idle" ? (
              <>Pay {formatINR(summary.total)}</>
            ) : phase === "initiated" ? (
              <>
                <FaCircleNotch className="h-3.5 w-3.5 animate-spin" /> Initiating…
              </>
            ) : phase === "processing" ? (
              <>
                <FaCircleNotch className="h-3.5 w-3.5 animate-spin" /> Processing payment…
              </>
            ) : (
              <>
                <FaCheck className="h-3.5 w-3.5" /> Payment successful
              </>
            )}
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <FaShieldHalved className="h-3 w-3 text-orange-500" /> 256-bit SSL · PCI-DSS compliant
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {phase !== "idle" && phase !== "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-[min(360px,90vw)] rounded-3xl bg-white p-7 text-center shadow-glow"
            >
              <div className="bg-railway-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white">
                <FaCircleNotch className="h-6 w-6 animate-spin" />
              </div>
              <div className="mt-4 font-[Sora] text-lg font-bold">
                {phase === "initiated" ? "Payment initiated" : "Processing payment"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Do not close this window. We are confirming your transaction securely.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wider text-orange-950/80">{children}</div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-white/85 px-3 py-2 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {k}
      </div>
      <div className="truncate font-[Sora] text-sm font-bold text-orange-950 capitalize">{v}</div>
    </div>
  );
}

function SumRow({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-orange-100/30 last:border-b-0">
      <span className="text-muted-foreground font-medium">{k}</span>
      <span className="font-bold text-orange-950">{formatINR(v)}</span>
    </div>
  );
}

function PaymentGroupSection({
  title,
  group,
  selectedMethod,
  setMethod,
  balance,
}: {
  title: string;
  group: "upi" | "wallet" | "card" | "netbanking";
  selectedMethod: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
  balance: number;
}) {
  const items = PAYMENT_METHODS.filter((m) => m.group === group);
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-orange-950/70">
          {title}
        </span>
        <div className="h-px flex-1 bg-orange-100/50 ml-3" />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-150 outline-none shadow-sm ${
                isSelected
                  ? "border-orange-400 bg-orange-50/45 -translate-y-[0.5px]"
                  : "border-orange-100/60 bg-white/80 hover:bg-orange-50/10 hover:border-orange-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-orange-100/80 p-1">
                  {methodIcon[m.id]}
                </div>
                <div>
                  <div className="font-[Sora] text-xs sm:text-sm font-bold text-orange-950 leading-snug">
                    {m.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                    {m.id === "wallet" ? `Balance ${formatINR(balance)}` : m.hint}
                  </div>
                </div>
              </div>
              <div
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                  isSelected ? "border-orange-500" : "border-orange-200"
                }`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-150 ${
                    isSelected ? "bg-orange-500" : "bg-transparent"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
