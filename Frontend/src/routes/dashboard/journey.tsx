import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaTrain, FaHeart, FaQrcode, FaFilePdf } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";
import { STATIONS, calcFare, CATEGORY_LABEL, type TrainCategory } from "../../lib/tickets";
import { StationSearch } from "../../components/StationSearch";
import { Counter } from "../../components/Counter";
import { addFavorite } from "../../lib/favorites";
import { getWallet } from "../../lib/wallet";
import { savePaymentDraft } from "../../lib/payment";
import { formatINR } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/journey")({
  head: () => ({ meta: [{ title: "Journey Ticket · RailConnect" }] }),
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    from?: string;
    to?: string;
    category?: TrainCategory;
    adults?: number;
    children?: number;
  } => ({
    from: typeof s.from === "string" ? s.from : undefined,
    to: typeof s.to === "string" ? s.to : undefined,
    category: typeof s.category === "string" ? (s.category as TrainCategory) : undefined,
    adults: typeof s.adults === "number" ? s.adults : undefined,
    children: typeof s.children === "number" ? s.children : undefined,
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prefill = Route.useSearch();
  const isValidStation = (code: string) => STATIONS.some((s) => s.code === code);
  const [from, setFrom] = useState(
    prefill.from && isValidStation(prefill.from) ? prefill.from : "",
  );
  const [to, setTo] = useState(prefill.to && isValidStation(prefill.to) ? prefill.to : "");
  const [category, setCategory] = useState<TrainCategory>(prefill.category ?? "passenger");
  const [adults, setAdults] = useState(prefill.adults ?? 1);
  const [children, setChildren] = useState(prefill.children ?? 0);
  const [season, setSeason] = useState(false);
  const [delivery, setDelivery] = useState<"digital" | "print">("digital");
  const [loading, setLoading] = useState(false);
  const [favSaved, setFavSaved] = useState(false);

  const type = season ? "season" : "journey";
  const classType: "1st" | "2nd" = "2nd";
  const fare = useMemo(() => {
    if (!from || !to) return 0;
    return calcFare({ fromCode: from, toCode: to, type, classType, adults, children, category });
  }, [from, to, type, adults, children, category]);

  const fromS = STATIONS.find((s) => s.code === from);
  const toS = STATIONS.find((s) => s.code === to);

  const onBook = async () => {
    if (!user || !fromS || !toS) return;
    setLoading(true);
    savePaymentDraft({
      userId: user.id,
      type,
      fromCode: from,
      toCode: to,
      fromName: fromS.name,
      toName: toS.name,
      line: fromS.line,
      classType,
      adults,
      children,
      fare,
      delivery,
      category,
      createdAt: new Date().toISOString(),
    });
    navigate({ to: "/dashboard/payment" });
  };

  const onFav = () => {
    if (!user || !fromS || !toS) return;
    addFavorite({
      id: crypto.randomUUID(),
      userId: user.id,
      fromCode: from,
      toCode: to,
      createdAt: new Date().toISOString(),
    });
    setFavSaved(true);
    setTimeout(() => {
      setFavSaved(false);
    }, 2000);
  };

  const balance = user ? getWallet(user.id) : 0;

  return (
    <DashboardShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">
            <span className="text-railway-gradient">J</span>ourney{" "}
            <span className="text-railway-gradient">T</span>icket
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Single trip or season pass — instantly issued.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex justify-center">
            <div className="inline-flex w-full sm:w-auto p-1 items-center rounded-full border border-orange-200/90 dark:border-stone-800 bg-[#fffaf5] dark:bg-stone-900 shadow-2xs">
              <button
                type="button"
                onClick={() => setSeason(false)}
                className={`flex-1 sm:flex-initial sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer text-center ${
                  !season
                    ? "bg-railway-gradient text-white shadow-soft"
                    : "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-orange-100/50 dark:hover:bg-stone-800"
                }`}
              >
                Single Journey
              </button>
              <button
                type="button"
                onClick={() => setSeason(true)}
                className={`flex-1 sm:flex-initial sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer text-center ${
                  season
                    ? "bg-railway-gradient text-white shadow-soft"
                    : "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-orange-100/50 dark:hover:bg-stone-800"
                }`}
              >
                Season Pass
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300">
                Choose Ticket Type
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DeliveryOption
                  selected={delivery === "digital"}
                  onSelect={() => setDelivery("digital")}
                  icon={<FaQrcode />}
                  title="Book & Travel"
                  description="Generate a digital paperless ticket with QR code for gate scanning."
                />
                <DeliveryOption
                  selected={delivery === "print"}
                  onSelect={() => setDelivery("print")}
                  icon={<FaFilePdf />}
                  title="Book & Print"
                  description="Generate a downloadable PDF ticket after successful payment."
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-950/70 dark:text-stone-300">
                Train Category
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["passenger", "mail_express", "superfast"] as const).map((c) => (
                  <CategoryOption
                    key={c}
                    selected={category === c}
                    onSelect={() => setCategory(c)}
                    title={CATEGORY_LABEL[c]}
                    description={
                      c === "passenger"
                        ? "All stops · base fare"
                        : c === "mail_express"
                          ? `Limited stops · +${formatINR(20)}`
                          : `Fastest service · +${formatINR(45)}`
                    }
                  />
                ))}
              </div>
            </div>
            <Field label={t("booking.fromStation")}>
              <StationSearch
                value={from}
                onChange={setFrom}
                exclude={to}
                placeholder="Search source station…"
              />
            </Field>
            <Field label={t("booking.toStation")}>
              <StationSearch
                value={to}
                onChange={setTo}
                exclude={from}
                placeholder="Search destination station…"
              />
            </Field>
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

          <button
            onClick={onFav}
            disabled={!from || !to}
            className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
              favSaved
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-orange-200 bg-white text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-800 dark:bg-stone-900 dark:text-orange-300"
            }`}
          >
            <FaHeart />
            {favSaved ? "Saved as favorite!" : "Save as favorite"}
          </button>
        </div>

        <motion.div layout className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Booking summary
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-[Sora] text-lg font-bold text-foreground">
                {fromS ? `${fromS.name} (${fromS.code})` : "—"}
              </div>
            </div>
            <div className="bg-railway-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-soft">
              <FaTrain />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <div className="truncate font-[Sora] text-lg font-bold text-foreground">
                {toS ? `${toS.name} (${toS.code})` : "—"}
              </div>
            </div>
          </div>
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-700 to-transparent" />

          <div className="space-y-[18px]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold capitalize text-foreground">
                {type === "season" ? "Season" : "Journey"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold text-foreground">{CATEGORY_LABEL[category]}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">{t("booking.passengers")}</span>
              <div className="flex flex-col items-end text-right font-semibold text-foreground">
                <span>
                  {adults} {t("booking.adults")}
                </span>
                <span>
                  {children} {t("booking.children")}
                </span>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Line</span>
              <span className="font-semibold capitalize text-foreground">{fromS?.line ?? "—"}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 p-4 border border-orange-100/60 dark:border-stone-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              {t("booking.totalFare")}
            </div>
            <div className="font-[Sora] text-3xl font-extrabold text-railway-gradient">
              {formatINR(fare)}
            </div>
          </div>
          <button
            data-testid="proceed-payment-button"
            onClick={onBook}
            disabled={loading || !from || !to}
            className="bg-railway-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t("common.loading") : t("booking.proceedPayment")}{" "}
            <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
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

function CategoryOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition shadow-soft ${
        selected
          ? "border-orange-400 dark:border-orange-500 bg-orange-50/80 dark:bg-stone-800"
          : "border-orange-100 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800/80"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-orange-500" : "border-orange-200 dark:border-stone-700"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${selected ? "bg-railway-gradient" : "bg-transparent"}`}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-[Sora] text-sm font-bold text-foreground">{title}</div>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function DeliveryOption({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition shadow-soft ${
        selected
          ? "border-orange-400 dark:border-orange-500 bg-orange-50/80 dark:bg-stone-800"
          : "border-orange-100 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800/80"
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
          selected
            ? "bg-railway-gradient text-white"
            : "bg-orange-50 dark:bg-stone-800 text-orange-700 dark:text-orange-400"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-[Sora] text-sm font-bold text-foreground">{title}</div>
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
              selected ? "border-orange-500" : "border-orange-200 dark:border-stone-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition ${
                selected ? "bg-railway-gradient" : "bg-transparent"
              }`}
            />
          </span>
        </div>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
