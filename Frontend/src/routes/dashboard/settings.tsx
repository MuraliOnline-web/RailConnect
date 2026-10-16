import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FaGear, FaLanguage, FaBell, FaShieldHalved, FaEye, FaSliders } from "react-icons/fa6";
import { toast } from "sonner";
import { DashboardShell } from "../../components/DashboardShell";
import { useSettings, type AppLanguage, type AppTheme } from "../../lib/settings";
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings · RailConnect" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    settings,
    updateLanguage,
    updateTheme,
    updateNotifications,
    updatePrivacy,
    updatePreferences,
  } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (lang: AppLanguage) => {
    updateLanguage(lang);
    if (lang === "en") toast.success("Language changed to English");
    else if (lang === "hi") toast.success("भाषा बदलकर हिन्दी कर दी गई है");
    else if (lang === "te") toast.success("భాష తెలుగులోకి మార్చబడింది");
  };

  const handleThemeChange = (thm: AppTheme) => {
    updateTheme(thm);
    toast.success(t("toast.themeChanged"));
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight text-foreground">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Language Selection Card */}
        <Section icon={<FaLanguage />} title={t("settings.language")}>
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label={t("settings.language")}
          >
            {[
              { v: "en" as AppLanguage, l: "English" },
              { v: "hi" as AppLanguage, l: "हिन्दी" },
              { v: "te" as AppLanguage, l: "తెలుగు" },
            ].map((o) => {
              const active = settings.language === o.v;
              return (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleLanguageChange(o.v)}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    active
                      ? "border-orange-400 bg-orange-50 text-orange-700 shadow-xs dark:border-orange-500/80 dark:bg-orange-950/40 dark:text-orange-300"
                      : "border-orange-100/80 bg-white/80 text-foreground/75 hover:border-orange-200 hover:bg-white hover:text-foreground dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:bg-stone-800/90 dark:hover:text-stone-100"
                  }`}
                >
                  {o.l}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Notifications Preference Card */}
        <Section icon={<FaBell />} title={t("settings.notifications")}>
          <Toggle
            label={t("settings.notif.booking")}
            checked={settings.notifications.booking}
            onChange={(v) => {
              updateNotifications({ booking: v });
              toast.success(v ? "Booking confirmations enabled" : "Booking confirmations disabled");
            }}
          />
          <Toggle
            label={t("settings.notif.offers")}
            checked={settings.notifications.offers}
            onChange={(v) => {
              updateNotifications({ offers: v });
              toast.success(v ? "Offers & promotions enabled" : "Offers & promotions disabled");
            }}
          />
          <Toggle
            label={t("settings.notif.journey")}
            checked={settings.notifications.journey}
            onChange={(v) => {
              updateNotifications({ journey: v });
              toast.success(v ? "Journey reminders enabled" : "Journey reminders disabled");
            }}
          />
        </Section>

        {/* Security Card */}
        <Section icon={<FaShieldHalved />} title={t("settings.security")}>
          <Action
            label={t("settings.sec.changePassword")}
            desc={t("settings.sec.changePasswordDesc")}
            onClick={() => navigate({ to: "/dashboard/profile/change-password" })}
          />
          <Action
            label={t("settings.sec.twoFactor")}
            desc={t("settings.sec.twoFactorDesc")}
            disabled={true}
            badge={
              settings.language === "hi"
                ? "जल्द आ रहा है"
                : settings.language === "te"
                  ? "త్వరలో వస్తుంది"
                  : "Coming soon"
            }
          />
          <Action
            label={t("settings.sec.activeSessions")}
            desc={t("settings.sec.activeSessionsDesc")}
            onClick={() => navigate({ to: "/dashboard/profile/login-activity" })}
          />
        </Section>

        {/* Privacy Card */}
        <Section icon={<FaEye />} title={t("settings.privacy")}>
          <Toggle
            label={t("settings.priv.analytics")}
            checked={settings.privacy.analytics}
            onChange={(v) => updatePrivacy({ analytics: v })}
          />
          <Toggle
            label={t("settings.priv.personalize")}
            checked={settings.privacy.personalize}
            onChange={(v) => updatePrivacy({ personalize: v })}
          />
        </Section>

        {/* App Preferences Card */}
        <Section icon={<FaSliders />} title={t("settings.appPreferences")}>
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label={t("settings.appPreferences")}
          >
            {(["light", "dark", "system"] as const).map((thm) => {
              const active = settings.theme === thm;
              return (
                <button
                  key={thm}
                  type="button"
                  role="radio"
                  data-theme-option={thm}
                  aria-checked={active}
                  onClick={() => handleThemeChange(thm)}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    active
                      ? "border-orange-400 bg-orange-50 text-orange-700 shadow-xs dark:border-orange-500/80 dark:bg-orange-950/40 dark:text-orange-300"
                      : "border-orange-100/80 bg-white/80 text-foreground/75 hover:border-orange-200 hover:bg-white hover:text-foreground dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:bg-stone-800/90 dark:hover:text-stone-100"
                  }`}
                >
                  {t(`settings.theme.${thm}` as const)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-2">
            <Toggle
              label={t("settings.pref.reducedMotion")}
              checked={settings.preferences.reducedMotion}
              onChange={(v) => {
                updatePreferences({ reducedMotion: v });
                toast.success(v ? "Reduced motion enabled" : "Reduced motion disabled");
              }}
            />
            <Toggle
              label={t("settings.pref.largerText")}
              checked={settings.preferences.largeText}
              onChange={(v) => {
                updatePreferences({ largeText: v });
                toast.success(v ? "Larger text enabled" : "Larger text disabled");
              }}
            />
          </div>
        </Section>

        {/* Accessibility Card */}
        <Section icon={<FaGear />} title={t("settings.accessibility")}>
          <p className="cursor-default select-text text-sm leading-relaxed text-muted-foreground">
            {t("settings.accessibilityDesc")}
          </p>
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass cursor-default rounded-3xl p-6 shadow-soft transition-all duration-200">
      <div className="flex select-none items-center gap-2.5">
        <span className="bg-railway-gradient flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm">
          {icon}
        </span>
        <h2 className="font-[Sora] text-lg font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="mt-4 space-y-2.5">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={checked}
      aria-label={label}
      onKeyDown={handleKeyDown}
      onClick={() => onChange(!checked)}
      className="group flex cursor-pointer select-none items-center justify-between rounded-xl border border-orange-100/70 bg-white/80 px-4 py-3 shadow-2xs transition-all duration-150 hover:border-orange-200/90 hover:bg-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700 dark:hover:bg-stone-800/80"
    >
      <span className="text-sm font-medium text-foreground transition-colors group-hover:text-foreground">
        {label}
      </span>
      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 group-hover:ring-2 ${
          checked
            ? "bg-railway-gradient group-hover:ring-orange-400/40"
            : "bg-stone-300 group-hover:bg-stone-350 group-hover:ring-stone-400/30 dark:bg-stone-700 dark:group-hover:bg-stone-600 dark:group-hover:ring-stone-600/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
}

function Action({
  label,
  desc,
  onClick,
  disabled = false,
  badge,
}: {
  label: string;
  desc: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className="flex w-full select-none items-center justify-between rounded-xl border border-dashed border-stone-200/80 bg-white/40 px-4 py-3 text-left opacity-70 cursor-not-allowed dark:border-stone-800 dark:bg-stone-900/30 dark:opacity-60"
      >
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground/80">{label}</span>
            {badge && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-stone-800">
                {badge}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer select-none items-center justify-between rounded-xl border border-orange-100/70 bg-white/80 px-4 py-3 text-left shadow-2xs transition-all duration-150 hover:border-orange-200/90 hover:bg-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700 dark:hover:bg-stone-800/80"
    >
      <div className="min-w-0 pr-2">
        <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-foreground">
          {label}
        </div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <span
        className="text-lg leading-none font-bold text-orange-500 transition-all duration-150 group-hover:translate-x-1 group-hover:text-orange-600 dark:text-orange-400 dark:group-hover:text-orange-300"
        aria-hidden="true"
      >
        ›
      </span>
    </button>
  );
}
