import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FaTrainSubway,
  FaQrcode,
  FaWallet,
  FaArrowsRotate,
  FaBell,
  FaShieldHalved,
  FaTicket,
  FaCode,
  FaDesktop,
  FaServer,
  FaReact,
  FaLeaf,
  FaDatabase,
  FaKey,
  FaWind,
  FaClipboardList,
  FaPaintbrush,
  FaRocket,
  FaArrowRight,
  FaCompassDrafting,
} from "react-icons/fa6";
import { SiteNav, SiteFooter, PageTransition } from "../components/SiteChrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RailConnect — Modern Digital Rail Ticketing" },
      { name: "description", content: "RailConnect is a modern digital railway ticketing platform inspired by India's UTS." },
      { property: "og:title", content: "About RailConnect" },
      { property: "og:description", content: "A modern digital railway ticket booking platform for millions of commuters." },
    ],
  }),
  component: AboutPage,
});

const SERVICES = [
  { icon: <FaTrainSubway />, t: "Journey Ticket", d: "Book unreserved journey tickets between any two stations." },
  { icon: <FaTicket />, t: "Platform Ticket", d: "Instant platform tickets for station entry." },
  { icon: <FaQrcode />, t: "QR Ticket", d: "Paperless QR-based tickets scanned at the gate." },
  { icon: <FaWallet />, t: "Digital Wallet", d: "Recharge, pay and manage balances in one place." },
  { icon: <FaArrowsRotate />, t: "Refund Management", d: "Automated refunds credited back to your wallet." },
  { icon: <FaBell />, t: "Notification Center", d: "Real-time updates on bookings, payments and refunds." },
  { icon: <FaShieldHalved />, t: "Secure Authentication", d: "JWT-based auth with OTP and CAPTCHA protection." },
];

const FRONTEND_TECH = [
  { name: "React", category: "UI Library", icon: <FaReact className="h-5 w-5 text-cyan-500" /> },
  { name: "TypeScript", category: "Type Safety", icon: <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-extrabold text-white">TS</span> },
  { name: "Tailwind CSS", category: "Styling Engine", icon: <FaWind className="h-5 w-5 text-teal-500" /> },
];

const BACKEND_TECH = [
  { name: "Spring Boot", category: "Core Framework", icon: <FaLeaf className="h-5 w-5 text-emerald-500" /> },
  { name: "PostgreSQL", category: "Database", icon: <FaDatabase className="h-5 w-5 text-blue-500" /> },
  { name: "Spring Security", category: "Security", icon: <FaShieldHalved className="h-5 w-5 text-amber-500" /> },
  { name: "JWT Authentication", category: "Auth Token", icon: <FaKey className="h-5 w-5 text-purple-500" /> },
];

const TIMELINE = ["Planning", "UI / UX Design", "Frontend Development", "Backend Development", "Deployment"];

function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
        <div className="absolute top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/50 blur-3xl" />
      </div>
      <SiteNav />
      <PageTransition>

      <section className="relative z-10 mx-auto max-w-5xl px-5 pt-10 pb-14 text-center sm:px-8 md:pt-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-orange-700">About</span>
          <h1 className="mt-5 font-[Sora] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            About <span className="text-railway-gradient">RailConnect</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A modern digital railway ticket booking platform inspired by India's UTS
            (Unreserved Ticketing System).
          </p>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="glass rounded-3xl p-8 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-widest text-orange-700">Our Mission</div>
            <p className="mt-3 text-base text-foreground/80">
              Simplify railway ticket booking through a fast, secure and paperless
              digital experience.
            </p>
          </div>
          <div className="glass rounded-3xl p-8 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-widest text-orange-700">Our Vision</div>
            <p className="mt-3 text-base text-foreground/80">
              Build an accessible and user-friendly railway ticketing platform that
              enhances the travel experience for millions of commuters.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[Sora] text-2xl font-bold tracking-tight sm:text-3xl">Services</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className="glass rounded-3xl p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="bg-railway-gradient mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white">
                {s.icon}
              </div>
              <div className="text-lg font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Stack — Tree Architecture */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <TechStackTree />
      </section>

      {/* Project Development Journey — Refactored Timeline */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <DevelopmentJourney />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="glass flex flex-col items-center justify-between gap-4 rounded-3xl p-8 text-center shadow-soft sm:flex-row sm:text-left">
          <div>
            <div className="font-[Sora] text-lg font-bold">RailConnect</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Version 1.0</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Built using <span className="font-semibold text-orange-700">React + Spring Boot</span>
          </div>
        </div>
      </section>

      <SiteFooter />
      </PageTransition>
    </div>
  );
}

function TechStackTree() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-10 shadow-soft">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-semibold text-orange-700">
          <FaCode className="h-3.5 w-3.5" /> System Architecture
        </span>
        <h2 className="mt-3 font-[Sora] text-2xl sm:text-3xl font-bold tracking-tight">Technology Stack</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A modern, high-performance fullstack architecture built for suburban commuter scale.
        </p>
      </div>

      {/* Tree Diagram Container */}
      <div className="relative mx-auto max-w-5xl">
        {/* DESKTOP & TABLET VIEW (md:block) */}
        <div className="hidden md:block">
          {/* Root Node */}
          <div className="flex justify-center">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="glass border-2 border-orange-400 bg-white/95 px-6 py-4 rounded-2xl shadow-glow flex items-center gap-3 relative z-10 cursor-pointer hover:-translate-y-1 transition-all duration-200"
            >
              <div className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft">
                <FaCode className="h-5 w-5" />
              </div>
              <div>
                <div className="font-[Sora] font-extrabold text-base tracking-tight">Technology Stack</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">Root Node</div>
              </div>
            </motion.div>
          </div>

          {/* Root -> Branches SVG Connectors */}
          <div className="relative h-16 w-full">
            <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff8a3d" />
                  <stop offset="50%" stopColor="#e8470e" />
                  <stop offset="100%" stopColor="#ff8a3d" />
                </linearGradient>
              </defs>

              {/* Static Lines */}
              <path d="M 50 0 L 50 50 L 25 50 L 25 100 M 50 50 L 75 50 L 75 100" stroke="rgba(255, 138, 61, 0.4)" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
              {/* Traveling Pulse Lines */}
              <path d="M 50 0 L 50 50 L 25 50 L 25 100 M 50 50 L 75 50 L 75 100" stroke="url(#treeGrad)" strokeWidth="2.5" strokeDasharray="8 12" className="animate-tree-dash" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {/* Branch Nodes (Frontend & Backend) */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12">
            {/* Frontend Branch */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass border-2 border-orange-300 bg-white/95 px-6 py-3.5 rounded-2xl shadow-soft flex items-center gap-3 relative z-10 w-64 justify-center hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="bg-orange-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-orange-700 font-bold">
                  <FaDesktop className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-[Sora] font-bold text-sm tracking-wide">FRONTEND</div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Client Layer</div>
                </div>
              </motion.div>

              {/* Branch -> Children SVG Connector */}
              <div className="relative h-14 w-full">
                <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 50 0 L 50 50 L 16.66 50 L 16.66 100 M 50 50 L 50 100 M 50 50 L 83.33 50 L 83.33 100" stroke="rgba(255, 138, 61, 0.4)" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 50 0 L 50 50 L 16.66 50 L 16.66 100 M 50 50 L 50 100 M 50 50 L 83.33 50 L 83.33 100" stroke="url(#treeGrad)" strokeWidth="2.5" strokeDasharray="8 12" className="animate-tree-dash" fill="none" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>

              {/* Frontend Children */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                {FRONTEND_TECH.map((t) => (
                  <motion.div
                    key={t.name}
                    whileHover={{ y: -5, scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    className="glass border border-orange-200 bg-white/90 p-3 sm:p-3.5 rounded-2xl shadow-soft hover:shadow-glow hover:border-orange-400 hover:-translate-y-1.5 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50/80 shrink-0">
                      {t.icon}
                    </div>
                    <div className="font-semibold text-xs text-foreground leading-tight px-1">{t.name}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground leading-tight px-1">{t.category}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Backend Branch */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass border-2 border-orange-300 bg-white/95 px-6 py-3.5 rounded-2xl shadow-soft flex items-center gap-3 relative z-10 w-64 justify-center hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="bg-orange-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-orange-700 font-bold">
                  <FaServer className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-[Sora] font-bold text-sm tracking-wide">BACKEND</div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Server Layer</div>
                </div>
              </motion.div>

              {/* Branch -> Children SVG Connector */}
              <div className="relative h-14 w-full">
                <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 50 0 L 50 50 L 12.5 50 L 12.5 100 M 50 50 L 37.5 50 L 37.5 100 M 50 50 L 62.5 50 L 62.5 100 M 50 50 L 87.5 50 L 87.5 100" stroke="rgba(255, 138, 61, 0.4)" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 50 0 L 50 50 L 12.5 50 L 12.5 100 M 50 50 L 37.5 50 L 37.5 100 M 50 50 L 62.5 50 L 62.5 100 M 50 50 L 87.5 50 L 87.5 100" stroke="url(#treeGrad)" strokeWidth="2.5" strokeDasharray="8 12" className="animate-tree-dash" fill="none" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>

              {/* Backend Children */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
                {BACKEND_TECH.map((t) => (
                  <motion.div
                    key={t.name}
                    whileHover={{ y: -5, scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    className="glass border border-orange-200 bg-white/90 p-3 sm:p-3.5 rounded-2xl shadow-soft hover:shadow-glow hover:border-orange-400 hover:-translate-y-1.5 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-h-[96px]"
                  >
                    <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50/80 shrink-0">
                      {t.icon}
                    </div>
                    <div className="font-semibold text-[11px] sm:text-xs text-foreground leading-tight px-0.5">{t.name}</div>
                    <div className="mt-0.5 text-[9.5px] sm:text-[10px] text-muted-foreground leading-tight px-0.5">{t.category}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (md:hidden) */}
        <div className="block md:hidden space-y-6">
          {/* Root Node */}
          <div className="flex justify-center">
            <div className="glass border-2 border-orange-400 bg-white/95 px-5 py-3.5 rounded-2xl shadow-glow flex items-center gap-3">
              <div className="bg-railway-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-soft">
                <FaCode className="h-4 w-4" />
              </div>
              <div>
                <div className="font-[Sora] font-bold text-sm">Technology Stack</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">Root Architecture</div>
              </div>
            </div>
          </div>

          {/* Vertical Connector */}
          <div className="flex justify-center">
            <div className="h-8 w-0.5 bg-gradient-to-b from-orange-400 to-orange-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/80 animate-pulse" />
            </div>
          </div>

          {/* Frontend Branch */}
          <div className="glass border border-orange-300 rounded-3xl p-4 sm:p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 flex h-8 w-8 items-center justify-center rounded-xl text-orange-700">
                <FaDesktop className="h-4 w-4" />
              </div>
              <div>
                <div className="font-[Sora] font-bold text-sm">FRONTEND</div>
                <div className="text-[10px] text-muted-foreground uppercase">Client Layer</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {FRONTEND_TECH.map((t) => (
                <div key={t.name} className="glass border border-orange-200 bg-white/90 p-2.5 rounded-2xl text-center flex flex-col items-center justify-center">
                  <div className="mb-1 flex justify-center">{t.icon}</div>
                  <div className="font-semibold text-[11px] leading-tight">{t.name}</div>
                  <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{t.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Connector */}
          <div className="flex justify-center">
            <div className="h-8 w-0.5 bg-gradient-to-b from-orange-400 to-orange-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/80 animate-pulse" />
            </div>
          </div>

          {/* Backend Branch */}
          <div className="glass border border-orange-300 rounded-3xl p-4 sm:p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 flex h-8 w-8 items-center justify-center rounded-xl text-orange-700">
                <FaServer className="h-4 w-4" />
              </div>
              <div>
                <div className="font-[Sora] font-bold text-sm">BACKEND</div>
                <div className="text-[10px] text-muted-foreground uppercase">Server Layer</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {BACKEND_TECH.map((t) => (
                <div key={t.name} className="glass border border-orange-200 bg-white/90 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                  <div className="mb-1 flex justify-center">{t.icon}</div>
                  <div className="font-semibold text-xs leading-tight">{t.name}</div>
                  <div className="text-[9.5px] text-muted-foreground leading-tight mt-0.5">{t.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const JOURNEY_STAGES = [
  {
    num: "01",
    title: "Planning",
    icon: <FaClipboardList className="h-5 w-5 text-orange-600" />,
    description: "Defining product scope, commuter workflows, requirements, and system architecture.",
  },
  {
    num: "02",
    title: "UI / UX Design",
    icon: <FaPaintbrush className="h-5 w-5 text-amber-600" />,
    description: "Crafting intuitive digital ticketing interfaces, glassmorphism design system & micro-interactions.",
  },
  {
    num: "03",
    title: "Frontend Development",
    icon: <FaCode className="h-5 w-5 text-cyan-600" />,
    description: "Building a responsive TanStack Start + React 19 web app with Tailwind CSS styling.",
  },
  {
    num: "04",
    title: "Backend Development",
    icon: <FaServer className="h-5 w-5 text-emerald-600" />,
    description: "Architecting Spring Boot REST APIs, PostgreSQL database, and Spring Security JWT auth.",
  },
  {
    num: "05",
    title: "Deployment",
    icon: <FaRocket className="h-5 w-5 text-purple-600" />,
    description: "Production deployment, automated Cloudflare/Vite pipeline, and performance tuning.",
  },
];

function DevelopmentJourney() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-10 shadow-soft">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-semibold text-orange-700">
          <FaCompassDrafting className="h-3.5 w-3.5" /> OUR PROCESS
        </span>
        <h2 className="mt-3 font-[Sora] text-2xl sm:text-3xl font-bold tracking-tight">
          Project Development <span className="text-railway-gradient">Journey</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A structured, agile approach that turns ideas into a reliable and scalable real-world solution.
        </p>
      </div>

      {/* DESKTOP & TABLET VIEW (md:block) */}
      <div className="hidden md:block relative">
        {/* Horizontal Connector Line */}
        <div className="absolute top-7 left-[8%] right-[8%] h-1 pointer-events-none z-0">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
            <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255, 138, 61, 0.35)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="5" x2="100" y2="5" stroke="url(#treeGrad)" strokeWidth="3" strokeDasharray="6 10" className="animate-tree-dash" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* 5 Stage Cards Grid */}
        <div className="grid grid-cols-5 gap-3.5 lg:gap-4 relative z-10">
          {JOURNEY_STAGES.map((s) => (
            <motion.div
              key={s.num}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="glass border border-orange-200/90 bg-white/95 p-4 lg:p-5 rounded-3xl shadow-soft hover:shadow-glow hover:border-orange-400 flex flex-col h-full transition-all duration-200 group cursor-pointer"
            >
              {/* Badge & Icon Row */}
              <div className="flex items-center justify-between mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 font-mono text-xs font-bold text-white shadow-soft">
                  {s.num}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50/80 border border-orange-100 group-hover:scale-110 transition-transform duration-200">
                  {s.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-[Sora] font-bold text-xs lg:text-sm text-foreground leading-snug">{s.title}</h3>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed flex-grow">{s.description}</p>

              {/* CENTERED CTA LINK */}
              <div className="mt-4 pt-3 border-t border-orange-100/80 flex items-center justify-center w-full">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600 group-hover:text-orange-700 transition-colors text-center w-full">
                  Learn more <FaArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW (md:hidden) */}
      <div className="block md:hidden relative pl-6 space-y-5">
        {/* Vertical Line */}
        <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-400 via-orange-500 to-amber-400" />

        {JOURNEY_STAGES.map((s) => (
          <div key={s.num} className="relative">
            {/* Circle Node on Timeline */}
            <span className="absolute -left-[1.375rem] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 font-mono text-[10px] font-bold text-white shadow-soft">
              {s.num}
            </span>

            <div className="glass border border-orange-200 bg-white/95 p-4 rounded-2xl shadow-soft flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 shrink-0">
                  {s.icon}
                </div>
                <h3 className="font-[Sora] font-bold text-sm text-foreground">{s.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>

              {/* CENTERED CTA LINK FOR MOBILE */}
              <div className="pt-2.5 border-t border-orange-100 flex justify-center w-full">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600 text-center w-full">
                  Learn more <FaArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supporting Subordinate Message */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          Built with passion. Delivered with purpose.
        </div>
      </div>
    </div>
  );
}