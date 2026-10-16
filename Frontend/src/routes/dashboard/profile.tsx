import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FaUserPen,
  FaPhone,
  FaEnvelope,
  FaIdBadge,
  FaLock,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { ProfileEditForm } from "../../components/ProfileEditForm";
import { ChangePasswordForm } from "../../components/ChangePasswordForm";
import { LoginActivityContent } from "../../components/LoginActivityContent";
import { getInitials } from "../../lib/profile";
import { useAuth } from "../../lib/auth";
import { useTranslation } from "../../lib/i18n";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile · RailConnect" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginActivityModalOpen, setIsLoginActivityModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLoginActivityModalOpen) setIsLoginActivityModalOpen(false);
        if (isPasswordModalOpen) setIsPasswordModalOpen(false);
        if (isModalOpen) setIsModalOpen(false);
      }
    };
    if (isModalOpen || isPasswordModalOpen || isLoginActivityModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen, isPasswordModalOpen, isLoginActivityModalOpen]);

  if (!user) return null;

  const initials = getInitials(user.name, user.email);

  const handleEditProfileClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Mobile viewport (< 768px) navigates to dedicated full-page edit screen
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate({ to: "/dashboard/profile/edit" });
    } else {
      // Desktop and tablet open the centered modal
      setIsModalOpen(true);
    }
  };

  const handleChangePasswordClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Mobile viewport (< 768px) navigates to dedicated full-page change password screen
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate({ to: "/dashboard/profile/change-password" });
    } else {
      // Desktop and tablet open the centered modal
      setIsPasswordModalOpen(true);
    }
  };

  const handleLoginActivityClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Mobile viewport (< 768px) navigates to dedicated full-page login activity screen
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate({ to: "/dashboard/profile/login-activity" });
    } else {
      // Desktop and tablet open the centered modal
      setIsLoginActivityModalOpen(true);
    }
  };

  return (
    <DashboardShell>
      <h1 className="font-[Sora] text-3xl font-extrabold tracking-tight text-foreground">
        Account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your RailConnect account, security and credentials.
      </p>

      {/* Main Grid: Equal outer heights on desktop/tablet, natural vertical stack on mobile */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* CARD 1: Personal Details */}
        <div className="glass flex h-full flex-col justify-between rounded-3xl border border-orange-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 p-6 shadow-soft">
          <div>
            {/* Heading area with dynamic circular avatar */}
            <div className="flex items-center gap-3">
              <div
                className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-soft select-none"
                aria-label={`Avatar for ${user.name}`}
              >
                {initials}
              </div>
              <div>
                <h2 className="font-[Sora] text-lg font-bold text-foreground">
                  {t("profile.personalDetails")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your verified identity and contact information
                </p>
              </div>
            </div>

            {/* Read-only field rows */}
            <div className="mt-5 space-y-2.5">
              <Row k={t("profile.fullName")} v={user.name} icon={<FaUserPen />} />
              <Row k={t("profile.email")} v={user.email} icon={<FaEnvelope />} />
              <Row k={t("profile.mobile")} v={user.mobile || "—"} icon={<FaPhone />} />
              <Row
                k="User ID"
                v={user.id ? user.id.slice(0, 8).toUpperCase() : "—"}
                icon={<FaIdBadge />}
              />
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-6 pt-1">
            <button
              type="button"
              data-testid="edit-profile-trigger"
              onClick={handleEditProfileClick}
              className="bg-railway-gradient inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaUserPen /> {t("profile.editProfile")}
            </button>
          </div>
        </div>

        {/* CARD 2: Security */}
        <div className="glass flex h-full flex-col justify-between rounded-3xl border border-orange-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 p-6 shadow-soft">
          <div>
            {/* Heading area */}
            <div className="flex items-center gap-3">
              <span className="bg-railway-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft">
                <FaLock className="text-sm" />
              </span>
              <div>
                <h2 className="font-[Sora] text-lg font-bold text-foreground">
                  {t("settings.security")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage sign-in credentials and active sessions
                </p>
              </div>
            </div>

            {/* Sub-cards: Change Password & Login Activity */}
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Change Password Sub-card */}
              <button
                type="button"
                data-testid="change-password-trigger"
                onClick={handleChangePasswordClick}
                className="group flex w-full cursor-pointer flex-col justify-between rounded-2xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 text-left shadow-2xs transition-all duration-200 hover:border-orange-400 dark:hover:border-orange-500/60 hover:bg-orange-50/40 dark:hover:bg-stone-800 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none active:scale-[0.99]"
              >
                <div className="mb-4 flex w-full items-center justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400 transition-colors group-hover:bg-orange-100 dark:group-hover:bg-stone-700">
                    <FaLock className="text-sm" />
                  </div>
                  <span className="text-sm font-bold text-orange-400 transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground transition-colors group-hover:text-orange-700 dark:group-hover:text-orange-400">
                    {t("settings.sec.changePassword")}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t("settings.sec.changePasswordDesc")}
                  </div>
                </div>
              </button>

              {/* Login Activity Sub-card */}
              <button
                type="button"
                data-testid="login-activity-trigger"
                onClick={handleLoginActivityClick}
                className="group flex w-full cursor-pointer flex-col justify-between rounded-2xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 text-left shadow-2xs transition-all duration-200 hover:border-orange-400 dark:hover:border-orange-500/60 hover:bg-orange-50/40 dark:hover:bg-stone-800 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none active:scale-[0.99]"
              >
                <div className="mb-4 flex w-full items-center justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400 transition-colors group-hover:bg-orange-100 dark:group-hover:bg-stone-700">
                    <FaShieldHalved className="text-sm" />
                  </div>
                  <span className="text-sm font-bold text-orange-400 transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground transition-colors group-hover:text-orange-700 dark:group-hover:text-orange-400">
                    {t("profile.loginActivity")}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t("settings.sec.activeSessionsDesc")}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Information Footer */}
          <div className="mt-6 rounded-2xl border border-orange-100 dark:border-stone-800 bg-orange-50/50 dark:bg-stone-900/60 p-4">
            <p className="text-xs text-muted-foreground">
              Sign-in credentials protect your bookings and wallet. Logout is always accessible via
              the sidebar navigation menu.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Profile Editor Modal Overlay */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="modal-edit-profile"
          aria-labelledby="modal-profile-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between border-b border-orange-100 dark:border-stone-800 pb-3">
              <div>
                <h2
                  id="modal-profile-title"
                  className="font-[Sora] text-xl font-bold text-foreground"
                >
                  Edit Profile
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Update your personal details and contact information
                </p>
              </div>
              <button
                type="button"
                data-testid="close-edit-profile"
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground/70 dark:text-stone-300 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-foreground active:scale-[0.96]"
                aria-label="Close profile editor"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            {/* Modal Form */}
            <ProfileEditForm
              onSuccess={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Desktop / Tablet Change Password Modal Overlay */}
      {isPasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="modal-change-password"
          aria-labelledby="modal-password-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPasswordModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <div className="mb-2 flex items-center justify-end">
              <button
                type="button"
                data-testid="close-change-password"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground/70 dark:text-stone-300 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-foreground active:scale-[0.96]"
                aria-label="Close password editor"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            {/* Two-step form */}
            <ChangePasswordForm
              onSuccess={() => setIsPasswordModalOpen(false)}
              onCancel={() => setIsPasswordModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Desktop / Tablet Login Activity Modal Overlay */}
      {isLoginActivityModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="modal-login-activity"
          aria-labelledby="modal-login-activity-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginActivityModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-orange-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginActivityContent
              onClose={() => setIsLoginActivityModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Row({ k, v, icon }: { k: string; v: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-100/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 px-4 py-3 text-sm">
      <span className="flex shrink-0 items-center gap-2.5 font-medium text-muted-foreground">
        {icon && <span className="text-orange-500/80 dark:text-orange-400">{icon}</span>}
        {k}
      </span>
      <span className="max-w-[60%] truncate text-right font-semibold text-foreground" title={v}>
        {v}
      </span>
    </div>
  );
}
