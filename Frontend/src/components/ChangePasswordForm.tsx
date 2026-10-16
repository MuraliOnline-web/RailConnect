import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaShieldHalved, FaArrowLeft, FaCheck } from "react-icons/fa6";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { PasswordRequirements } from "./PasswordRequirements";
import { evaluatePassword, getFirstUnmetPasswordRequirement } from "../lib/passwordValidation";

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isModal?: boolean;
}

export function ChangePasswordForm({
  onSuccess,
  onCancel,
  isModal = false,
}: ChangePasswordFormProps) {
  const { verifyCurrentPassword, changePassword } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Step 2 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle Step 1 Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentError(null);

    if (!currentPassword) {
      setCurrentError("Please enter your current password");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyCurrentPassword(currentPassword);
      if (res.success) {
        setStep(2);
      } else {
        setCurrentError(res.error || "Incorrect current password");
      }
    } catch {
      setCurrentError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Step 2 Submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewError(null);
    setConfirmError(null);

    let hasError = false;

    const pwStatus = evaluatePassword(newPassword);
    if (!newPassword) {
      setNewError("New password is required");
      hasError = true;
    } else if (!pwStatus.isValid) {
      const unmet = getFirstUnmetPasswordRequirement(newPassword);
      setNewError(
        unmet ? `Password must satisfy: ${unmet}` : "Password does not meet all requirements",
      );
      hasError = true;
    } else if (newPassword === currentPassword) {
      setNewError("New password cannot be the same as your current password");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your new password");
      hasError = true;
    } else if (newPassword && newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    setIsUpdating(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Password updated successfully");
        // Clear sensitive states
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onSuccess();
      } else {
        setConfirmError(res.error || "Failed to update password");
      }
    } catch {
      setConfirmError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Header and Step Indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-railway-gradient flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-soft">
              <FaLock className="text-xs" />
            </span>
            <span className="font-[Sora] text-lg font-bold text-foreground">
              {step === 1 ? "Change Password" : "Set New Password"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
            {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {step === 1
            ? "Verify your current password before setting a new one."
            : "Choose a strong password and confirm it to finish."}
        </p>

        {/* Step Progress Bar */}
        <div className="mt-3 flex gap-1.5">
          <div className="bg-railway-gradient h-1 flex-1 rounded-full" />
          <div
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step === 2 ? "bg-railway-gradient" : "bg-orange-100 dark:bg-stone-800"
            }`}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleVerify}
            className="space-y-4"
          >
            {/* Current Password Field */}
            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground/80"
              >
                <span className="flex items-center gap-2">
                  <FaLock className="text-orange-500 dark:text-orange-400" />
                  Current Password
                </span>
              </label>

              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (currentError) setCurrentError(null);
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  disabled={isVerifying}
                  className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
                    currentError
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
                      : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition p-1"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>

              {currentError && (
                <p
                  role="alert"
                  className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {currentError}
                </p>
              )}
            </div>

            {/* Actions for Step 1 */}
            <div
              className={`flex items-center gap-3 pt-3 ${isModal ? "justify-end" : "justify-end"}`}
            >
              <button
                type="button"
                onClick={onCancel}
                disabled={isVerifying}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-2 text-xs font-semibold text-foreground/80 dark:text-stone-200 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="verify-password-submit-button"
                disabled={isVerifying}
                className="bg-railway-gradient inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleUpdate}
            className="space-y-4"
          >
            {/* New Password Field */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground/80"
              >
                <span className="flex items-center gap-2">
                  <FaShieldHalved className="text-orange-500 dark:text-orange-400" />
                  New Password
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">Min. 6 chars</span>
              </label>

              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (newError) setNewError(null);
                  }}
                  autoComplete="new-password"
                  aria-describedby="change-password-requirements"
                  placeholder="Enter new strong password"
                  disabled={isUpdating}
                  className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
                    newError
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
                      : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition p-1"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>

              {newError && (
                <p
                  role="alert"
                  className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {newError}
                </p>
              )}

              <PasswordRequirements password={newPassword} id="change-password-requirements" />
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground/80"
              >
                <span className="flex items-center gap-2">
                  <FaCheck className="text-orange-500 dark:text-orange-400" />
                  Confirm New Password
                </span>
              </label>

              <div className="relative">
                <input
                  id="confirm-new-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError(null);
                  }}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  disabled={isUpdating}
                  className={`w-full rounded-xl border bg-white dark:bg-stone-900 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 outline-none ${
                    confirmError
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
                      : "border-orange-200/90 dark:border-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-950"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>

              {confirmError && (
                <p
                  role="alert"
                  className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {confirmError}
                </p>
              )}
            </div>

            {/* Actions for Step 2 */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setNewError(null);
                  setConfirmError(null);
                }}
                disabled={isUpdating}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 text-xs font-semibold text-foreground/80 dark:text-stone-200 transition-all duration-200 hover:border-orange-300 dark:hover:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50"
              >
                <FaArrowLeft className="text-[10px]" /> Back
              </button>

              <button
                type="submit"
                data-testid="update-password-submit-button"
                disabled={isUpdating}
                className="bg-railway-gradient inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
