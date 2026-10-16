import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { AuthShell, FormField, PrimaryButton } from "../components/AuthShell";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { useAuth } from "../lib/auth";
import { evaluatePassword, getFirstUnmetPasswordRequirement } from "../lib/passwordValidation";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · RailConnect" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    const pwStatus = evaluatePassword(password);
    if (!pwStatus.isValid) {
      const unmet = getFirstUnmetPasswordRequirement(password);
      setError(
        unmet ? `Password must satisfy: ${unmet}` : "Password does not meet all requirements.",
      );
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), mobile, email.trim(), password);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. No card required. Book your first ticket in seconds."
      footer={
        <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span>Already a member?</span>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-orange-200/80 bg-white dark:bg-card dark:border-border dark:text-orange-400 px-3.5 py-1.5 text-xs font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/60 dark:hover:bg-neutral-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 active:scale-[0.97]"
          >
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Full name"
          required
          autoComplete="name"
          placeholder="Asha Mehta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Mobile number"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          pattern="[6-9][0-9]{9}"
          placeholder="10-digit mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <FormField
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/70"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Enter strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              aria-describedby="register-password-requirements"
              className="input-premium w-full rounded-xl border border-orange-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 dark:text-foreground px-4 py-3 pr-11 text-sm shadow-sm outline-none placeholder:text-muted-foreground transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>
          <PasswordRequirements password={password} id="register-password-requirements" />
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </div>
        )}
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 text-center text-xs text-amber-800 dark:text-amber-300">
          <strong>Prototype Notice:</strong> Account registration is simulated in browser-local
          storage. Do not use real or banking passwords.
        </div>
        <PrimaryButton loading={loading} type="submit">
          Create my account
        </PrimaryButton>
        <p className="text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
