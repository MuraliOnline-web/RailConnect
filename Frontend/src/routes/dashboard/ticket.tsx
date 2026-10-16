import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaQrcode,
  FaRotateRight,
  FaTicket,
  FaTrain,
  FaCircleXmark,
  FaShieldHalved,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { CATEGORY_LABEL, cancelTicket, getTicket, type Ticket } from "../../lib/tickets";
import { downloadTicketAndNotify } from "../../lib/ticketPdf";
import { computeRefund } from "../../lib/refund";
import { formatINR } from "../../lib/currency";
import { pushNotification } from "../../lib/notifications";
import { getPaymentLabel } from "../../lib/payment";
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
  const quote = useMemo(() => (ticket ? computeRefund(ticket) : null), [ticket, confirmOpen]);

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
    // Honest prototype behaviour: do NOT mutate settled ticket status or claim railway cancellation/monetary refund
    setConfirmOpen(false);
  };

  const onBookAgain = () => {
    if (ticket.type === "platform") {
      navigate({ to: "/dashboard/platform" });
      return;
    }
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
          className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-white/95 px-4 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-orange-50 hover:border-orange-300 hover:text-orange-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-stone-900/90 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-orange-400"
        >
          <FaArrowLeft className="h-3 w-3 text-orange-600 dark:text-orange-400" /> Back to Tickets
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 lg:grid-cols-3 items-stretch"
      >
        {/* Primary card */}
        <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft lg:col-span-2 flex flex-col h-full">
          <div className="rounded-[1.4rem] bg-white dark:bg-stone-900/95 dark:border dark:border-stone-800 p-6 h-full flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {ticket.type === "platform"
                    ? `PLATFORM · ${ticket.line || "WESTERN"}`
                    : `${ticket.type} · ${ticket.line || "WESTERN"}`}
                </span>
                <span className="font-mono text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  {ticket.pnr}
                </span>
              </div>

              {ticket.type === "platform" ? (
                /* Platform Ticket Details Layout — NEVER display FROM and TO fields */
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-orange-50/50 dark:bg-stone-800/60 border border-orange-100/70 dark:border-stone-700/60 p-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">
                      Platform Station
                    </div>
                    <div className="font-[Sora] text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                      {ticket.from}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-stone-600 dark:text-stone-400">
                      {ticket.fromCode && (
                        <span className="font-mono text-[10px] font-bold bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-orange-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                          {ticket.fromCode}
                        </span>
                      )}
                      <span>{ticket.adults || 1} Person(s)</span>
                      <span>·</span>
                      <span className="text-orange-700 dark:text-orange-400 font-semibold">
                        Valid for 2 hours only
                      </span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-soft">
                    <FaTicket className="h-6 w-6" />
                  </div>
                </div>
              ) : (
                /* Journey Ticket Route Layout */
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-stone-400 font-semibold">
                      From
                    </div>
                    <div className="font-[Sora] text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                      {ticket.from}
                    </div>
                    {ticket.fromCode && (
                      <div className="text-[11px] font-mono font-medium text-muted-foreground dark:text-stone-400">
                        {ticket.fromCode}
                      </div>
                    )}
                  </div>
                  <div className="bg-railway-gradient flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xs">
                    <FaTrain className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-stone-400 font-semibold">
                      To
                    </div>
                    <div className="font-[Sora] text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                      {ticket.to}
                    </div>
                    {ticket.toCode && (
                      <div className="text-[11px] font-mono font-medium text-muted-foreground dark:text-stone-400">
                        {ticket.toCode}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-stone-700 to-transparent" />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <KV k="Ticket ID" v={ticket.id.slice(0, 8).toUpperCase()} mono />
                <KV k="Transaction ID" v={ticket.txnId || "—"} mono />
                <KV
                  k={ticket.type === "platform" ? "Classification" : "Train Category"}
                  v={
                    ticket.type === "platform"
                      ? "Platform Ticket"
                      : ticket.category
                        ? CATEGORY_LABEL[ticket.category]
                        : "Passenger"
                  }
                />
                <KV
                  k="Ticket Type"
                  v={
                    ticket.type === "season"
                      ? "Season Pass"
                      : ticket.type === "platform"
                        ? "Platform"
                        : "Journey"
                  }
                />
                <KV
                  k="Passengers"
                  v={
                    ticket.type === "platform"
                      ? `${ticket.adults || 1} Person(s)`
                      : `${ticket.adults} Adult · ${ticket.children} Child`
                  }
                />
                <KV k="Issued" v={new Date(ticket.createdAt).toLocaleString()} />
                <KV k="Valid Until" v={new Date(ticket.validUntil).toLocaleString()} />
                <KV k="Railway Zone" v={ticket.line || "Western"} />
                <KV k="Payment Method" v={getPaymentLabel(ticket.paymentMethod)} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-50/80 dark:bg-stone-800/60 border border-orange-100 dark:border-stone-700/60 p-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Amount Paid
                </div>
                <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
                  {formatINR(ticket.fare)}
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-1 flex flex-col justify-between h-full">
          <div>
            <div className="text-center font-[Sora] text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              Actions
            </div>
            <div className="mt-4 space-y-2.5 sm:space-y-3">
              {ticket.status === "active" && (
                <Link
                  to="/dashboard/qr"
                  search={{ id: ticket.id } as never}
                  className="bg-gradient-to-r from-[#f97316] to-[#ea580c] border border-orange-500/20 flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-[#ea580c] hover:to-[#c2410c] hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <FaQrcode className="h-3.5 w-3.5" /> View QR
                </Link>
              )}
              <button
                type="button"
                onClick={() => downloadTicketAndNotify(ticket, user?.id)}
                className="flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-800/80 px-4 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 hover:border-stone-300 dark:hover:border-stone-600 shadow-2xs transition-all cursor-pointer active:scale-[0.99]"
              >
                <FaDownload className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" /> Download
                PDF
              </button>
              <button
                type="button"
                onClick={onBookAgain}
                className="flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-800/80 px-4 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 hover:border-stone-300 dark:hover:border-stone-600 shadow-2xs transition-all cursor-pointer active:scale-[0.99]"
              >
                <FaRotateRight className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" /> Book
                Again
                <FaArrowRight className="h-3 w-3 text-stone-400 dark:text-stone-500" />
              </button>
              {ticket.status === "active" && (
                <button
                  type="button"
                  data-testid="cancel-ticket-button"
                  onClick={onCancel}
                  className="flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-4 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-300 shadow-2xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <FaCircleXmark className="h-3.5 w-3.5" /> Cancel Ticket
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-2">
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/40 p-2.5 text-[11px] font-semibold text-stone-600 dark:text-stone-400 shadow-2xs">
              <FaShieldHalved className="h-3.5 w-3.5 text-orange-500" /> Digital Ticket Display ·
              Prototype Mode
            </div>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl dark:bg-stone-900 dark:border-stone-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-[Sora] dark:text-stone-100">
              Railway Cancellation Service Pending
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-stone-400">
              Official unreserved ticket cancellation and refund disbursement require backend
              integration with Indian Railways (CRIS/IRCTC) and banking settlement rails. In this
              deployment, live railway cancellation is disconnected. No ticket has been cancelled,
              your ticket remains active in local storage, and no refund transaction was recorded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {quote && (
            <div className="rounded-2xl border border-orange-100 dark:border-stone-800 bg-orange-50/60 dark:bg-stone-800/60 p-4 text-sm">
              <BreakdownRow k="Original fare" v={formatINR(quote.originalFare)} />
              <BreakdownRow
                k={`Estimated cancellation fee (${100 - quote.refundPercent}%)`}
                v={`− ${formatINR(quote.cancellationCharge)}`}
              />
              <div className="my-2 h-px bg-orange-200 dark:bg-stone-700" />
              <BreakdownRow
                k={`Estimated refund quote (${quote.refundPercent}%)`}
                v={formatINR(quote.refundAmount)}
                strong
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-700">
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-cancel-button"
              onClick={confirmCancel}
              className="bg-railway-gradient rounded-full text-white cursor-pointer"
            >
              Understood
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
      <span
        className={
          strong
            ? "font-semibold text-foreground dark:text-stone-200"
            : "text-muted-foreground dark:text-stone-400"
        }
      >
        {k}
      </span>
      <span
        className={`font-[Sora] ${strong ? "text-base font-extrabold text-orange-700 dark:text-orange-400" : "text-sm font-bold text-stone-900 dark:text-stone-100"}`}
      >
        {v}
      </span>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-orange-50/60 dark:bg-stone-800/60 border border-transparent dark:border-stone-700/50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-stone-400">
        {k}
      </div>
      <div
        className={`truncate text-sm font-bold capitalize text-stone-900 dark:text-stone-100 ${mono ? "font-mono uppercase" : ""}`}
      >
        {v}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    active:
      "bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800",
    expired:
      "bg-red-50/90 text-red-700 ring-red-400 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-800",
    cancelled:
      "bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ${map[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status === "expired"
              ? "bg-red-500"
              : "bg-rose-500"
        }`}
      />
      {status}
    </span>
  );
}
