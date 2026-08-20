import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaDownload, FaHouse, FaTicket, FaTrain } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { CATEGORY_LABEL, loadTickets } from "../../lib/tickets";
import { loadReceipt, PAYMENT_METHODS } from "../../lib/payment";
import { downloadTicketAndNotify } from "../../lib/ticketPdf";
import { formatINR } from "../../lib/currency";

export const Route = createFileRoute("/dashboard/payment-success")({
  head: () => ({ meta: [{ title: "Payment successful · RailConnect" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const receipt = useMemo(() => loadReceipt(), []);
  const ticket = useMemo(
    () => (user && receipt ? loadTickets(user.id).find((t) => t.id === receipt.ticketId) : null),
    [user, receipt],
  );

  useEffect(() => {
    if (!receipt) navigate({ to: "/dashboard" });
  }, [receipt, navigate]);

  if (!receipt) return null;
  const methodLabel = PAYMENT_METHODS.find((m) => m.id === receipt.method)?.label ?? receipt.method;
  const paidAt = new Date(receipt.paidAt);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass rounded-3xl p-7 text-center shadow-soft"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="bg-railway-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-glow"
          >
            <FaCheck className="h-7 w-7" />
          </motion.div>
          <h1 className="mt-4 font-[Sora] text-3xl font-extrabold tracking-tight">
            Payment successful
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your RailConnect ticket has been issued. Have a safe journey.
          </p>

          <div className="mt-6 rounded-2xl border border-orange-100 bg-white/80 p-5 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-[Sora] text-lg font-bold">{receipt.fromName}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Source
                </div>
              </div>
              <div className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-full text-white">
                <FaTrain />
              </div>
              <div className="text-right">
                <div className="font-[Sora] text-lg font-bold">{receipt.toName}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Destination
                </div>
              </div>
            </div>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KV k="Ticket ID" v={receipt.pnr} />
              <KV k="Transaction ID" v={receipt.txnId} />
              <KV k="Method" v={methodLabel} />
              <KV k="Category" v={CATEGORY_LABEL[receipt.category]} />
              <KV k="Passengers" v={`${receipt.adults}A · ${receipt.children}C`} />
              <KV k="Paid at" v={paidAt.toLocaleString()} />
            </div>
            <div className="mt-5 rounded-xl bg-orange-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                Amount paid
              </div>
              <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
                {formatINR(receipt.amount)}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <Link
              to={receipt.delivery === "digital" ? "/dashboard/qr" : "/dashboard/tickets"}
              className="bg-railway-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow"
            >
              <FaTicket /> View ticket
            </Link>
            <button
              onClick={() => ticket && downloadTicketAndNotify(ticket, user?.id)}
              disabled={!ticket}
              className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-60"
            >
              <FaDownload /> Download PDF
            </button>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl border border-orange-100 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground/80 hover:bg-white"
            >
              <FaHouse /> Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="truncate font-mono text-sm font-bold">{v}</div>
    </div>
  );
}