import { FaBuildingColumns } from "react-icons/fa6";
import type { PaymentMethodId } from "../lib/payment";

interface PaymentMethodLogoProps {
  method: PaymentMethodId;
  className?: string;
}

export function PaymentMethodLogo({ method, className = "" }: PaymentMethodLogoProps) {
  switch (method) {
    case "gpay":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-transparent overflow-hidden ${className}`}
        >
          <img
            src="/images/payment-brands/google-pay-circular.png"
            alt="Google Pay"
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      );

    case "phonepe":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#5f259f] text-white shadow-xs ${className}`}
        >
          <svg
            viewBox="0 0 32 32"
            className="h-5 w-5 sm:h-5.5 sm:w-5.5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M22.5 13.8c0-.6-.5-1.1-1.1-1.1h-2.1l-4.7-5.4c-.4-.5-1.1-.7-1.8-.5l-1.6.5c-.3.1-.3.4-.2.6l5.1 4.8H8.4c-.3 0-.4.2-.4.4v.9c0 .6.5 1.1 1.1 1.1h1.2v4.1c0 3.1 1.6 4.9 4.3 4.9.9 0 1.5-.1 2.4-.4v2.7c0 .8.6 1.4 1.4 1.4h1.2c.3 0 .5-.3.5-.5v-12.2h2c.3 0 .4-.2.4-.4v-.9zm-5.5 7.4c-.5.3-1.2.3-1.7.3-1.4 0-2-.7-2-2.2v-4.1h3.7v6z" />
          </svg>
        </div>
      );

    case "paytm":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-transparent overflow-hidden ${className}`}
        >
          <img
            src="/images/payment-brands/paytm-wallet-circular.png"
            alt="Paytm"
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      );

    case "bhim":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border border-stone-200/80 shadow-xs ${className}`}
        >
          <img
            src="/images/payment-brands/bhim-mark.svg"
            alt="BHIM UPI"
            className="h-5.5 sm:h-6 w-auto object-contain"
            loading="lazy"
          />
        </div>
      );

    case "wallet":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xs ${className}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white"
            aria-hidden="true"
          >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-1-1v2a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V7" />
            <path d="M16 13h4" />
            <circle cx="17.5" cy="13.5" r=".5" fill="currentColor" />
          </svg>
        </div>
      );

    case "credit":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border border-stone-200/80 shadow-xs ${className}`}
        >
          <img
            src="/images/payment-brands/visa.svg"
            alt="Visa"
            className="h-3.5 sm:h-4 w-auto max-w-[34px] sm:max-w-[38px] object-contain"
            loading="lazy"
          />
        </div>
      );

    case "debit":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border border-stone-200/80 shadow-xs ${className}`}
        >
          <img
            src="/images/payment-brands/mastercard.svg"
            alt="Mastercard"
            className="h-5 sm:h-5.5 w-auto max-w-[34px] sm:max-w-[38px] object-contain"
            loading="lazy"
          />
        </div>
      );

    case "netbanking":
      return (
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-white shadow-xs ${className}`}
        >
          <FaBuildingColumns className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
        </div>
      );

    default:
      return null;
  }
}
