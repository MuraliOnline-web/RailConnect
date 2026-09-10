import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { SearchField } from "../components/SearchField";
import { SiteNav, SiteFooter, PageTransition } from "../components/SiteChrome";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Indian Railway Network — RailConnect" },
      {
        name: "description",
        content: "Explore the 17+ Indian Railway zones and stations supported by RailConnect.",
      },
      { property: "og:title", content: "Indian Railway Network — RailConnect" },
      {
        property: "og:description",
        content: "Explore railway zones, divisions and major stations across India.",
      },
    ],
  }),
  component: NetworkPage,
});

const NETWORK_STATS = [
  { v: "17+", l: "Railway Zones" },
  { v: "7000+", l: "Major Stations" },
  { v: "13000+", l: "Daily Trains" },
  { v: "Nationwide", l: "Coverage" },
];

type Zone = { name: string; code: string; hq: string; divisions: number; desc: string };

const ZONES: Zone[] = [
  {
    name: "South Central Railway",
    code: "SCR",
    hq: "Secunderabad",
    divisions: 3,
    desc: "Serves Telangana, Andhra Pradesh and parts of Maharashtra & Karnataka.",
  },
  {
    name: "Southern Railway",
    code: "SR",
    hq: "Chennai",
    divisions: 6,
    desc: "One of the oldest zones, covering Tamil Nadu, Kerala and Puducherry.",
  },
  {
    name: "South Western Railway",
    code: "SWR",
    hq: "Hubballi",
    divisions: 3,
    desc: "Covers most of Karnataka and parts of Andhra Pradesh & Kerala.",
  },
  {
    name: "Central Railway",
    code: "CR",
    hq: "Mumbai CSMT",
    divisions: 5,
    desc: "Operates the Mumbai suburban Central line and connects central India.",
  },
  {
    name: "Western Railway",
    code: "WR",
    hq: "Mumbai Churchgate",
    divisions: 6,
    desc: "Runs the Mumbai Western suburban line and links Gujarat & Rajasthan.",
  },
  {
    name: "Eastern Railway",
    code: "ER",
    hq: "Kolkata",
    divisions: 4,
    desc: "Serves West Bengal, Jharkhand and parts of Bihar.",
  },
  {
    name: "Northern Railway",
    code: "NR",
    hq: "New Delhi",
    divisions: 5,
    desc: "Largest zone by route length, covering north India.",
  },
  {
    name: "North Eastern Railway",
    code: "NER",
    hq: "Gorakhpur",
    divisions: 3,
    desc: "Connects eastern Uttar Pradesh and northern Bihar.",
  },
  {
    name: "North Western Railway",
    code: "NWR",
    hq: "Jaipur",
    divisions: 4,
    desc: "Covers Rajasthan and parts of Haryana & Gujarat.",
  },
  {
    name: "East Coast Railway",
    code: "ECoR",
    hq: "Bhubaneswar",
    divisions: 3,
    desc: "Serves Odisha and parts of Andhra Pradesh & Chhattisgarh.",
  },
  {
    name: "South East Central Railway",
    code: "SECR",
    hq: "Bilaspur",
    divisions: 3,
    desc: "Covers Chhattisgarh, Madhya Pradesh and parts of Maharashtra.",
  },
  {
    name: "West Central Railway",
    code: "WCR",
    hq: "Jabalpur",
    divisions: 3,
    desc: "Spans Madhya Pradesh, Uttar Pradesh and Rajasthan.",
  },
  {
    name: "North Central Railway",
    code: "NCR",
    hq: "Prayagraj",
    divisions: 3,
    desc: "Runs the busy Delhi-Howrah and Delhi-Chennai routes.",
  },
  {
    name: "East Central Railway",
    code: "ECR",
    hq: "Hajipur",
    divisions: 5,
    desc: "Serves Bihar and parts of Jharkhand & Uttar Pradesh.",
  },
  {
    name: "South Eastern Railway",
    code: "SER",
    hq: "Kolkata",
    divisions: 4,
    desc: "Covers West Bengal, Odisha and Jharkhand.",
  },
  {
    name: "Northeast Frontier Railway",
    code: "NFR",
    hq: "Guwahati",
    divisions: 5,
    desc: "Serves the entire north-eastern region of India.",
  },
  {
    name: "Konkan Railway",
    code: "KR",
    hq: "Navi Mumbai",
    divisions: 2,
    desc: "Scenic coastal route connecting Maharashtra, Goa and Karnataka.",
  },
];

function NetworkPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ZONES;
    return ZONES.filter((z) => [z.name, z.code, z.hq].some((v) => v.toLowerCase().includes(s)));
  }, [q]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
        <div className="absolute top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/50 blur-3xl" />
      </div>
      <SiteNav />
      <PageTransition>
        <section className="relative z-10 mx-auto max-w-5xl px-5 pt-10 pb-14 text-center sm:px-8 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-orange-700">
              Network
            </span>
            <h1 className="mt-5 font-[Sora] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Indian <span className="text-railway-gradient">Railway Network</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Explore the railway zones and railway network supported by RailConnect.
            </p>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:pb-10 sm:px-8">
          <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-6 shadow-soft sm:p-10 md:grid-cols-4">
            {NETWORK_STATS.map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/70 p-5 text-center">
                <div className="text-railway-gradient font-[Sora] text-2xl font-extrabold sm:text-3xl">
                  {s.v}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:pb-10 sm:px-8">
          <SearchField
            value={q}
            onChange={setQ}
            showClear
            placeholder="Search railway zone, station or division…"
            variant="network"
          />
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 p-10 text-center text-sm text-muted-foreground">
              No zones match “{q}”.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((z, i) => (
                <motion.div
                  key={z.code}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
                  className="glass rounded-3xl p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">{z.name}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                        HQ · {z.hq}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-bold text-orange-700">
                      {z.code}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{z.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
                      {z.divisions} Divisions
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="glass overflow-hidden rounded-3xl p-8 shadow-soft sm:p-12">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-700">
              <FaMapLocationDot /> Coming soon
            </div>
            <h3 className="mt-3 font-[Sora] text-2xl font-bold tracking-tight sm:text-3xl">
              Interactive Indian Railway Network Map
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              A live, zoomable map of Indian Railways with zone overlays, live train positions and
              station-level insights — arriving in a future update.
            </p>
            <div
              aria-hidden
              className="mt-6 relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 sm:h-80"
            >
              <div className="text-center">
                <FaMapLocationDot className="mx-auto h-10 w-10 text-orange-400" />
                <div className="mt-3 text-xs uppercase tracking-widest text-orange-600">
                  Map placeholder
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </PageTransition>
    </div>
  );
}
