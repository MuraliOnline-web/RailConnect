import { useEffect, useState } from "react";
import {
  FaShieldHalved,
  FaCircleInfo,
  FaLaptop,
  FaMobileScreen,
  FaTablet,
  FaClockRotateLeft,
  FaXmark,
} from "react-icons/fa6";
import { getBrowserDeviceContext, type CurrentDeviceContext } from "../lib/sessionActivity";

interface LoginActivityContentProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function LoginActivityContent({ onClose, isModal = false }: LoginActivityContentProps) {
  const [deviceContext, setDeviceContext] = useState<CurrentDeviceContext>({
    browserName: "Web Browser",
    osName: "Standard OS",
    deviceType: "desktop",
    userAgentSnippet: "Client session",
    isClient: false,
  });

  useEffect(() => {
    setDeviceContext(getBrowserDeviceContext());
  }, []);

  const DeviceIcon =
    deviceContext.deviceType === "mobile"
      ? FaMobileScreen
      : deviceContext.deviceType === "tablet"
        ? FaTablet
        : FaLaptop;

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-orange-100 dark:border-stone-800 pb-3.5">
        <div className="flex items-center gap-3">
          <span className="bg-railway-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft">
            <FaShieldHalved className="text-sm" />
          </span>
          <div>
            <h2 className="font-[Sora] text-xl font-bold text-foreground">Login Activity</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review the devices and sign-in activity associated with your account.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            data-testid="close-login-activity"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground/70 dark:text-stone-300 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-foreground active:scale-[0.96]"
            aria-label="Close login activity"
          >
            <FaXmark className="text-sm" />
          </button>
        )}
      </div>

      {/* 2. Demo availability notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-orange-200/90 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-3.5 text-xs text-orange-950 dark:text-orange-200">
        <FaCircleInfo className="mt-0.5 shrink-0 text-sm text-orange-600 dark:text-orange-400" />
        <p className="leading-relaxed">
          Session history and remote session management will be available after account-security
          backend integration.
        </p>
      </div>

      {/* 3. Current Device Section */}
      <div className="rounded-2xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Device
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              This device
            </span>
            <span className="inline-flex items-center rounded-full border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              Local session
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-xl border border-orange-100 dark:border-stone-800 bg-[#fffaf5] dark:bg-stone-950/40 p-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-stone-800 text-orange-700 dark:text-orange-400">
            <DeviceIcon className="text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-[Sora] text-sm font-bold text-foreground">
              {deviceContext.browserName} on {deviceContext.osName}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Current browser</span>
              <span>•</span>
              <span>Active in this window</span>
              <span>•</span>
              <span className="capitalize">{deviceContext.deviceType}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          This session is stored locally in your current browser. No remote token is active.
        </p>
      </div>

      {/* 4. Other Active Sessions Section */}
      <div className="rounded-2xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Other Active Sessions
          </span>
          <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
            Pending API
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-orange-200/90 dark:border-stone-800 bg-orange-50/30 dark:bg-stone-950/30 px-4 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 mb-2.5">
            <FaLaptop className="text-sm" />
          </div>
          <h3 className="font-[Sora] text-xs font-bold text-foreground">
            Additional device sessions are not available without server session tracking.
          </h3>
          <p className="mt-1 max-w-sm text-[11px] text-muted-foreground">
            When connected to the account security service, you will be able to review and manage
            other browsers or devices logged into your account.
          </p>
        </div>
      </div>

      {/* 5. Recent Sign-ins Section */}
      <div className="rounded-2xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recent Sign-ins
          </span>
          <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
            Pending API
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-orange-200/90 dark:border-stone-800 bg-orange-50/30 dark:bg-stone-950/30 px-4 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 mb-2.5">
            <FaClockRotateLeft className="text-sm" />
          </div>
          <h3 className="font-[Sora] text-xs font-bold text-foreground">
            Sign-in history will appear here when activity tracking is connected.
          </h3>
          <p className="mt-1 max-w-sm text-[11px] text-muted-foreground">
            A chronological audit log of successful and blocked sign-in events with device details
            and approximate locations will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
