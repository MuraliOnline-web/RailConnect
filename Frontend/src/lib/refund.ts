import type { Ticket } from "./tickets";

export type RefundQuote = {
  eligible: boolean;
  reason: string;
  originalFare: number;
  refundPercent: number;
  cancellationCharge: number;
  refundAmount: number;
};

export function computeRefund(ticket: Ticket): RefundQuote {
  const fare = ticket.fare;
  const now = Date.now();
  const createdAt = new Date(ticket.createdAt).getTime();
  const validUntil = new Date(ticket.validUntil).getTime();
  const minsSinceBooking = (now - createdAt) / 60000;

  if (ticket.status === "cancelled") {
    return {
      eligible: false,
      reason: "Ticket is already cancelled.",
      originalFare: fare,
      refundPercent: 0,
      cancellationCharge: fare,
      refundAmount: 0,
    };
  }
  if (now > validUntil || ticket.status === "expired") {
    return {
      eligible: false,
      reason: "Expired tickets are not eligible for refund.",
      originalFare: fare,
      refundPercent: 0,
      cancellationCharge: fare,
      refundAmount: 0,
    };
  }

  let percent = 75;
  let reason = "Standard cancellation (after 30 minutes of booking).";
  if (minsSinceBooking <= 5) {
    percent = 95;
    reason = "Cancelled within 5 minutes of booking.";
  } else if (minsSinceBooking <= 30) {
    percent = 90;
    reason = "Cancelled within 30 minutes of booking.";
  }
  const refundAmount = Math.round((fare * percent) / 100 * 100) / 100;
  const cancellationCharge = Math.round((fare - refundAmount) * 100) / 100;
  return {
    eligible: true,
    reason,
    originalFare: fare,
    refundPercent: percent,
    cancellationCharge,
    refundAmount,
  };
}
