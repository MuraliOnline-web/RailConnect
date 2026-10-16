export interface PasswordRequirementRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordRequirementsStatus {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
  hasMinimumLength: boolean;
  isValid: boolean;
}

export const PASSWORD_RULES: PasswordRequirementRule[] = [
  {
    id: "uppercase",
    label: "At least one uppercase letter (A–Z)",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a–z)",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: "number",
    label: "At least one number (0–9)",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: "At least one special character (! @ # $ % & *)",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
  {
    id: "min-length",
    label: "At least 6 characters",
    test: (pw: string) => pw.length >= 6,
  },
];

export function evaluatePassword(password: string): PasswordRequirementsStatus {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);
  const hasMinimumLength = password.length >= 6;

  const isValid =
    hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter && hasMinimumLength;

  return {
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,
    hasMinimumLength,
    isValid,
  };
}

export function getFirstUnmetPasswordRequirement(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return rule.label;
    }
  }
  return null;
}
