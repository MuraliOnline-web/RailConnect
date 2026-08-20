import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import { SiteNav, SiteFooter, PageTransition } from "../components/SiteChrome";

export const Route = createFileRoute("/why")({
  head: () => ({
    meta: [
      { title: "Why RailConnect — Fast, Secure, Paperless Rail Tickets" },
      { name: "description", content: "Discover why commuters choose RailConnect for fast, secure, paperless railway ticketing." },
      { property: "og:title", content: "Why RailConnect" },
      { property: "og:description", content: "Fast, secure and paperless railway ticketing designed for modern commuters." },
    ],
  }),
  component: WhyPage,
});

const FEATURES = [
  { icon: "🚆", t: "Book in Seconds", d: "Book Journey Tickets and Platform Tickets within seconds." },
  { icon: "📱", t: "Paperless Travel", d: "Travel securely using QR-based digital tickets." },
  { icon: "💳", t: "Smart Wallet", d: "Recharge wallet, pay for tickets and receive instant refunds." },
  { icon: "🔄", t: "Quick Refunds", d: "Automatic refund calculations with wallet credit." },
  { icon: "🔔", t: "Real-Time Notifications", d: "Receive instant updates about bookings, payments and refunds." },
  { icon: "📍", t: "Smart Station Search", d: "Fast autocomplete station search with intelligent suggestions." },
];

const STATS = [
  { v: "100%", l: "Digital Ticketing" },
  { v: "24×7", l: "Availability" },
  { v: "17+", l: "Railway Zones" },
  { v: "100%", l: "Paperless Travel" },
];

function WhyPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
        <div className="absolute top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/50 blur-3xl" />
      </div>
      <SiteNav />
      <PageTransition>

      <section className="relative z-10 mx-auto max-w-5xl px-5 pt-10 pb-16 text-center sm:px-8 md:pt-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-orange-700">
            Why RailConnect
          </span>
          <h1 className="mt-5 font-[Sora] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Why Choose <span className="text-railway-gradient">RailConnect?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Fast, secure and paperless railway ticketing designed for modern commuters.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="cta bg-railway-gradient text-white shadow-soft hover:shadow-glow">
              Create Account <FaArrowRight />
            </Link>
            <a href="#features" className="cta cta-outline shadow-soft">
              Learn More <FaArrowRight />
            </a>
          </div>
        </motion.div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-3xl p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="bg-railway-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white">
                <span>{f.icon}</span>
              </div>
              <div className="text-lg font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-6 shadow-soft sm:p-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/70 p-5 text-center">
              <div className="text-railway-gradient font-[Sora] text-3xl font-extrabold sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="bg-railway-gradient relative overflow-hidden rounded-3xl p-10 text-center text-white shadow-glow sm:p-14">
          <h3 className="font-[Sora] text-3xl font-bold tracking-tight sm:text-4xl">Start Your Journey Today</h3>
          <div className="mt-6 flex justify-center">
            <Link to="/register" className="cta cta-light shadow-soft">
              Create Account <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      </PageTransition>
    </div>
  );
}

