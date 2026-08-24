import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaPlus,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaTriangleExclamation,
  FaGooglePay,
  FaPhone,
  FaMobileScreen,
  FaCreditCard,
  FaBuildingColumns,
  FaShieldHalved,
  FaCircleNotch,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { getWallet, loadTxns, makeRef, saveTxn, setWallet } from "../../lib/wallet";
import { PAYMENT_METHODS, type PaymentMethodId } from "../../lib/payment";
import { formatINR, formatSignedINR } from "../../lib/currency";
import { pushNotification } from "../../lib/notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({ meta: [{ title: "Wallet · RailConnect" }] }),
  component: WalletPage,
});

const MIN_RECHARGE = 10;
const QUICK = [50, 100, 200, 500, 1000, 2000];

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

function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<ReturnType<typeof loadTxns>>([]);
  const [amount, setAmount] = useState(200);
  const [method, setMethod] = useState<PaymentMethodId>("gpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const validate = (v: number) => {
    if (!Number.isFinite(v) || v <= 0) return "Enter a valid amount.";
    if (v < MIN_RECHARGE) return `Minimum recharge is ${formatINR(MIN_RECHARGE)}.`;
    if (v > 50000) return `Maximum recharge is ${formatINR(50000)}.`;
    return "";
  };

  useEffect(() => {
    setError(validate(amount));
  }, [amount]);

  const recharge = async () => {
    if (!user) return;
    const err = validate(amount);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const next = balance + amount;
    setWallet(user.id, next);
    const ref = makeRef();
    const m = PAYMENT_METHODS.find((p) => p.id === method)!;
    const apiMethod =
      m.group === "upi"
        ? "UPI"
        : m.group === "card"
          ? "Card"
          : m.group === "netbanking"
            ? "NetBanking"
            : "Wallet";
    saveTxn({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "recharge",
      amount,
      status: "success",
      method: apiMethod,
      ref,
      note: `Wallet recharge via ${m.label}`,
      createdAt: new Date().toISOString(),
    });
    sessionStorage.setItem(
      "railconnect.lastRechargeReceipt",
      JSON.stringify({
        amount,
        ref,
        method: m.label,
        paidAt: new Date().toISOString(),
        balance: next,
      }),
    );
    setLoading(false);
    pushNotification(user.id, {
      category: "wallet",
      severity: "success",
      title: "Wallet recharged successfully",
      body: `${formatINR(amount)} added via ${m.label}. New balance ${formatINR(next)}.`,
      href: "/dashboard/wallet",
    });
    toast.success("Wallet recharged", {
      description: `${formatINR(amount)} added. Balance ${formatINR(next)}.`,
    });
    navigate({ to: "/dashboard/wallet-recharge-success" });
  };

  const recent = txns.slice(0, 6);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recharge once, ride without friction.</p>
      </div>

      {lowBalance && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <FaTriangleExclamation />
            </div>
            <div>
              <div className="font-[Sora] text-sm font-bold text-amber-900">Low wallet balance</div>
              <div className="text-xs text-amber-800">
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

      {/* Summary */}
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          layout
          className="bg-railway-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-glow lg:col-span-2"
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          />
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/85">
            <FaWallet /> RailConnect wallet
          </div>
          <div className="mt-3 font-[Sora] text-5xl font-extrabold tracking-tight">
            {formatINR(balance)}
          </div>
          <div className="mt-1 text-xs text-white/80">Available balance</div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Total recharges" value={formatINR(stats.totalRecharge)} />
            <SummaryStat label="Total spent" value={formatINR(stats.totalSpent)} />
            <SummaryStat
              label="Last recharge"
              value={stats.lastRecharge ? new Date(stats.lastRecharge).toLocaleDateString() : "—"}
            />
            <SummaryStat
              label="Last activity"
              value={stats.lastTxn ? new Date(stats.lastTxn).toLocaleDateString() : "—"}
            />
          </div>
        </motion.div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="font-[Sora] text-lg font-bold">Quick tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Recharge ≥ {formatINR(500)} to earn 2% cashback.</li>
            <li>• Wallet auto-pays for all bookings.</li>
            <li>• Refunds settle in under 24 hours.</li>
            <li>• Manage payment methods in Settings.</li>
          </ul>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <FaShieldHalved className="h-3 w-3 text-orange-500" /> 256-bit SSL · PCI-DSS compliant
          </div>
        </div>
      </div>

      {/* Recharge */}
      <div id="recharge" className="glass mt-6 rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-[Sora] text-lg font-bold">Add money to wallet</h2>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Min {formatINR(MIN_RECHARGE)}
          </span>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick recharge
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    amount === a
                      ? "bg-railway-gradient text-white shadow-soft"
                      : "bg-white/80 text-foreground/80 hover:bg-white"
                  }`}
                >
                  {formatINR(a)}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Enter recharge amount
            </label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-orange-700">
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_RECHARGE}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                placeholder="Enter Amount"
                className="w-full rounded-xl border border-orange-100 bg-white/90 py-3 pl-9 pr-4 font-[Sora] text-lg font-bold outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
              />
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}

            <div className="mt-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment method
            </div>
            <MethodGroup title="UPI" group="upi" method={method} setMethod={setMethod} />
            <MethodGroup title="Cards" group="card" method={method} setMethod={setMethod} />
            <MethodGroup
              title="Net banking"
              group="netbanking"
              method={method}
              setMethod={setMethod}
            />
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white/80 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recharge summary
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Row k="Amount" v={formatINR(amount || 0)} />
              <Row k="Method" v={PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "—"} />
              <Row k="Convenience fee" v={formatINR(0)} />
            </div>
            <div className="my-3 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
            <div className="flex items-end justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                Total
              </div>
              <div className="font-[Sora] text-2xl font-extrabold text-railway-gradient">
                {formatINR(amount || 0)}
              </div>
            </div>
            <button
              onClick={recharge}
              disabled={loading || !!error}
              className="bg-railway-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FaCircleNotch className="h-3.5 w-3.5 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <FaPlus className="h-3.5 w-3.5" /> Recharge {formatINR(amount || 0)}
                </>
              )}
            </button>
            <div className="mt-3 text-center text-[10px] text-muted-foreground">
              Updated balance after recharge:{" "}
              <span className="font-semibold text-foreground">
                {formatINR(balance + (amount || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass mt-6 rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-[Sora] text-lg font-bold">Recent activity</h2>
          <Link
            to="/dashboard/transactions"
            className="text-xs font-semibold text-orange-600 hover:underline"
          >
            View all <FaArrowRight className="inline h-2.5 w-2.5" />
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-8 text-center text-sm text-muted-foreground">
              No wallet activity yet.
            </div>
          ) : (
            recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
                      t.amount >= 0 ? "bg-emerald-500" : "bg-railway-gradient"
                    }`}
                  >
                    {t.amount >= 0 ? <FaArrowDown /> : <FaArrowUp />}
                  </div>
                  <div>
                    <div className="font-semibold capitalize">{t.note}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.ref} · {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-[Sora] font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-foreground"}`}
                >
                  {formatSignedINR(t.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </div>
      <div className="mt-0.5 truncate font-[Sora] text-sm font-bold">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function MethodGroup({
  title,
  group,
  method,
  setMethod,
}: {
  title: string;
  group: "upi" | "card" | "netbanking";
  method: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
}) {
  const items = PAYMENT_METHODS.filter((m) => m.group === group);
  return (
    <div className="mt-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left shadow-soft transition ${
                selected
                  ? "border-orange-400 bg-orange-50/80"
                  : "border-orange-100 bg-white/80 hover:bg-white"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
                  selected ? "bg-railway-gradient text-white" : "bg-orange-50 text-orange-700"
                }`}
              >
                {methodIcon[m.id]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-[Sora] text-sm font-bold">{m.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{m.hint}</div>
              </div>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-orange-500" : "border-orange-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${selected ? "bg-railway-gradient" : "bg-transparent"}`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
