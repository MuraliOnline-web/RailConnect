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

const methodIcon: Record<PaymentMethodId, React.ReactNode> = {
  gpay: <FaGooglePay />,
  phonepe: <FaPhone />,
  paytm: <FaMobileScreen />,
  bhim: <FaMobileScreen />,
  wallet: <FaWallet />,
  credit: <FaCreditCard />,
  debit: <FaCreditCard />,
  netbanking: <FaBuildingColumns />,
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
    const surcharge = CATEGORY_SURCHARGE[draft.category];
    const categoryCharges =
      surcharge * Math.max(1, draft.adults) + Math.round(surcharge * 0.5) * draft.children;
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
      note: `${draft.type} · ${CATEGORY_LABEL[draft.category]} · ${draft.fromName} → ${draft.toName}`,
      createdAt: now.toISOString(),
    });
    if (method === "wallet") setWallet(user.id, round2(balance - summary.total));
    saveReceipt({
      ticketId: ticket.id,
      pnr: ticket.pnr,
      txnId,
      method,
      amount: summary.total,
      fromName: ticket.from,
      toName: ticket.to,
      category: ticket.category!,
      adults: ticket.adults,
      children: ticket.children,
      delivery: ticket.delivery!,
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
          <SectionTitle>Journey details</SectionTitle>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-orange-50/70 p-4">
            <div>
              <div className="font-[Sora] text-lg font-bold">{draft.fromName}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {draft.fromCode}
              </div>
            </div>
            <div className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-full text-white">
              <FaTrain />
            </div>
            <div className="text-right">
              <div className="font-[Sora] text-lg font-bold">{draft.toName}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {draft.toCode}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini k="Category" v={CATEGORY_LABEL[draft.category]} />
            <Mini k="Passengers" v={`${draft.adults}A · ${draft.children}C`} />
            <Mini k="Type" v={draft.type} />
            <Mini k="Delivery" v={draft.delivery === "digital" ? "QR" : "PDF"} />
          </div>

          <div className="mt-7">
            <SectionTitle>Choose payment method</SectionTitle>
            {balance >= summary.total && method !== "wallet" && (
              <button
                type="button"
                onClick={() => setMethod("wallet")}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:bg-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <FaWallet />
                  </span>
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
            <MethodGroup title="UPI" group="upi" method={method} setMethod={setMethod} />
            <MethodGroup
              title="Wallet"
              group="wallet"
              method={method}
              setMethod={setMethod}
              balance={balance}
            />
            <MethodGroup title="Cards" group="card" method={method} setMethod={setMethod} />
            <MethodGroup
              title="Net banking"
              group="netbanking"
              method={method}
              setMethod={setMethod}
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
        <motion.div layout className="glass rounded-3xl p-6 shadow-soft">
          <SectionTitle>Payment summary</SectionTitle>
          <div className="mt-4 space-y-2">
            <SumRow k="Base fare" v={summary.base} />
            <SumRow k="Category charges" v={summary.categoryCharges} />
            <SumRow k="Convenience fee" v={summary.conv} />
          </div>
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
          <div className="flex items-end justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              Total
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {formatINR(summary.total)}
            </div>
          </div>
          <button
            onClick={pay}
            disabled={phase !== "idle" || walletShort}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-70"
          >
            {phase === "idle" ? (
              <>
                Pay {formatINR(summary.total)} <FaArrowRight className="h-3.5 w-3.5" />
              </>
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
    <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
      {children}
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-white/80 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="truncate font-[Sora] text-sm font-bold capitalize">{v}</div>
    </div>
  );
}

function SumRow({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{formatINR(v)}</span>
    </div>
  );
}

function MethodGroup({
  title,
  group,
  method,
  setMethod,
  balance,
}: {
  title: string;
  group: "upi" | "wallet" | "card" | "netbanking";
  method: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
  balance?: number;
}) {
  const items = PAYMENT_METHODS.filter((m) => m.group === group);
  return (
    <div className="mt-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((m) => {
          const selected = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition shadow-soft ${
                selected
                  ? "border-orange-400 bg-orange-50/80"
                  : "border-orange-100 bg-white/80 hover:bg-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                  selected ? "bg-railway-gradient text-white" : "bg-orange-50 text-orange-700"
                }`}
              >
                {methodIcon[m.id]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-[Sora] text-sm font-bold">{m.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {m.id === "wallet" && typeof balance === "number"
                    ? `Balance ${formatINR(balance)}`
                    : m.hint}
                </div>
              </div>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-orange-500" : "border-orange-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    selected ? "bg-railway-gradient" : "bg-transparent"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
