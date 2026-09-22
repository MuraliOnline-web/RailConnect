import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, FormField, PrimaryButton } from "../components/AuthShell";
import { useAuth } from "../lib/auth";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name, mobile, email, password);
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
            className="inline-flex items-center justify-center rounded-full border border-orange-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 active:scale-[0.97]"
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
        <FormField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
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
