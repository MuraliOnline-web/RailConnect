import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaPlus,
  FaArrowRight,
  FaArrowDown,
  FaRotateLeft,
  FaReceipt,
  FaTriangleExclamation,
  FaShieldHalved,
  FaCircleNotch,
  FaMoneyBillTransfer,
  FaBuildingColumns,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { PaymentMethodLogo } from "../../components/PaymentMethodLogo";
import { useAuth } from "../../lib/auth";
import { getWallet, loadTxns, type Txn } from "../../lib/wallet";
import { PAYMENT_METHODS, type PaymentMethodId } from "../../lib/payment";
import { formatINR, formatSignedINR } from "../../lib/currency";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({ meta: [{ title: "Wallet · RailConnect" }] }),
  component: WalletPage,
});

const MIN_RECHARGE = 10;
const QUICK_PRESETS = [50, 100, 200, 500, 1000];

function ActivityStatusBadge({ status }: { status: Txn["status"] | string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300/80 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    pending: {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    failed: {
      bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300/80 dark:border-rose-800",
      dot: "bg-rose-500",
    },
  };

  const current = map[status] || map.success;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-2xs ${current.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dot}`} />
      {status}
    </span>
  );
}

function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<Txn[]>([]);

  // Amount state with explicit mutual exclusion
  const [activeMode, setActiveMode] = useState<"quick" | "manual" | null>(null);
  const [quickPreset, setQuickPreset] = useState<number>(0);
  const [manualInput, setManualInput] = useState<string>("0");

  // Selected payment method for recharge (excluding internal wallet method)
  const [method, setMethod] = useState<PaymentMethodId>("gpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Withdrawal state (Simulated Demo Flow)
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawProvider, setWithdrawProvider] = useState<"gpay" | "phonepe" | "paytm" | "bhim">(
    "gpay",
  );
  const [withdrawUpiId, setWithdrawUpiId] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    if (!user) return;
    setBalance(getWallet(user.id));
    setTxns(loadTxns(user.id));
  }, [user]);

  const stats = useMemo(() => {
    let totalRecharge = 0;
    let totalSpent = 0;
    let lastRecharge: string | null = null;
    const lastTxn = txns[0]?.createdAt ?? null;
    for (const t of txns) {
      if (t.type === "recharge" && t.status === "success") {
        totalRecharge += t.amount;
        if (!lastRecharge) lastRecharge = t.createdAt;
      }
      if (t.type === "booking" && t.status === "success") {
        totalSpent += Math.abs(t.amount);
      }
    }
    return { totalRecharge, totalSpent, lastRecharge, lastTxn };
  }, [txns]);

  const lowBalance = balance < 50;

  // Derive single active amount
  const effectiveAmount = useMemo(() => {
    if (activeMode === "quick") return quickPreset;
    if (activeMode === "manual") {
      const parsed = parseFloat(manualInput);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return 0;
  }, [activeMode, quickPreset, manualInput]);

  // Validation for recharge amount
  useEffect(() => {
    if (activeMode === null || effectiveAmount === 0) {
      setError("");
      return;
    }
    if (effectiveAmount < MIN_RECHARGE) {
      setError(`Minimum recharge is ${formatINR(MIN_RECHARGE)}.`);
      return;
    }
    if (effectiveAmount > 50000) {
      setError(`Maximum recharge is ${formatINR(50000)}.`);
      return;
    }
    setError("");
  }, [activeMode, effectiveAmount]);

  // Handle Quick Recharge Preset selection
  const handleSelectQuick = (val: number) => {
    if (val === 0) {
      setQuickPreset(0);
      setActiveMode(null);
      return;
    }
    setQuickPreset(val);
    setManualInput("0");
    setActiveMode("quick");
  };

  // Handle Manual Amount input changes (typed values only)
  const handleManualChange = (raw: string) => {
    // Only accept numeric input: digits only or up to 2 decimal places
    if (raw !== "" && !/^\d*\.?\d{0,2}$/.test(raw)) {
      return;
    }
    setManualInput(raw);
    setQuickPreset(0);
    const num = parseFloat(raw);
    if (!raw.trim() || isNaN(num) || num <= 0) {
      setActiveMode(null);
    } else {
      setActiveMode("manual");
    }
  };

  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const recharge = async () => {
    if (!user) return;
    if (effectiveAmount < MIN_RECHARGE || error) {
      setError(error || `Minimum recharge is ${formatINR(MIN_RECHARGE)}.`);
      return;
    }
    setShowRechargeModal(true);
  };

  // Handle Withdrawal Request
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(withdrawAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setWithdrawError("Enter a valid withdrawal amount.");
      return;
    }
    if (amt > balance) {
      setWithdrawError(`Amount exceeds available balance of ${formatINR(balance)}.`);
      return;
    }
    if (!withdrawUpiId.trim() || !withdrawUpiId.includes("@")) {
      setWithdrawError("Enter a valid UPI ID (e.g. user@bank).");
      return;
    }

    setWithdrawError(
      "Bank settlement service is pending backend integration. No funds were debited.",
    );
  };

  const recent = txns.slice(0, 6);

  return (
    <DashboardShell>
      {/* Wallet Page Heading */}
      <div className="mb-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h1 className="font-[Sora] text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Wallet
        </h1>
        <span className="text-xs sm:text-sm md:text-base font-bold text-stone-800 dark:text-stone-300">
          - (Recharge once, ride without friction.)
        </span>
      </div>

      {lowBalance && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <FaTriangleExclamation />
            </div>
            <div>
              <div className="font-[Sora] text-sm font-bold text-amber-900 dark:text-amber-200">
                Low wallet balance
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300">
                You have only {formatINR(balance)} left. Recharge now to avoid booking
                interruptions.
              </div>
            </div>
          </div>
          <a
            href="#recharge"
            className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-amber-700"
          >
            Recharge now
          </a>
        </motion.div>
      )}

      {/* Top Section: Wallet Master Card & Quick Tips */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Wallet Balance Master Card */}
        <motion.div
          layout
          className="bg-railway-gradient relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-glow lg:col-span-2 flex flex-col justify-between"
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          />
          <div className="flex-1 flex flex-col justify-center py-2 sm:py-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/90">
              <FaWallet className="h-3.5 w-3.5" /> RailConnect wallet
            </div>
            <div className="mt-2.5 font-[Sora] text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatINR(balance)}
            </div>
            <div className="mt-1 text-xs text-white/80 font-medium">Available balance</div>
          </div>

          {/* 4 Distinct Statistic Containers: 2x2 grid on mobile, single row on sm/md/lg */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <SummaryStatCard label="Total Recharge" value={formatINR(stats.totalRecharge)} />
            <SummaryStatCard label="Total Spent" value={formatINR(stats.totalSpent)} />
            <SummaryStatCard
              label="Last Recharge"
              value={stats.lastRecharge ? new Date(stats.lastRecharge).toLocaleDateString() : "—"}
            />
            <SummaryStatCard
              label="Last Activity"
              value={stats.lastTxn ? new Date(stats.lastTxn).toLocaleDateString() : "—"}
            />
          </div>
        </motion.div>

        {/* Quick Tips Card */}
        <div className="glass rounded-3xl p-6 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 flex flex-col justify-between">
          <div>
            <h2 className="font-[Sora] text-lg font-bold text-stone-900 dark:text-stone-100">
              Quick Tips
            </h2>
            <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-stone-900 dark:text-stone-100 font-bold leading-none mt-1">
                  •
                </span>
                <span>Wallet balance never expires and has zero maintenance fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 dark:text-stone-100 font-bold leading-none mt-1">
                  •
                </span>
                <span>Wallet auto-pays instantly for Journey and Platform tickets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 dark:text-stone-100 font-bold leading-none mt-1">
                  •
                </span>
                <span>Automatic refund credit upon ticket cancellation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 dark:text-stone-100 font-bold leading-none mt-1">
                  •
                </span>
                <span>Manage saved payment methods in Settings.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-orange-100/60 dark:border-stone-800 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            <FaShieldHalved className="h-3.5 w-3.5 text-orange-500" /> 256-bit SSL · PCI-DSS
            compliant checkout
          </div>
        </div>
      </div>

      {/* Recharge Section: Aligned into consistent columns matching master card and quick tips */}
      <div id="recharge" className="mt-6 grid grid-cols-1 lg:grid-cols-3 items-start gap-5">
        {/* Left Card: Add Funds to Wallet */}
        <div className="glass rounded-3xl p-5 sm:p-6 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 lg:col-span-2">
          <div>
            {/* Header + Minimum Recharge Note */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-orange-100/70 dark:border-stone-800">
              <h2 className="font-[Sora] text-lg font-bold text-stone-900 dark:text-stone-100">
                Add Funds to Wallet
              </h2>
              <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-300">
                Minimum Recharge: ₹10.00
              </span>
            </div>

            {/* Quick Recharge Control */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 ease-out select-none",
                  activeMode === "quick"
                    ? "bg-orange-500 text-white border border-orange-600 shadow-xs ring-2 ring-orange-500/20 scale-[1.02]"
                    : "bg-orange-50/80 dark:bg-stone-800 text-orange-800 dark:text-orange-400 border border-orange-200/80 dark:border-stone-700 hover:bg-orange-100/80 hover:border-orange-300",
                )}
              >
                Quick Recharge
              </span>
              <select
                value={activeMode === "quick" ? quickPreset : 0}
                onChange={(e) => handleSelectQuick(Number(e.target.value))}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all duration-150 ease-out shadow-2xs hover:scale-[1.01] active:scale-[0.99] motion-reduce:transform-none",
                  activeMode === "quick"
                    ? "border-2 border-orange-500 bg-[#fffaf5] dark:bg-stone-800 text-orange-950 dark:text-orange-200 ring-2 ring-orange-500/20"
                    : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:border-orange-200 hover:bg-orange-50/20 focus:border-orange-400 focus:ring-1 focus:ring-orange-400",
                )}
              >
                <option value={0}>₹0.00</option>
                {QUICK_PRESETS.map((amt) => (
                  <option key={amt} value={amt}>
                    {formatINR(amt)}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Recharge Input (Typing Only, No Steppers / Scroll) */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Enter Recharge Amount
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[Sora] text-base font-bold text-orange-700 dark:text-orange-400 pointer-events-none">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={activeMode === "quick" ? "0" : manualInput}
                  onFocus={(e) => {
                    if (activeMode === "quick") {
                      setQuickPreset(0);
                      setManualInput("0");
                    }
                    setActiveMode("manual");
                    e.target.select();
                  }}
                  onBlur={() => {
                    if (manualInput.trim() === "" || manualInput === "0") {
                      setManualInput("0");
                      setActiveMode(null);
                    }
                  }}
                  onChange={(e) => handleManualChange(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="0"
                  className={cn(
                    "w-full rounded-xl py-2.5 pl-9 pr-4 font-[Sora] text-base sm:text-lg font-bold outline-none transition-all duration-150 shadow-2xs",
                    activeMode === "manual"
                      ? "border-2 border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 hover:border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400",
                  )}
                />
              </div>
              {error && (
                <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Payment Method
              </div>
              <RechargeMethodSection
                title="UPI"
                group="upi"
                selectedMethod={method}
                setMethod={setMethod}
              />
              <RechargeMethodSection
                title="CARDS"
                group="card"
                selectedMethod={method}
                setMethod={setMethod}
              />
              <RechargeMethodSection
                title="NET BANKING"
                group="netbanking"
                selectedMethod={method}
                setMethod={setMethod}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Recharge Summary (Compact, Aligned, Natural Height) */}
        <div className="glass rounded-3xl p-5 sm:p-6 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 lg:col-span-1 h-fit">
          <div className="pb-3 border-b border-orange-100/70 dark:border-stone-800 text-center font-[Sora] text-base font-bold text-stone-900 dark:text-stone-100">
            Recharge Summary
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm">
            <SummaryRow
              label="Amount"
              value={effectiveAmount > 0 ? formatINR(effectiveAmount) : "—"}
            />
            <SummaryRow
              label="Payment Method"
              value={PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "—"}
            />
            <SummaryRow label="Convenience Fee" value={effectiveAmount > 0 ? "₹0.00" : "—"} />
          </div>

          <div className="my-3.5 h-px bg-stone-200/80 dark:bg-stone-800" />

          <div className="flex items-baseline justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Total
            </div>
            <div className="font-[Sora] text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
              {effectiveAmount > 0 ? formatINR(effectiveAmount) : "—"}
            </div>
          </div>

          <button
            type="button"
            data-testid="recharge-submit-button"
            onClick={recharge}
            disabled={loading || effectiveAmount < MIN_RECHARGE || !!error}
            className="bg-railway-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:shadow-glow disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaCircleNotch className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <FaPlus className="h-4 w-4" />{" "}
                {effectiveAmount >= MIN_RECHARGE
                  ? `Recharge ${formatINR(effectiveAmount)}`
                  : "Recharge"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulated Withdrawal Section (PART 11) */}
      <div className="glass mt-6 rounded-3xl p-5 sm:p-6 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-orange-100/70 dark:border-stone-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-stone-800 text-orange-700 dark:text-orange-400 shadow-2xs">
            <FaMoneyBillTransfer className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-[Sora] text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
              Withdraw to Account
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
              Transfer refundable balance back to your personal UPI ID.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleWithdraw}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end"
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              min={1}
              max={balance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 100"
              className="w-full h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Payout Destination
            </label>
            <Select
              value={withdrawProvider}
              onValueChange={(val) =>
                setWithdrawProvider(val as "gpay" | "phonepe" | "paytm" | "bhim")
              }
            >
              <SelectTrigger
                id="payout-destination-trigger"
                className="w-full h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-2xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 data-[state=open]:border-orange-500 data-[state=open]:ring-2 data-[state=open]:ring-orange-500/20"
              >
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-50 min-w-[200px] rounded-xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-900 p-1.5 shadow-xl text-stone-800 dark:text-stone-200"
              >
                <SelectItem
                  value="gpay"
                  className="rounded-lg py-2 px-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-950 dark:hover:text-orange-200 focus:bg-orange-50 dark:focus:bg-stone-800 focus:text-orange-950 dark:focus:text-orange-200 cursor-pointer"
                >
                  Google Pay UPI
                </SelectItem>
                <SelectItem
                  value="phonepe"
                  className="rounded-lg py-2 px-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-950 dark:hover:text-orange-200 focus:bg-orange-50 dark:focus:bg-stone-800 focus:text-orange-950 dark:focus:text-orange-200 cursor-pointer"
                >
                  PhonePe UPI
                </SelectItem>
                <SelectItem
                  value="paytm"
                  className="rounded-lg py-2 px-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-950 dark:hover:text-orange-200 focus:bg-orange-50 dark:focus:bg-stone-800 focus:text-orange-950 dark:focus:text-orange-200 cursor-pointer"
                >
                  Paytm UPI
                </SelectItem>
                <SelectItem
                  value="bhim"
                  className="rounded-lg py-2 px-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-950 dark:hover:text-orange-200 focus:bg-orange-50 dark:focus:bg-stone-800 focus:text-orange-950 dark:focus:text-orange-200 cursor-pointer"
                >
                  BHIM UPI
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              UPI ID
            </label>
            <input
              type="text"
              value={withdrawUpiId}
              onChange={(e) => setWithdrawUpiId(e.target.value)}
              placeholder="username@bank"
              className="w-full h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 shadow-2xs"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={withdrawLoading || balance <= 0}
              className="w-full h-10 rounded-xl border border-orange-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700 font-bold text-xs uppercase tracking-wider transition shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {withdrawLoading ? (
                <>
                  <FaCircleNotch className="h-3.5 w-3.5 animate-spin" /> Transferring…
                </>
              ) : (
                "Request Withdrawal"
              )}
            </button>
          </div>
        </form>

        {withdrawError && (
          <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {withdrawError}
          </p>
        )}

        <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 italic">
          * Note: Bank settlement and withdrawal requests require CRIS/railway settlement
          integration. In production environments, withdrawal requests verify beneficiary KYC and
          route through authenticated bank settlement rails.
        </p>
      </div>

      {/* Recent Activity Section */}
      <div className="glass mt-6 rounded-3xl p-5 sm:p-6 shadow-soft border border-orange-100/60 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90">
        <div className="flex items-center justify-between pb-3.5 border-b border-orange-100/70 dark:border-stone-800">
          <h2 className="font-[Sora] text-lg font-bold text-stone-900 dark:text-stone-100">
            Recent Activity
          </h2>
          <Link
            to="/dashboard/transactions"
            className="group inline-flex items-center gap-1.5 rounded-full border border-orange-300 dark:border-stone-700 bg-white/95 dark:bg-stone-800 px-4 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-400 shadow-2xs transition hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-orange-800 hover:border-orange-400 cursor-pointer"
          >
            <span>View All</span>
            <FaArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-8 text-center text-sm font-medium text-stone-500 dark:text-stone-400">
              No wallet activity yet.
            </div>
          ) : (
            recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-transparent dark:border-stone-800/80 p-3 sm:p-3.5 shadow-2xs hover:bg-white dark:hover:bg-stone-800/90 hover:shadow-soft transition-all gap-2.5 sm:gap-3 group"
              >
                {/* Left: Circular transaction icon */}
                <div className="shrink-0">
                  {t.type === "refund" ? (
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-xs">
                      <FaRotateLeft className="h-4 w-4" />
                    </div>
                  ) : t.amount >= 0 ? (
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                      <FaArrowDown className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-railway-gradient flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-white shadow-xs">
                      <FaReceipt className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Centre: Title and secondary metadata */}
                <div className="min-w-0 flex-1">
                  <div className="font-[Sora] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug capitalize truncate sm:whitespace-normal">
                    {t.note}
                  </div>
                  <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                    <span className="sm:hidden">
                      {t.method} · {t.ref}
                    </span>
                    <span className="hidden sm:inline">
                      {t.ref} · {t.method} ·{" "}
                      {new Date(t.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Right: Amount and Status */}
                <div className="shrink-0 flex flex-col items-end text-right">
                  <div
                    className={`font-[Sora] text-xs sm:text-sm font-extrabold leading-tight ${
                      t.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {formatSignedINR(t.amount)}
                  </div>
                  <div className="mt-1">
                    <ActivityStatusBadge status={t.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showRechargeModal && (
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
              Recharge Gateway Pending
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              RailConnect wallet recharge requires an authenticated banking payment gateway. In this
              deployment, live payment processors are disconnected.
            </p>
            <div className="mt-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-left text-xs text-amber-900 dark:text-amber-300">
              <p className="font-semibold">No funds debited:</p>
              <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-400">
                Your bank account was not charged and wallet balance remains unchanged. No simulated
                transaction was recorded.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="bg-railway-gradient w-full rounded-xl py-2.5 px-4 text-xs font-semibold text-white shadow-soft hover:shadow-glow transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-[#fff9f4] dark:bg-stone-900/90 border border-orange-200/80 dark:border-stone-800 p-2.5 sm:p-2.5 text-stone-900 dark:text-stone-100 shadow-xs flex flex-col justify-between min-w-0">
      <div className="text-[11px] sm:text-[10px] md:text-[11px] font-bold text-stone-700 dark:text-stone-300 leading-tight">
        {label}
      </div>
      <div className="mt-1 font-[Sora] text-xs sm:text-xs md:text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate">
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className="text-stone-500 dark:text-stone-400 font-medium">{label}</span>
      <span className="font-bold text-stone-800 dark:text-stone-200">{value}</span>
    </div>
  );
}

function RechargeMethodSection({
  title,
  group,
  selectedMethod,
  setMethod,
}: {
  title: string;
  group: "upi" | "card" | "netbanking";
  selectedMethod: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
}) {
  const items = PAYMENT_METHODS.filter((m) => m.group === group);
  return (
    <div className="mt-3.5 first:mt-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {title}
        </span>
        <div className="ml-2.5 h-px flex-1 bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {items.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`group flex min-h-[54px] sm:min-h-[58px] items-center justify-between rounded-xl sm:rounded-2xl border px-3 py-2 text-left transition-all duration-150 outline-none cursor-pointer ${
                isSelected
                  ? "border-orange-500 bg-[#fffaf5] dark:bg-stone-800 shadow-xs ring-1 ring-orange-500/20"
                  : "border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-orange-200 hover:bg-orange-50/10 dark:hover:bg-stone-800/60 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <PaymentMethodLogo method={m.id} className="h-9 w-9 sm:h-10 sm:w-10" />
                <div className="min-w-0 flex-1">
                  <div className="font-[Sora] text-xs sm:text-[13px] font-bold text-stone-900 dark:text-stone-100 leading-tight truncate">
                    {m.label}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {m.hint}
                  </div>
                </div>
              </div>
              <div
                className={`flex h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                  isSelected ? "border-orange-500" : "border-stone-300 dark:border-stone-600"
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-orange-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
