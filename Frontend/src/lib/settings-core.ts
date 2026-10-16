export type AppLanguage = "en" | "hi" | "te";
export type AppTheme = "light" | "dark" | "system";

export type NotificationPreferences = {
  booking: boolean;
  offers: boolean;
  journey: boolean;
};

export type PrivacyPreferences = {
  analytics: boolean;
  personalize: boolean;
};

export type AppUiPreferences = {
  reducedMotion: boolean;
  largeText: boolean;
};

export type AppSettings = {
  language: AppLanguage;
  theme: AppTheme;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  preferences: AppUiPreferences;
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "light",
  notifications: {
    booking: true,
    offers: true,
    journey: true,
  },
  privacy: {
    analytics: true,
    personalize: false,
  },
  preferences: {
    reducedMotion: false,
    largeText: false,
  },
};

export const GLOBAL_SETTINGS_KEY = "railconnect.settings.active";
export const USER_SETTINGS_KEY_PREFIX = "railconnect.settings.user.";
export const SETTINGS_CHANGE_EVENT = "railconnect.settings.changed";

export function getStorageKey(userId?: string): string {
  if (userId && userId.trim()) {
    return `${USER_SETTINGS_KEY_PREFIX}${userId.trim()}`;
  }
  return "";
}

export function loadSettings(userId?: string): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (!userId || !userId.trim()) return DEFAULT_SETTINGS;
  try {
    const key = `${USER_SETTINGS_KEY_PREFIX}${userId.trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      language: parsed.language === "hi" || parsed.language === "te" ? parsed.language : "en",
      theme: parsed.theme === "dark" || parsed.theme === "system" ? parsed.theme : "light",
      notifications: {
        booking: parsed.notifications?.booking ?? true,
        offers: parsed.notifications?.offers ?? true,
        journey: parsed.notifications?.journey ?? true,
      },
      privacy: {
        analytics: parsed.privacy?.analytics ?? true,
        personalize: parsed.privacy?.personalize ?? false,
      },
      preferences: {
        reducedMotion: parsed.preferences?.reducedMotion ?? false,
        largeText: parsed.preferences?.largeText ?? false,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings, userId?: string) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify(settings);
    // Save to user storage only if user is signed in
    if (userId && userId.trim()) {
      localStorage.setItem(`${USER_SETTINGS_KEY_PREFIX}${userId.trim()}`, payload);
    }
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: settings }));
  } catch {
    /* ignore storage quota errors */
  }
}

export function getNotificationPreferences(userId?: string): NotificationPreferences {
  return loadSettings(userId).notifications;
}

/**
 * Apply theme to document element
 */
export function applyThemeToDom(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", theme);
}

/**
 * Apply reduced motion class to document element
 */
export function applyReducedMotionToDom(reducedMotion: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (reducedMotion) {
    root.classList.add("reduce-motion");
  } else {
    root.classList.remove("reduce-motion");
  }
}

/**
 * Apply large text class to document element
 */
export function applyLargeTextToDom(largeText: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (largeText) {
    root.classList.add("text-scale-large");
  } else {
    root.classList.remove("text-scale-large");
  }
}

/**
 * Apply language attribute to document element
 */
export function applyLanguageToDom(language: AppLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
}
