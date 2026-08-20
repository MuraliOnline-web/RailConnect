import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaQrcode,
  FaRotateRight,
  FaTrain,
  FaCircleXmark,
  FaShieldHalved,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import {
  CATEGORY_LABEL,
  cancelTicket,
  getTicket,
  type Ticket,
} from "../../lib/tickets";
import { downloadTicketAndNotify } from "../../lib/ticketPdf";
import { computeRefund } from "../../lib/refund";
import { getWallet, makeRef, saveTxn, setWallet } from "../../lib/wallet";
import { formatINR } from "../../lib/currency";
import { pushNotification } from "../../lib/notifications";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../components/ui/alert-dialog";

type Search = { id?: string };

export const Route = createFileRoute("/dashboard/ticket")({
  head: () => ({ meta: [{ title: "Ticket details · RailConnect" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const [version, setVersion] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ticket = useMemo<Ticket | null>(
    () => (user && id ? getTicket(user.id, id) : null),
    [user, id, version],
  );
  const quote = useMemo(
    () => (ticket ? computeRefund(ticket) : null),
    [ticket, confirmOpen],
  );

  if (!ticket) {
    return (
      <DashboardShell>
        <div className="glass rounded-3xl p-10 text-center shadow-soft">
          <h1 className="font-[Sora] text-xl font-bold">Ticket not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been removed or the link is invalid.
          </p>
          <Link
            to="/dashboard/tickets"
            className="bg-railway-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            <FaArrowLeft className="h-3 w-3" /> Back to my tickets
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const onCancel = () => setConfirmOpen(true);

  const confirmCancel = () => {
    if (!user || !ticket || !quote) return;
    const refundTxnId = makeRef();
    if (quote.eligible && quote.refundAmount > 0) {
      const next = getWallet(user.id) + quote.refundAmount;
      setWallet(user.id, next);
      saveTxn({
        id: crypto.randomUUID(),
        userId: user.id,
        type: "refund",
        amount: quote.refundAmount,
        status: "success",
        method: "Wallet",
        ref: refundTxnId,
        note: `Refund for ticket ${ticket.pnr}`,
        createdAt: new Date().toISOString(),
        ticketId: ticket.id,
        originalTxnId: ticket.txnId,
        originalFare: quote.originalFare,
        refundPercent: quote.refundPercent,
        cancellationCharge: quote.cancellationCharge,
      });
    }
    cancelTicket(ticket.id, {
      originalFare: quote.originalFare,
      refundPercent: quote.refundPercent,
      cancellationCharge: quote.cancellationCharge,
      refundAmount: quote.refundAmount,
      refundTxnId,
      refundedAt: new Date().toISOString(),
    });
    pushNotification(user.id, {
      category: "refund",
      severity: "info",
      title: "Ticket cancelled",
      body: `${ticket.from} → ${ticket.to} · PNR ${ticket.pnr}`,
      href: "/dashboard/tickets",
    });
    if (quote.eligible && quote.refundAmount > 0) {
      pushNotification(user.id, {
        category: "refund",
        severity: "success",
        title: `Refund of ${formatINR(quote.refundAmount)} credited`,
        body: `Credited to your RailConnect Wallet. Ref ${refundTxnId}.`,
        href: "/dashboard/refunds",
      });
      toast.success(`Refund of ${formatINR(quote.refundAmount)} credited`, {
        description: "Added to your RailConnect Wallet.",
      });
    } else {
      toast.info("Ticket cancelled", {
        description: quote.reason || "No refund was applicable.",
      });
    }
    sessionStorage.setItem(
      "railconnect.lastRefundReceipt",
      JSON.stringify({
        ticketId: ticket.id,
        pnr: ticket.pnr,
        from: ticket.from,
        to: ticket.to,
        originalFare: quote.originalFare,
        refundPercent: quote.refundPercent,
        cancellationCharge: quote.cancellationCharge,
        refundAmount: quote.refundAmount,
        refundTxnId,
        originalTxnId: ticket.txnId,
        balance: getWallet(user.id),
        eligible: quote.eligible,
        reason: quote.reason,
        refundedAt: new Date().toISOString(),
      }),
    );
    setConfirmOpen(false);
    navigate({ to: "/dashboard/refund-success" });
  };

  const onBookAgain = () => {
    navigate({
      to: "/dashboard/journey",
      search: {
        from: ticket.fromCode,
        to: ticket.toCode,
        category: ticket.category,
        adults: ticket.adults,
        children: ticket.children,
      } as never,
    });
  };

  return (
    <DashboardShell>
      <div className="mb-5">
        <Link
          to="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-xs font-semibold text-orange-700 hover:underline"
        >
          <FaArrowLeft className="h-3 w-3" /> Back to tickets
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* Primary card */}
        <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft lg:col-span-2">
          <div className="rounded-[1.4rem] bg-white p-6">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="font-semibold">{ticket.type} · {ticket.line}</span>
              <span className="font-mono">{ticket.pnr}</span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                <div className="font-[Sora] text-2xl font-extrabold">{ticket.from}</div>
                {ticket.fromCode && (
                  <div className="text-[11px] font-mono text-muted-foreground">{ticket.fromCode}</div>
                )}
              </div>
              <div className="bg-railway-gradient flex h-11 w-11 items-center justify-center rounded-full text-white">
                <FaTrain />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">To</div>
                <div className="font-[Sora] text-2xl font-extrabold">{ticket.to}</div>
                {ticket.toCode && (
                  <div className="text-[11px] font-mono text-muted-foreground">{ticket.toCode}</div>
                )}
              </div>
            </div>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KV k="Ticket ID" v={ticket.id.slice(0, 8).toUpperCase()} mono />
              <KV k="Transaction ID" v={ticket.txnId || "—"} mono />
              <KV k="Train category" v={ticket.category ? CATEGORY_LABEL[ticket.category] : "Passenger"} />
              <KV k="Ticket type" v={ticket.type} />
              <KV k="Passengers" v={`${ticket.adults} adult · ${ticket.children} child`} />
              <KV k="Issued" v={new Date(ticket.createdAt).toLocaleString()} />
              <KV k="Valid until" v={new Date(ticket.validUntil).toLocaleString()} />
              <KV k="Railway zone" v={ticket.line} />
              <KV k="Payment method" v={ticket.paymentMethod || "—"} />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-50 p-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange-700">Amount paid</div>
                <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">{formatINR(ticket.fare)}</div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Actions
          </div>
          <div className="mt-4 space-y-2">
            {ticket.status === "active" && (
              <Link
                to="/dashboard/qr"
                search={{ id: ticket.id } as never}
                className="bg-railway-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow"
              >
                <FaQrcode /> View QR
              </Link>
            )}
            <button
              onClick={() => downloadTicketAndNotify(ticket, user?.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
            >
              <FaDownload /> Download PDF
            </button>
            <button
              onClick={onBookAgain}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-100 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground/80 hover:bg-white"
            >
              <FaRotateRight /> Book again <FaArrowRight className="h-3 w-3" />
            </button>
            {ticket.status === "active" && (
              <button
                onClick={onCancel}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                <FaCircleXmark /> Cancel ticket
              </button>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-700">
            <FaShieldHalved /> Verified by RailConnect
          </div>
        </div>
      </motion.div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-[Sora]">Cancel this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              {quote?.eligible
                ? `${quote.reason} The refund will be credited to your RailConnect Wallet instantly.`
                : quote?.reason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {quote && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm">
              <BreakdownRow k="Original fare" v={formatINR(quote.originalFare)} />
              <BreakdownRow
                k={`Cancellation charge (${100 - quote.refundPercent}%)`}
                v={`− ${formatINR(quote.cancellationCharge)}`}
              />
              <div className="my-2 h-px bg-orange-200" />
              <BreakdownRow
                k={`Refund amount (${quote.refundPercent}%)`}
                v={formatINR(quote.refundAmount)}
                strong
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep ticket</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-railway-gradient rounded-full text-white"
            >
              {quote?.eligible ? `Cancel & refund ${formatINR(quote.refundAmount)}` : "Cancel ticket"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}

function BreakdownRow({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{k}</span>
      <span className={`font-[Sora] ${strong ? "text-base font-extrabold text-orange-700" : "text-sm font-bold"}`}>{v}</span>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-orange-50/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`truncate text-sm font-bold capitalize ${mono ? "font-mono uppercase" : ""}`}>{v}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    active: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    expired: "bg-gray-100 text-gray-600 ring-gray-300",
    cancelled: "bg-rose-100 text-rose-700 ring-rose-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ${map[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-emerald-500" : status === "expired" ? "bg-gray-400" : "bg-rose-500"
        }`}
      />
      {status}
    </span>
  );
}