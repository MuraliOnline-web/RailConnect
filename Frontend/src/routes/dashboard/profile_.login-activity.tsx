import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { DashboardShell } from "../../components/DashboardShell";
import { LoginActivityContent } from "../../components/LoginActivityContent";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/dashboard/profile_/login-activity")({
  head: () => ({ meta: [{ title: "Login Activity · RailConnect" }] }),
  component: ProfileLoginActivityMobilePage,
});

function ProfileLoginActivityMobilePage() {
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
          <LoginActivityContent onClose={handleReturn} isModal={false} />
        </div>
      </div>
    </DashboardShell>
  );
}
