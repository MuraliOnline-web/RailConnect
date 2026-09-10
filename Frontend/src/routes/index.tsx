import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FaTrain, FaShieldHalved, FaBoltLightning, FaArrowRight } from "react-icons/fa6";
import { SiteNav, SiteFooter, PageTransition } from "../components/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RailConnect — Premium Commuter Rail Tickets" },
      {
        name: "description",
        content:
          "Book suburban rail tickets, season passes and platform tickets in seconds. A premium, modern commuter experience.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* Ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ambient-a absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
        <div className="ambient-b absolute top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/50 blur-3xl" />
        <div className="ambient-a absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      {/* Nav */}
      <SiteNav />
      <PageTransition>
        {/* Hero */}
        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pt-10 pb-24 sm:px-8 md:grid-cols-[1.05fr_minmax(0,0.95fr)] md:gap-14 md:pt-16 lg:gap-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-orange-700"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Now boarding · v2 launch
            </motion.span>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.75, ease: "easeOut" },
                },
              }}
              className="mt-5 font-[Sora] text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-6xl lg:text-7xl"
            >
              The commute,
              <br />
              <span className="text-railway-gradient">reimagined.</span>
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              RailConnect is a premium mobile-first ticketing platform for suburban rail commuters —
              paperless tickets, season passes and live journey planning, designed to feel
              effortless.
            </motion.p>
            <motion.div
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
              }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
              >
                <Link
                  to="/register"
                  className="cta bg-railway-gradient text-white shadow-soft hover:shadow-glow"
                >
                  Create Account <FaArrowRight />
                </Link>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
              >
                <Link to="/login" className="cta cta-outline shadow-soft">
                  Already have Account <FaArrowRight />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <FaShieldHalved className="text-orange-500" /> Secure by design
              </div>
              <div className="flex items-center gap-2">
                <FaBoltLightning className="text-orange-500" /> Tickets in 10 s
              </div>
            </motion.div>
          </motion.div>

          {/* Ticket visual */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
            className="relative mx-auto w-full min-w-0 max-w-md md:max-w-[23rem] lg:max-w-[29rem]"
          >
            <div className="animate-float-slow relative">
              <div className="bg-railway-gradient glow-breathe absolute -inset-4 rounded-[2rem] blur-2xl" />
              <div className="ticket-lift glass premium-border relative overflow-hidden rounded-[2rem] p-1 shadow-glow">
                <div className="rounded-[1.75rem] bg-white p-5 sm:p-8 md:p-6 lg:p-9">
                  <div className="flex items-baseline justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
                    <span className="font-semibold uppercase leading-none tracking-[0.16em]">
                      Mobile Ticket
                    </span>
                    <span className="font-medium leading-none tabular-nums tracking-wide">
                      #RC-228194
                    </span>
                  </div>
                  <div className="mt-6 sm:mt-8 md:mt-8 lg:mt-9 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-3">
                    <div className="min-w-0">
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        From
                      </div>
                      <div className="font-[Sora] text-[1.05rem] sm:text-[1.3rem] md:text-[1.1rem] lg:text-[1.3rem] font-bold leading-[1.15] tracking-tight">
                        SOURCE
                      </div>
                    </div>
                    <div className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center justify-self-center rounded-full text-white shadow-soft sm:h-12 sm:w-12">
                      <FaTrain />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        To
                      </div>
                      <div className="font-[Sora] text-[1.05rem] sm:text-[1.3rem] md:text-[1.1rem] lg:text-[1.3rem] font-bold leading-[1.15] tracking-tight">
                        DESTINATION
                      </div>
                    </div>
                  </div>
                  <div className="my-7 sm:my-8 md:my-8 lg:my-9 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-orange-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600 sm:text-[11px]">
                      Western Line
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-orange-300 to-orange-500" />
                  </div>
                  <div className="grid grid-cols-3 items-start gap-2 sm:gap-3 text-[11px] sm:text-xs">
                    <div className="min-w-0 text-left">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:tracking-[0.18em]">
                        Train Type
                      </div>
                      <div className="mt-1 font-semibold text-foreground sm:text-[12.5px] md:text-[12px] lg:text-[12.5px]">
                        Passenger/Express
                      </div>
                    </div>
                    <div className="min-w-0 text-center">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:tracking-[0.18em]">
                        Passengers
                      </div>
                      <div className="mt-1 font-semibold text-foreground tabular-nums sm:text-[12.5px] md:text-[12px] lg:text-[12.5px]">
                        1
                      </div>
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:tracking-[0.18em]">
                        Fare
                      </div>
                      <div className="mt-1 font-semibold text-foreground tabular-nums sm:text-[12.5px] md:text-[12px] lg:text-[12.5px]">
                        ₹35.00
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-10 md:mt-9 lg:mt-11 rounded-2xl bg-orange-50 p-2.5 sm:p-4 text-center">
                    <div className="grid grid-cols-12 gap-[2px] sm:gap-[5px] md:gap-[4px] lg:gap-[5px]">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-7 sm:h-[28px] rounded-sm"
                          style={{
                            background:
                              i % 3 === 0 ? "#1a0e08" : i % 5 === 0 ? "#e8470e" : "#2a1810",
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-700 sm:mt-3.5">
                      Scan at gate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* About strip */}
        <section id="about" className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8 shadow-soft sm:p-12"
          >
            <div className="grid items-center gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="font-[Sora] text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for the daily ride.
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Inspired by the operational scale of UTS and RailConnect, redesigned ground-up
                  with a calm, modern interface. No queues, no paper — just you, your platform, and
                  the next train home.
                </p>
              </div>
              <div id="network" className="grid grid-cols-3 gap-4 text-center">
                <Stat value="1.2M" label="Daily riders" />
                <Stat value="320+" label="Stations" />
                <Stat value="99.9%" label="Uptime" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Why band */}
        <section id="why" className="relative z-10 mx-auto max-w-7xl px-5 pb-28 sm:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                t: "Premium experience",
                d: "Calm typography, soft shadows and motion that feels like a luxury app.",
              },
              {
                t: "Designed for India",
                d: "Suburban network-aware UI, season passes, platform tickets and live PNR.",
              },
              {
                t: "Privacy first",
                d: "Your travel history stays yours. Encrypted, portable, deletable in one tap.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group glass rounded-3xl p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="bg-railway-gradient mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white">
                  <FaTrain />
                </div>
                <div className="text-lg font-semibold">{c.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="bg-railway-gradient relative overflow-hidden rounded-3xl p-10 text-white shadow-glow sm:p-14">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/10 blur-2xl"
            />
            <div className="relative grid items-center gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-[Sora] text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to skip the queue?
                </h3>
                <p className="mt-3 max-w-md text-white/85">
                  Create your free RailConnect account and get your first paperless ticket in under
                  a minute.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/register" className="cta cta-light shadow-soft">
                  Create Account <FaArrowRight />
                </Link>
                <Link to="/login" className="cta cta-on-dark">
                  Already have Account <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </PageTransition>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <div className="font-[Sora] text-2xl font-extrabold text-railway-gradient">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
