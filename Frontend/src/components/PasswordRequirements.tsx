import { FaCheck, FaXmark } from "react-icons/fa6";
import { PASSWORD_RULES } from "../lib/passwordValidation";

interface PasswordRequirementsProps {
  password: string;
  id?: string;
  className?: string;
}

export function PasswordRequirements({
  password,
  id = "password-requirements",
  className = "",
}: PasswordRequirementsProps) {
  return (
    <ul id={id} aria-label="Password requirements" className={`mt-2.5 space-y-1.5 ${className}`}>
      {PASSWORD_RULES.map((rule) => {
        const satisfied = rule.test(password);
        return (
          <li
            key={rule.id}
            data-rule={rule.id}
            data-satisfied={satisfied}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              satisfied
                ? "font-medium text-emerald-600 dark:text-emerald-400"
                : "text-rose-500 dark:text-rose-400"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] transition-colors duration-200 ${
                satisfied
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400"
              }`}
              aria-hidden="true"
            >
              {satisfied ? <FaCheck className="text-[9px]" /> : <FaXmark className="text-[9px]" />}
            </span>
            <span>{rule.label}</span>
          </li>
        );
      })}
      <li className="pt-1 text-[11px] text-amber-700 dark:text-amber-400">
        Prototype Model: Saved in browser-local storage. Never use real personal or banking
        passwords.
      </li>
    </ul>
  );
}
