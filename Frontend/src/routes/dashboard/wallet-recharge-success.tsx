import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaWallet, FaArrowLeft, FaReceipt } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/wallet-recharge-success")({
  head: () => ({ meta: [{ title: "Recharge successful · RailConnect" }] }),
  component: RechargeSuccess,
});

type Receipt = {
  amount: number;
  ref: string;
  method: string;
  paidAt: string;
  balance: number;
};

function RechargeSuccess() {
  const navigate = useNavigate();
  const [r, setR] = useState<Receipt | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("railconnect.lastRechargeReceipt");
      if (!raw) {
        navigate({ to: "/dashboard/wallet" });
        return;
      }
      setR(JSON.parse(raw));
    } catch {
      navigate({ to: "/dashboard/wallet" });
    }
  }, [navigate]);

  if (!r) return null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass overflow-hidden rounded-3xl p-8 text-center shadow-soft"
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="bg-railway-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-glow"
          >
            <FaCheck className="h-7 w-7" />
          </motion.div>
          <h1 className="mt-4 font-[Sora] text-2xl font-extrabold tracking-tight">
            Wallet recharge successful
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your balance is ready to use across the network.
          </p>

          <div className="mt-6 rounded-2xl bg-white/85 p-5 text-left">
            <Row k="Recharge amount" v={formatINR(r.amount)} highlight />
            <Row k="Transaction ID" v={r.ref} />
            <Row k="Payment method" v={r.method} />
            <Row k="Date & time" v={new Date(r.paidAt).toLocaleString()} />
            <div className="my-3 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
            <Row k="Updated wallet balance" v={formatINR(r.balance)} highlight />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/wallet"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-orange-700 shadow-soft hover:bg-orange-50"
            >
              <FaArrowLeft className="h-3 w-3" /> Back to wallet
            </Link>
            <Link
              to="/dashboard/transactions"
              className="bg-railway-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow"
            >
              <FaReceipt className="h-3 w-3" /> View transactions
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <FaWallet className="h-3 w-3 text-orange-500" /> Receipt saved to your transaction history
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-semibold ${highlight ? "font-[Sora] text-base text-railway-gradient" : ""}`}>
        {v}
      </span>
    </div>
  );
}