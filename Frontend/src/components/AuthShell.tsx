import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RailLogo } from "./RailLogo";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen bg-background md:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-railway-gradient relative hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-black/15 blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="inline-flex">
            <div className="rounded-2xl bg-white/15 p-1 backdrop-blur">
              <div className="rounded-xl bg-white p-2">
                <RailLogo size={32} />
              </div>
            </div>
          </Link>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-[Sora] text-4xl font-extrabold leading-tight tracking-tight">
            Your platform.
            <br />
            Your train. <br />
            One tap away.
          </h2>
          <p className="mt-4 text-white/85">
            Paperless commuter tickets, season passes and live journey planning — engineered for the
            daily ride.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            {[
              ["1.2M", "Riders"],
              ["320+", "Stations"],
              ["10s", "To book"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
                <div className="font-[Sora] text-xl font-bold">{v}</div>
                <div className="mt-0.5 uppercase tracking-widest text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden">
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="mb-6 md:hidden">
            <RailLogo />
          </div>
          <div className="glass no-lift rounded-3xl p-7 shadow-soft sm:p-9">
            <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white px-4 py-2 text-xs font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 active:scale-[0.97]"
            >
              <span>←</span> Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </span>
      <input
        {...props}
        className="input-premium w-full rounded-xl border border-orange-100 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

export function PrimaryButton({
  loading,
  children,
  ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="bg-railway-gradient btn-premium relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow disabled:opacity-70"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
