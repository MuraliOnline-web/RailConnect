import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCircleCheck, FaWallet, FaReceipt, FaHouse, FaArrowRight } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { formatINR } from "../../lib/currency";

type Receipt = {
  ticketId: string;
  pnr: string;
  from: string;
  to: string;
  originalFare: number;
  refundPercent: number;
  cancellationCharge: number;
  refundAmount: number;
  refundTxnId: string;
  originalTxnId?: string;
  balance: number;
  eligible: boolean;
  reason: string;
  refundedAt: string;
};

export const Route = createFileRoute("/dashboard/refund-success")({
  head: () => ({ meta: [{ title: "Refund processed · RailConnect" }] }),
  component: RefundSuccessPage,
});

function RefundSuccessPage() {
  const [r, setR] = useState<Receipt | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("railconnect.lastRefundReceipt");
      if (raw) setR(JSON.parse(raw));
    } catch {
      // Ignore parse errors
    }
  }, []);

  if (!r) {
    return (
      <DashboardShell>
        <div className="glass rounded-3xl p-10 text-center shadow-soft">
          <h1 className="font-[Sora] text-xl font-bold">No recent refund</h1>
          <Link
            to="/dashboard/tickets"
            className="mt-4 inline-block text-sm font-semibold text-orange-700 hover:underline"
          >
            Go to my tickets
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft">
          <div className="rounded-[1.4rem] bg-white dark:bg-stone-900 dark:border dark:border-stone-800 p-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FaCircleCheck className="h-8 w-8" />
            </div>
            <h1 className="mt-4 font-[Sora] text-2xl font-extrabold text-stone-900 dark:text-stone-100">
              Ticket cancelled successfully
            </h1>
            <p className="mt-1 text-sm text-muted-foreground dark:text-stone-400">
              {r.eligible ? "Your refund has been credited to your RailConnect Wallet." : r.reason}
            </p>

            <div className="mt-6 rounded-2xl bg-orange-50 dark:bg-stone-800/60 border border-transparent dark:border-stone-700/60 p-5 text-left">
              <Row k="Ticket ID" v={r.ticketId.slice(0, 8).toUpperCase()} mono />
              <Row k="PNR" v={r.pnr} mono />
              <Row k="Route" v={`${r.from} → ${r.to}`} />
              <div className="my-3 h-px bg-orange-200 dark:bg-stone-700" />
              <Row k="Original fare" v={formatINR(r.originalFare)} />
              <Row
                k={`Cancellation charge (${100 - r.refundPercent}%)`}
                v={`− ${formatINR(r.cancellationCharge)}`}
              />
              <Row k={`Refund (${r.refundPercent}%)`} v={formatINR(r.refundAmount)} strong />
              <div className="my-3 h-px bg-orange-200 dark:bg-stone-700" />
              <Row k="Refund transaction ID" v={r.refundTxnId} mono />
              {r.originalTxnId && <Row k="Original payment ID" v={r.originalTxnId} mono />}
              <Row k="Refunded at" v={new Date(r.refundedAt).toLocaleString()} />
            </div>

            {r.eligible && (
              <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Updated wallet balance
                </div>
                <div className="font-[Sora] text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {formatINR(r.balance)}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Link
                to="/dashboard/wallet"
                className="bg-railway-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft"
              >
                <FaWallet /> View wallet
              </Link>
              <Link
                to="/dashboard/transactions"
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700"
              >
                <FaReceipt /> View transactions
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-100 dark:border-stone-700 bg-white/80 dark:bg-stone-800 px-4 py-3 text-sm font-semibold text-foreground/80 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-700"
              >
                <FaHouse /> Dashboard <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  );
}

function Row({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground dark:text-stone-400">{k}</span>
      <span
        className={`font-bold ${mono ? "font-mono text-xs uppercase" : ""} ${strong ? "text-orange-700 dark:text-orange-400" : "text-stone-900 dark:text-stone-100"}`}
      >
        {v}
      </span>
    </div>
  );
}
