import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaShieldHalved } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { PaymentMethodLogo } from "../../components/PaymentMethodLogo";
import { useAuth } from "../../lib/auth";
import { CATEGORY_LABEL, CATEGORY_SURCHARGE } from "../../lib/tickets";
import {
  CONVENIENCE_FEE,
  PAYMENT_METHODS,
  loadPaymentDraft,
  clearPaymentDraft,
  type PaymentMethodId,
} from "../../lib/payment";
import { getWallet } from "../../lib/wallet";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/payment")({
  head: () => ({ meta: [{ title: "Payment · RailConnect" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => loadPaymentDraft());
  const [method, setMethod] = useState<PaymentMethodId>("gpay");
  const balance = user ? getWallet(user.id) : 0;

  // Do not navigate away when draft is null; empty state is explicitly supported.

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

  const [showPendingModal, setShowPendingModal] = useState(false);

  const pay = async () => {
    if (!user || !draft || walletShort) return;
    setShowPendingModal(true);
  };

  const abandonCheckout = () => {
    clearPaymentDraft();
    navigate({ to: "/dashboard" });
  };

  return (
    <DashboardShell>
      <div className="mb-4 sm:mb-5">
        <h1 className="font-[Sora] text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Payment
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Secure checkout for your RailConnect ticket.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-5 lg:gap-6">
        {/* Payment Methods Panel */}
        <div className="rounded-[22px] sm:rounded-[26px] border border-[#fed7aa]/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 sm:p-5 lg:p-5.5 shadow-[0_4px_24px_rgba(249,115,22,0.03)] backdrop-blur-xs flex flex-col justify-between lg:col-span-7 xl:col-span-8">
          <div>
            <PaymentGroupSection
              title="UPI"
              group="upi"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="WALLET"
              group="wallet"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="CARDS"
              group="card"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
            <PaymentGroupSection
              title="NET BANKING"
              group="netbanking"
              selectedMethod={method}
              setMethod={setMethod}
              balance={balance}
            />
          </div>

          {walletShort && (
            <div className="mt-4 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 p-3 sm:p-3.5 text-xs font-medium text-orange-800 dark:text-orange-300">
              Wallet balance {formatINR(balance)} is short by {formatINR(summary.total - balance)}.
              Recharge or pick another method.
            </div>
          )}
        </div>

        {/* Payment Summary Panel */}
        <motion.div
          layout
          className="rounded-[22px] sm:rounded-[26px] border border-[#fed7aa]/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 sm:p-5 lg:p-6 shadow-[0_4px_24px_rgba(249,115,22,0.03)] backdrop-blur-xs flex flex-col justify-between h-auto lg:h-full lg:col-span-5 xl:col-span-4"
        >
          {/* Group A — Heading, booking overview, and fare breakdown */}
          <div>
            <div className="text-center font-[Sora] text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              Payment Summary
            </div>

            {/* Booking Details / Journey Context */}
            <div className="mt-3.5 sm:mt-4 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/60 p-3 text-left">
              {draft ? (
                draft.type === "platform" ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
                        Platform Ticket
                      </span>
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 capitalize">
                        {draft.line || "Western"}
                      </span>
                    </div>
                    <div className="mt-1.5 font-[Sora] text-sm font-bold text-stone-900 dark:text-stone-100">
                      {draft.fromName}
                      {draft.fromCode && (
                        <span className="ml-1 text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
                          ({draft.fromCode})
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      {draft.adults} Person(s) ·{" "}
                      {draft.delivery === "print" ? "Print PDF" : "Digital Pass"}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
                        {draft.type === "season" ? "Season Pass" : "Journey Ticket"}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {draft.category ? CATEGORY_LABEL[draft.category] : "Passenger"}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 font-[Sora] text-sm font-bold text-stone-900 dark:text-stone-100">
                      <span className="truncate">{draft.fromName}</span>
                      <span className="text-orange-500 font-bold">→</span>
                      <span className="truncate">{draft.toName}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      {draft.adults} Adult{draft.adults > 1 ? "s" : ""}
                      {draft.children ? ` · ${draft.children} Child` : ""} ·{" "}
                      {draft.delivery === "print" ? "Print PDF" : "Digital QR"}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    No Booking Selected
                  </div>
                  <div className="mt-1 font-[Sora] text-sm font-bold text-stone-400">—</div>
                  <div className="mt-0.5 text-[11px] text-stone-400">
                    Select a journey or platform ticket to proceed
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3.5 sm:mt-4 divide-y divide-stone-100 dark:divide-stone-800">
              <div className="flex items-center justify-between py-2.5 sm:py-3 text-xs sm:text-sm">
                <span className="text-stone-600 dark:text-stone-300 font-medium">Base fare</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatINR(summary.base)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 sm:py-3 text-xs sm:text-sm">
                <span className="text-stone-600 dark:text-stone-300 font-medium">
                  Category charges
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatINR(summary.categoryCharges)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 sm:py-3 text-xs sm:text-sm">
                <span className="text-stone-600 dark:text-stone-300 font-medium">
                  Convenience fee
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatINR(summary.conv)}
                </span>
              </div>
            </div>
          </div>

          {/* Group B — Total amount */}
          <div className="my-auto py-2 sm:py-3">
            <div className="mb-4 sm:mb-5 h-px bg-stone-100 dark:bg-stone-800" />
            <div className="flex items-center justify-between">
              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                TOTAL AMOUNT
              </div>
              <div className="font-[Sora] text-2xl sm:text-3xl font-extrabold text-[#f97316] dark:text-orange-400">
                {formatINR(summary.total)}
              </div>
            </div>
          </div>

          {/* Group C — Payment action and security note */}
          <div>
            <button
              data-testid="pay-now-button"
              onClick={pay}
              disabled={walletShort || !draft}
              className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:from-[#ea580c] hover:to-[#c2410c] hover:shadow-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Pay {formatINR(summary.total)}
            </button>

            {draft && (
              <button
                type="button"
                data-testid="abandon-checkout-button"
                onClick={abandonCheckout}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              >
                Cancel & Discard Draft
              </button>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
              <FaShieldHalved className="h-3.5 w-3.5 text-orange-500" /> 256-bit SSL · PCI-DSS
              compliant
            </div>
          </div>
        </motion.div>
      </div>

      {showPendingModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-3xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <FaShieldHalved className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-[Sora] text-xl font-bold text-stone-900 dark:text-stone-100">
              Payment Gateway Pending
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Live payment processing and official unreserved railway ticket booking require backend
              integration with Indian Railways (CRIS/IRCTC) and authorized payment gateways.
            </p>
            <div className="mt-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-left text-xs text-amber-900 dark:text-amber-300">
              <p className="font-semibold">Transaction not executed:</p>
              <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-400">
                In this deployment, live payment processors are disconnected. No amount has been
                debited from your account or wallet, and no ticket has been fabricated.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                data-testid="modify-order-button"
                onClick={() => {
                  setShowPendingModal(false);
                  if (draft?.type === "platform") {
                    navigate({ to: "/dashboard/platform" });
                  } else {
                    navigate({ to: "/dashboard/journey" });
                  }
                }}
                className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 px-4 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition cursor-pointer"
              >
                Modify Order
              </button>
              <button
                type="button"
                data-testid="return-dashboard-button"
                onClick={abandonCheckout}
                className="bg-railway-gradient flex-1 rounded-xl py-2.5 px-4 text-xs font-semibold text-white shadow-soft hover:shadow-glow transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
    <div className="mt-3.5 sm:mt-4 first:mt-0">
      <div className="mb-2 sm:mb-2.5 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {title}
        </span>
        <div className="ml-2.5 sm:ml-3 h-px flex-1 bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
        {items.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`group flex min-h-[58px] sm:min-h-[62px] items-center justify-between rounded-xl sm:rounded-2xl border px-3 py-2 sm:px-3.5 sm:py-2.5 text-left transition-all duration-150 outline-none cursor-pointer ${
                isSelected
                  ? "border-orange-500 bg-[#fffaf5] dark:bg-orange-950/20 shadow-xs ring-1 ring-orange-500/20"
                  : "border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-orange-200 dark:hover:border-stone-700 hover:bg-orange-50/10 dark:hover:bg-stone-800 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
                <PaymentMethodLogo method={m.id} />
                <div className="min-w-0 flex-1">
                  <div className="font-[Sora] text-[13px] sm:text-[14px] font-bold text-stone-900 dark:text-stone-100 leading-tight truncate">
                    {m.label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {m.id === "wallet" ? `Balance ${formatINR(balance)}` : m.hint}
                  </div>
                </div>
              </div>
              <div
                className={`flex h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                  isSelected ? "border-orange-500" : "border-stone-300 dark:border-stone-700"
                }`}
              >
                {isSelected && (
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-orange-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
