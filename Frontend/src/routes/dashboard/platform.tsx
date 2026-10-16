import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FaArrowRight, FaTrainSubway } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { STATIONS, calcFare } from "../../lib/tickets";
import { formatINR } from "../../lib/currency";
import { StationSearch } from "../../components/StationSearch";
import { Counter } from "../../components/Counter";
import { savePaymentDraft } from "../../lib/payment";
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/platform")({
  head: () => ({ meta: [{ title: "Platform ticket · RailConnect" }] }),
  component: PlatformPage,
});

function PlatformPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [station, setStation] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);

  const stationObj = STATIONS.find((s) => s.code === station);

  const fare = useMemo(() => {
    if (!station) return 0;
    return calcFare({
      fromCode: station,
      toCode: station,
      type: "platform",
      classType: "2nd",
      adults,
      children,
    });
  }, [station, adults, children]);

  const onBook = async () => {
    if (!user || !stationObj) return;
    setLoading(true);
    savePaymentDraft({
      userId: user.id,
      type: "platform",
      fromCode: station,
      toCode: station,
      fromName: stationObj.name,
      toName: stationObj.name,
      line: stationObj.line,
      classType: "2nd",
      adults,
      children,
      fare,
      delivery: "digital",
      createdAt: new Date().toISOString(),
    });
    navigate({ to: "/dashboard/payment" });
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight text-foreground">
          <span className="text-railway-gradient">P</span>latform{" "}
          <span className="text-railway-gradient">T</span>icket
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("booking.platformValidity")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <Field label={t("booking.fromStation")}>
            <StationSearch
              value={station}
              onChange={setStation}
              placeholder="Select station / Search station"
            />
          </Field>

          <div className="mt-6">
            <Field label={t("booking.passengers")}>
              <div className="flex gap-2">
                <Counter label={t("booking.adults")} value={adults} setValue={setAdults} min={1} />
                <Counter
                  label={t("booking.children")}
                  value={children}
                  setValue={setChildren}
                  min={0}
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft h-fit">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${stationObj ? "bg-railway-gradient" : "bg-orange-200"}`}
            >
              <FaTrainSubway />
            </div>
            <div>
              <div className="font-[Sora] text-lg font-bold text-foreground">
                {stationObj ? stationObj.name : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {stationObj ? `${stationObj.line} line` : "Select a station"}
              </div>
            </div>
          </div>

          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-700 to-transparent" />

          <div className="my-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("booking.adults")}</span>
              <span className="font-semibold text-foreground">{adults}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("booking.children")}</span>
              <span className="font-semibold text-foreground">{children}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 p-4 border border-orange-100/60 dark:border-stone-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              {t("booking.totalFare")}
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {stationObj ? formatINR(fare) : "—"}
            </div>
          </div>

          <button
            data-testid="proceed-payment-button"
            onClick={onBook}
            disabled={loading || !stationObj || adults < 1}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t("common.loading") : t("booking.proceedPayment")}{" "}
            <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300">
        {label}
      </div>
      {children}
    </div>
  );
}
