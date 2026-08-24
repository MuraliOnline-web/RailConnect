import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  FaArrowRightFromBracket,
  FaUserPen,
  FaPhone,
  FaEnvelope,
  FaIdBadge,
  FaLock,
  FaClockRotateLeft,
  FaHeart,
  FaTrainSubway,
  FaSliders,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile · RailConnect" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardShell>
      <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your RailConnect account, security and travel preferences.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 text-center shadow-soft">
          <div className="bg-railway-gradient mx-auto flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-bold text-white shadow-soft">
            {initials || "RC"}
          </div>
          <div className="mt-4 font-[Sora] text-xl font-bold">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-2 inline-block rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
            Free · Commuter
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-700 transition-all duration-200 hover:scale-[1.02] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-[0.98]"
          >
            <FaArrowRightFromBracket /> Log out
          </button>
        </div>

        <Section title="Personal details" icon={<FaUserPen />} className="lg:col-span-2">
          <Row k="Full name" v={user.name} icon={<FaUserPen />} />
          <Row k="Email" v={user.email} icon={<FaEnvelope />} />
          <Row k="Mobile number" v="+91 98••• ••321" icon={<FaPhone />} />
          <Row k="User ID" v={user.id.slice(0, 8).toUpperCase()} icon={<FaIdBadge />} />
          <button className="bg-railway-gradient mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-soft">
            <FaUserPen /> Edit profile
          </button>
        </Section>

        <Section title="Security" icon={<FaLock />}>
          <ActionRow label="Change password" desc="Update your sign-in password" />
          <ActionRow label="Login activity" desc="Devices and sessions" />
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100/80 hover:text-rose-800 active:scale-[0.99]"
          >
            Log out of this device <FaArrowRightFromBracket />
          </button>
        </Section>

        <Section title="Travel preferences" icon={<FaTrainSubway />}>
          <ActionRow
            label="Favorite routes"
            desc="Saved for one-tap booking"
            to="/dashboard/favorites"
          />
          <ActionRow label="Frequent stations" desc="Auto-filled in booking" />
          <ActionRow label="Preferred class" desc="2nd class" />
        </Section>

        <Section title="App settings" icon={<FaSliders />}>
          <ActionRow label="Language" desc="English" to="/dashboard/settings" />
          <ActionRow
            label="Notifications"
            desc="Booking, journey, offers"
            to="/dashboard/settings"
          />
          <ActionRow
            label="Theme & accessibility"
            desc="Light · Standard"
            to="/dashboard/settings"
          />
        </Section>

        <Section title="Activity">
          <Link
            to="/dashboard/history"
            className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm hover:bg-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <FaClockRotateLeft /> Booking history
            </span>
            <span className="text-orange-500">›</span>
          </Link>
          <Link
            to="/dashboard/favorites"
            className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm hover:bg-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <FaHeart /> Favorite routes
            </span>
            <span className="text-orange-500">›</span>
          </Link>
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-3xl p-6 shadow-soft ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="bg-railway-gradient flex h-8 w-8 items-center justify-center rounded-xl text-white">
            {icon}
          </span>
        )}
        <h2 className="font-[Sora] text-lg font-bold">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ k, v, icon }: { k: string; v: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {k}
      </span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function ActionRow({ label, desc, to }: { label: string; desc: string; to?: string }) {
  const inner = (
    <div className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-left transition hover:bg-white">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span className="text-orange-500">›</span>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="w-full">{inner}</button>;
}
