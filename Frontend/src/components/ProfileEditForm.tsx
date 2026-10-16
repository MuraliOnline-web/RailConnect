import { useState } from "react";
import { FaUserPen, FaEnvelope, FaPhone, FaIdBadge, FaLock } from "react-icons/fa6";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";

interface ProfileEditFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isModal?: boolean;
}

export function ProfileEditForm({ onSuccess, onCancel, isModal = false }: ProfileEditFormProps) {
  const { user, updateProfile } = useAuth();

  const [draftName, setDraftName] = useState(user?.name || "");
  const [draftEmail, setDraftEmail] = useState(user?.email || "");
  const [draftMobile, setDraftMobile] = useState(user?.mobile || "");
  const [errors, setErrors] = useState<{ name?: string; email?: string; mobile?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const validate = () => {
    const newErrors: { name?: string; email?: string; mobile?: string } = {};

    if (!draftName.trim()) {
      newErrors.name = "Full name is required";
    } else if (draftName.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!draftEmail.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(draftEmail.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (draftMobile.trim()) {
      const digitsOnly = draftMobile.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        newErrors.mobile = "Please enter a valid mobile number (min 10 digits)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: draftName.trim(),
        email: draftEmail.trim(),
        mobile: draftMobile.trim(),
      });
      toast.success("Profile updated successfully");
      onSuccess();
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="profile-name"
          className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground/80"
        >
          <FaUserPen className="text-orange-500" />
          Full Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={draftName}
          onChange={(e) => {
            setDraftName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="e.g. Murali Krishna"
          className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
            errors.name
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
              : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="profile-email"
          className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground/80"
        >
          <FaEnvelope className="text-orange-500 dark:text-orange-400" />
          Email Address
        </label>
        <input
          id="profile-email"
          type="email"
          value={draftEmail}
          onChange={(e) => {
            setDraftEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="you@example.com"
          className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
            errors.email
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
              : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            {errors.email}
          </p>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label
          htmlFor="profile-mobile"
          className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground/80"
        >
          <FaPhone className="text-orange-500 dark:text-orange-400" />
          Mobile Number
        </label>
        <input
          id="profile-mobile"
          type="tel"
          value={draftMobile}
          onChange={(e) => {
            setDraftMobile(e.target.value);
            if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
          }}
          placeholder="+91 98765 43210"
          className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
            errors.mobile
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
              : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
          }`}
        />
        {errors.mobile && (
          <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            {errors.mobile}
          </p>
        )}
      </div>

      {/* User ID (Read-only) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground/80">
          <span className="flex items-center gap-2">
            <FaIdBadge className="text-orange-500 dark:text-orange-400" />
            User ID
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-100/70 dark:bg-orange-950/60 border border-transparent dark:border-orange-900/40 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:text-orange-400">
            <FaLock className="text-[9px]" /> Read-only
          </span>
        </div>
        <div className="flex w-full items-center justify-between rounded-xl border border-orange-100 dark:border-stone-800 bg-orange-50/40 dark:bg-stone-900/60 px-4 py-2.5 text-sm font-semibold text-foreground/80 dark:text-stone-300 select-none">
          <span>{user.id ? user.id.slice(0, 8).toUpperCase() : "—"}</span>
          <span className="text-xs text-muted-foreground font-normal">Immutable ID</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`flex items-center gap-3 pt-3 ${isModal ? "justify-end" : "justify-end sm:justify-end"}`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-2 text-xs font-semibold text-foreground/80 dark:text-stone-200 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-railway-gradient inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
