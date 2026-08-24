import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FaGear, FaLanguage, FaBell, FaShieldHalved, FaEye, FaSliders } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings · RailConnect" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notif, setNotif] = useState({ booking: true, offers: true, journey: true });
  const [privacy, setPrivacy] = useState({ analytics: true, personalize: false });
  const [pref, setPref] = useState({ reducedMotion: false, largeText: false });

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize your RailConnect experience.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={<FaLanguage />} title="Language">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "en", l: "English" },
              { v: "hi", l: "हिन्दी" },
              { v: "mr", l: "मराठी" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setLanguage(o.v)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  language === o.v
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-orange-100 bg-white/80 text-foreground/70"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<FaBell />} title="Notifications">
          <Toggle
            label="Booking confirmations"
            checked={notif.booking}
            onChange={(v) => setNotif({ ...notif, booking: v })}
          />
          <Toggle
            label="Offers & promotions"
            checked={notif.offers}
            onChange={(v) => setNotif({ ...notif, offers: v })}
          />
          <Toggle
            label="Journey reminders"
            checked={notif.journey}
            onChange={(v) => setNotif({ ...notif, journey: v })}
          />
        </Section>

        <Section icon={<FaShieldHalved />} title="Security">
          <Action label="Change password" desc="Recommended every 90 days" />
          <Action label="Two-factor authentication" desc="Add an extra layer of security" />
          <Action label="Active sessions" desc="Review devices signed in" />
        </Section>

        <Section icon={<FaEye />} title="Privacy">
          <Toggle
            label="Share usage analytics"
            checked={privacy.analytics}
            onChange={(v) => setPrivacy({ ...privacy, analytics: v })}
          />
          <Toggle
            label="Personalized recommendations"
            checked={privacy.personalize}
            onChange={(v) => setPrivacy({ ...privacy, personalize: v })}
          />
        </Section>

        <Section icon={<FaSliders />} title="App preferences">
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                  theme === t
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-orange-100 bg-white/80 text-foreground/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <Toggle
              label="Reduced motion"
              checked={pref.reducedMotion}
              onChange={(v) => setPref({ ...pref, reducedMotion: v })}
            />
            <Toggle
              label="Larger text"
              checked={pref.largeText}
              onChange={(v) => setPref({ ...pref, largeText: v })}
            />
          </div>
        </Section>

        <Section icon={<FaGear />} title="Accessibility">
          <p className="text-sm text-muted-foreground">
            RailConnect supports screen readers, high-contrast mode, and keyboard navigation across
            every page.
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
    <div className="glass rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="bg-railway-gradient flex h-8 w-8 items-center justify-center rounded-xl text-white">
          {icon}
        </span>
        <h2 className="font-[Sora] text-lg font-bold">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
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
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/80 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-railway-gradient" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

function Action({ label, desc }: { label: string; desc: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-left transition hover:bg-white">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span className="text-orange-500">›</span>
    </button>
  );
}
