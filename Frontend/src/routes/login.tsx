import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AuthShell, FormField, PrimaryButton } from "../components/AuthShell";
import { useAuth } from "../lib/auth";
import { generateCaptcha, verifyCaptcha } from "../lib/captcha";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in · RailConnect" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!verifyCaptcha(captcha, captchaInput)) {
      setError("Incorrect CAPTCHA. Please try again.");
      refreshCaptcha();
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      refreshCaptcha();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access your tickets, passes and journey history."
      footer={
        <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span>New to RailConnect?</span>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full border border-orange-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 active:scale-[0.97]"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/70">
            CAPTCHA
          </span>
          <div className="flex items-center gap-2">
            <div
              aria-label="CAPTCHA code"
              className="select-none rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 font-[Sora] text-lg font-bold tracking-[0.35em] text-foreground shadow-sm"
              style={{
                fontFamily: "Sora, ui-monospace, monospace",
                textDecoration: "line-through",
                textDecorationColor: "rgba(249,115,22,0.4)",
              }}
            >
              {captcha}
            </div>
            <button
              type="button"
              onClick={refreshCaptcha}
              aria-label="Refresh CAPTCHA"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-white/80 text-orange-600 shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            required
            autoComplete="off"
            placeholder="Enter CAPTCHA"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="mt-2 w-full rounded-xl border border-orange-100 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none ring-orange-300/50 transition placeholder:text-muted-foreground focus:border-orange-300 focus:ring-2"
          />
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <PrimaryButton loading={loading} type="submit">
          Log in to RailConnect
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
