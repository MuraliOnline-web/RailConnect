import jsPDF from "jspdf";
import { CATEGORY_LABEL, type Ticket } from "./tickets";
import { getPaymentLabel } from "./payment";
import { pushNotification } from "./notifications";
import { toast } from "sonner";

export function downloadTicketPdf(t: Ticket) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  let y = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(232, 71, 14); // RailConnect orange
  doc.text("RAILCONNECT", 40, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("Digital Railway Ticket", 40, y);

  y += 35;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Ticket Reference", 40, y);
  if (t.txnId) {
    doc.text("Transaction ID", w / 2, y);
  }

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  const ticketRef = t.pnr || t.id.slice(0, 8).toUpperCase();
  doc.text(ticketRef, 40, y);
  if (t.txnId) {
    doc.text(t.txnId, w / 2, y);
  }

  y += 25;

  // QR Box
  const boxX = 40;
  const boxW = w - 80;
  const qrSize = 100;
  const boxH = 140;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.rect(boxX, y, boxW, boxH);

  drawPseudoQr(doc, t.pnr, boxX + 25, y + 20, qrSize);

  // STATUS & SCAN inside box
  const rightX = boxX + qrSize + 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  if (t.status === "active") {
    doc.setTextColor(16, 185, 129); // emerald
  } else {
    doc.setTextColor(225, 29, 72); // rose
  }
  doc.text(t.status.toUpperCase(), rightX, y + 45);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text("SCAN TO VERIFY", rightX, y + 75);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Show this QR code for ticket verification.", rightX, y + 92);

  y += boxH + 25;

  // Section divider function
  const drawDivider = (yPos: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1);
    doc.line(40, yPos, w - 40, yPos);
  };

  drawDivider(y);
  y += 25;

  // JOURNEY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("JOURNEY", 40, y);

  y += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("FROM", 40, y);

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(t.from, 65, y);
  if (t.fromCode) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(t.fromCode, 65, y + 14);
  }

  // Journey Vertical Dots
  doc.setDrawColor(232, 71, 14);
  doc.setFillColor(232, 71, 14);
  doc.circle(50, y - 4, 3, "F");
  doc.setLineWidth(1);
  doc.line(50, y + 5, 50, y + 35);
  doc.setFillColor(40, 40, 40);
  doc.setDrawColor(40, 40, 40);
  doc.circle(50, y + 44, 3, "F");

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("TO", 40, y);

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(t.to, 65, y);
  if (t.toCode) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(t.toCode, 65, y + 14);
  }

  y += 28;
  if (t.via || t.distanceKm || t.journeyType) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    let lineText = "";
    if (t.via) lineText += `Via: ${t.via}      `;
    if (t.distanceKm) lineText += `Distance: ${t.distanceKm} KM      `;
    if (t.journeyType) lineText += `Journey Type: ${t.journeyType}`;
    doc.text(lineText, 40, y);
    y += 20;
  }

  drawDivider(y);
  y += 25;

  // 3-Col Layout: PASSENGERS / TICKET DETAILS / BOOKING DETAILS
  const col1 = 40;
  const col2 = 200;
  const col3 = 400;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("PASSENGERS", col1, y);
  doc.text("TICKET DETAILS", col2, y);
  doc.text("BOOKING DETAILS", col3, y);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  };

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Adults: ${t.adults}`, col1, y);
  doc.text(
    `Type: ${t.type === "journey" ? "Journey Ticket" : t.type === "season" ? "Season Ticket" : "Platform Ticket"}`,
    col2,
    y,
  );

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Booked On", col3, y);

  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Children: ${t.children}`, col1, y);
  doc.text(`Category: ${t.category ? CATEGORY_LABEL[t.category] : "Passenger"}`, col2, y);
  doc.text(formatDate(t.createdAt), col3, y);

  y += 14;
  doc.text(`Class: ${t.classType === "1st" ? "First Class" : "Second Class"}`, col2, y);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Valid Until", col3, y);

  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(formatDate(t.validUntil), col3, y);

  y += 25;
  drawDivider(y);
  y += 25;

  // PAYMENT METHOD & TOTAL FARE
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("PAYMENT METHOD", col1, y);
  doc.text("TOTAL FARE", w / 2, y);

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(getPaymentLabel(t.paymentMethod), col1, y);
  doc.text(`INR ${t.fare}`, w / 2, y);

  y += 30;

  if (t.validityRule) {
    drawDivider(y);
    y += 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text("JOURNEY VALIDITY", 40, y);

    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitRule = doc.splitTextToSize(t.validityRule, w - 80);
    doc.text(splitRule, 40, y);
    y += splitRule.length * 14 + 11;
  }

  drawDivider(y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Please retain this ticket for journey verification.", 40, y);

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Issued by RailConnect", 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(" · Digital Railway Ticket", 40 + doc.getTextWidth("Issued by RailConnect"), y);

  doc.save(`railconnect-${t.pnr}.pdf`);
}

export function downloadTicketAndNotify(t: Ticket, userId?: string) {
  try {
    downloadTicketPdf(t);
    toast.success("PDF downloaded successfully", {
      description: `railconnect-${t.pnr}.pdf saved to your device.`,
    });
    if (userId) {
      pushNotification(userId, {
        category: "booking",
        severity: "success",
        title: "PDF downloaded successfully",
        body: `${t.from} → ${t.to} · PNR ${t.pnr}`,
        href: "/dashboard/tickets",
      });
    }
  } catch (e) {
    toast.error("Could not generate PDF", {
      description: "Please try again in a moment.",
    });
  }
}

function drawPseudoQr(doc: jsPDF, seed: string, x: number, y: number, size: number) {
  const grid = 21;
  const cell = size / grid;
  // background
  doc.setFillColor(255, 255, 255);
  doc.rect(x - 4, y - 4, size + 8, size + 8, "F");
  doc.setDrawColor(232, 71, 14);
  doc.setLineWidth(0.8);
  doc.rect(x - 4, y - 4, size + 8, size + 8);

  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  doc.setFillColor(20, 20, 20);
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const finder = (gx < 7 && gy < 7) || (gx >= grid - 7 && gy < 7) || (gx < 7 && gy >= grid - 7);
      if (finder) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h & 1) === 1) {
        doc.rect(x + gx * cell, y + gy * cell, cell, cell, "F");
      }
    }
  }

  // finders
  const corners: [number, number][] = [
    [0, 0],
    [grid - 7, 0],
    [0, grid - 7],
  ];
  for (const [fx, fy] of corners) {
    doc.setFillColor(232, 71, 14);
    doc.rect(x + fx * cell, y + fy * cell, 7 * cell, 7 * cell, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(x + (fx + 1) * cell, y + (fy + 1) * cell, 5 * cell, 5 * cell, "F");
    doc.setFillColor(20, 20, 20);
    doc.rect(x + (fx + 2) * cell, y + (fy + 2) * cell, 3 * cell, 3 * cell, "F");
  }
}
