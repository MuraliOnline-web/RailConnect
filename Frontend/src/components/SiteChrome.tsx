import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaBars, FaXmark } from "react-icons/fa6";
import { RailLogo } from "./RailLogo";
import { useScrollLock } from "../hooks/use-scroll-lock";

type NavItem = { to: string; label: string; exact?: boolean };
const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/why", label: "Why RailConnect" },
  { to: "/network", label: "Network" },
  { to: "/about", label: "About" },
];

function NavLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      activeProps={{ className: "nav-link-active" }}
      inactiveProps={{
        className: "text-foreground/70 hover:text-foreground hover:bg-orange-50/60",
      }}
      className="nav-link"
    >
      {label}
    </Link>
  );
}

function LoginNavLink() {
  return (
    <div className="nav-login-capsule">
      <Link
        to="/login"
        activeOptions={{ exact: true }}
        activeProps={{ className: "nav-login-active" }}
        inactiveProps={{ className: "nav-login-inactive" }}
        className="nav-login-link"
      >
        Log In
      </Link>
    </div>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useScrollLock(open);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="sticky top-0 z-30">
      <div
        className={
          "transition-all duration-300 " +
          (scrolled
            ? "backdrop-blur-xl bg-white/70 shadow-soft border-b border-orange-100/70"
            : "bg-transparent border-b border-orange-100/40")
        }
      >
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 md:h-[72px]">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <RailLogo />
          </Link>
          <nav className="nav-capsule hidden items-center gap-1 p-1.5 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>
          <div className="hidden items-center md:flex">
            <LoginNavLink />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-foreground shadow-soft md:hidden"
          >
            {open ? <FaXmark /> : <FaBars />}
          </button>

          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  aria-hidden
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
                />
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ type: "spring", damping: 26, stiffness: 300, duration: 0.3 }}
                  role="dialog"
                  aria-modal="true"
                  className="absolute inset-x-4 top-[72px] z-30 max-h-[calc(100vh-92px)] overflow-y-auto overscroll-contain rounded-3xl border border-orange-100/80 bg-white p-4 shadow-[0_0_0_1px_rgba(255,138,61,0.12),0_20px_60px_-12px_rgba(0,0,0,0.25)] md:hidden"
                >
                  <nav className="flex flex-col gap-1 text-sm font-medium">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        activeOptions={{ exact: !!item.exact }}
                        activeProps={{ className: "bg-orange-50 text-orange-700" }}
                        inactiveProps={{ className: "text-foreground/80 hover:bg-orange-50" }}
                        onClick={() => setOpen(false)}
                        className="rounded-2xl px-4 py-3 transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-3 flex flex-col gap-2 border-t border-orange-100 pt-3">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="cta cta-outline w-full shadow-sm"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="cta bg-railway-gradient w-full text-white shadow-soft"
                    >
                      Create Account <FaArrowRight />
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </header>
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-5 pb-10 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-orange-100 pt-6 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-3">
          <RailLogo size={28} />
        </div>
        <div>© {new Date().getFullYear()} RailConnect. Crafted for commuters.</div>
      </div>
    </footer>
  );
}
