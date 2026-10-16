import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import { DashboardShell } from "../../components/DashboardShell";
import { ChangePasswordForm } from "../../components/ChangePasswordForm";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/dashboard/profile_/change-password")({
  head: () => ({ meta: [{ title: "Change Password · RailConnect" }] }),
  component: ProfileChangePasswordMobilePage,
});

function ProfileChangePasswordMobilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  const handleReturn = () => {
    navigate({ to: "/dashboard/profile" });
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-xl">
        <div className="glass rounded-3xl border border-orange-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 p-5 sm:p-6 shadow-soft">
          {/* Header with X Close Button */}
          <div className="mb-4 flex items-center justify-between border-b border-orange-100 dark:border-stone-800 pb-3">
            <div>
              <h1 className="font-[Sora] text-2xl font-bold text-foreground">Change Password</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Securely update your sign-in credentials
              </p>
            </div>
            <button
              type="button"
              onClick={handleReturn}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground/70 dark:text-stone-300 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-foreground active:scale-[0.96]"
              aria-label="Close password editor"
            >
              <FaXmark className="text-base" />
            </button>
          </div>

          {/* Two-step form */}
          <ChangePasswordForm onSuccess={handleReturn} onCancel={handleReturn} isModal={false} />
        </div>
      </div>
    </DashboardShell>
  );
}
