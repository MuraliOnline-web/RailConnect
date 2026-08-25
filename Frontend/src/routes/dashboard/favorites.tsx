import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FaHeart, FaTrash, FaPlus, FaArrowRight, FaTrain } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import {
  addFavorite,
  loadFavorites,
  removeFavorite,
  type FavoriteRoute,
} from "../../lib/favorites";
import { STATIONS } from "../../lib/tickets";

export const Route = createFileRoute("/dashboard/favorites")({
  head: () => ({ meta: [{ title: "Favorite routes · RailConnect" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<FavoriteRoute[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const refresh = () => {
    if (user) setFavs(loadFavorites(user.id));
  };
  useEffect(() => {
    refresh();
  }, [user]);

  const add = () => {
    if (!user || !from || !to || from === to) return;
    addFavorite({
      id: crypto.randomUUID(),
      userId: user.id,
      fromCode: from,
      toCode: to,
      createdAt: new Date().toISOString(),
    });
    setFrom("");
    setTo("");
    refresh();
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Favorite routes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-tap booking for the routes you ride most.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="From">
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (e.target.value === to) setTo("");
              }}
              className="w-full rounded-xl border border-orange-100 bg-white/90 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
            >
              <option value="" disabled hidden>
                Select source station
              </option>
              {STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="To">
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-orange-100 bg-white/90 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-300/50"
            >
              <option value="" disabled hidden>
                Select destination station
              </option>
              {STATIONS.filter((s) => !from || s.code !== from).map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </Field>
          <button
            onClick={add}
            disabled={!from || !to || from === to}
            className="bg-railway-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60 disabled:cursor-not-allowed transition hover:shadow-glow active:scale-[0.98]"
          >
            <FaPlus /> Add route
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {favs.length === 0 ? (
          <div className="glass col-span-full rounded-3xl p-10 text-center shadow-soft">
            <div className="bg-railway-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm">
              <FaHeart />
            </div>
            <h2 className="mt-4 font-[Sora] text-xl font-bold text-orange-950">No favorites yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the routes you ride most for one-tap bookings.
            </p>
          </div>
        ) : (
          favs.map((f) => {
            const fromS = STATIONS.find((s) => s.code === f.fromCode)!;
            const toS = STATIONS.find((s) => s.code === f.toCode)!;
            return (
              <div
                key={f.id}
                className="glass rounded-3xl p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-railway-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm">
                      <FaTrain />
                    </div>
                    <div>
                      <div className="font-[Sora] text-lg font-bold text-orange-950">
                        {fromS.name} → {toS.name}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {fromS.line} line
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (user) {
                        removeFavorite(user.id, f.id);
                        refresh();
                      }
                    }}
                    className="rounded-full bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition active:scale-95"
                    aria-label="Remove"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/dashboard/journey"
                    search={{ from: f.fromCode, to: f.toCode }}
                    className="bg-railway-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover:shadow-glow active:scale-[0.98]"
                  >
                    Book Again
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </div>
      {children}
    </div>
  );
}
