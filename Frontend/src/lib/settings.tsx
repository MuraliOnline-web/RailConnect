/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { MotionConfig } from "framer-motion";
import {
  type AppLanguage,
  type AppTheme,
  type NotificationPreferences,
  type PrivacyPreferences,
  type AppUiPreferences,
  type AppSettings,
  GLOBAL_SETTINGS_KEY,
  USER_SETTINGS_KEY_PREFIX,
  SETTINGS_CHANGE_EVENT,
  loadSettings,
  saveSettings,
  applyThemeToDom,
  applyReducedMotionToDom,
  applyLargeTextToDom,
  applyLanguageToDom,
} from "./settings-core";

export type {
  AppLanguage,
  AppTheme,
  NotificationPreferences,
  PrivacyPreferences,
  AppUiPreferences,
  AppSettings,
};
export {
  loadSettings,
  saveSettings,
  applyThemeToDom,
  applyReducedMotionToDom,
  applyLargeTextToDom,
  applyLanguageToDom,
};

type SettingsContextType = {
  settings: AppSettings;
  updateLanguage: (language: AppLanguage) => void;
  updateTheme: (theme: AppTheme) => void;
  updateNotifications: (updates: Partial<NotificationPreferences>) => void;
  updatePrivacy: (updates: Partial<PrivacyPreferences>) => void;
  updatePreferences: (updates: Partial<AppUiPreferences>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings(userId));
  const [, startTransition] = useTransition();

  // Reload settings if userId changes (e.g. login or switch user)
  useEffect(() => {
    const loaded = loadSettings(userId);
    setSettings(loaded);
  }, [userId]);

  // Synchronize DOM classes and attributes whenever settings change
  useEffect(() => {
    applyThemeToDom(settings.theme);
    applyReducedMotionToDom(settings.preferences.reducedMotion);
    applyLargeTextToDom(settings.preferences.largeText);
    applyLanguageToDom(settings.language);
  }, [settings]);

  // Listen to OS prefers-color-scheme changes when theme is 'system'
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (settings.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyThemeToDom("system");
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [settings.theme]);

  // Listen for storage / cross-tab changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userKey = userId ? `${USER_SETTINGS_KEY_PREFIX}${userId}` : null;
    const handler = (e: Event) => {
      if (e.type === "storage" && userKey && (e as StorageEvent).key !== userKey) return;
      const next = loadSettings(userId);
      setSettings(next);
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [userId]);

  const update = (updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveSettings(next, userId);
      return next;
    });
  };

  const updateLanguage = (language: AppLanguage) => {
    update((prev) => ({ ...prev, language }));
  };

  const updateTheme = (theme: AppTheme) => {
    update((prev) => ({ ...prev, theme }));
  };

  const updateNotifications = (updates: Partial<NotificationPreferences>) => {
    update((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  };

  const updatePrivacy = (updates: Partial<PrivacyPreferences>) => {
    update((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates },
    }));
  };

  const updatePreferences = (updates: Partial<AppUiPreferences>) => {
    update((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateLanguage,
        updateTheme,
        updateNotifications,
        updatePrivacy,
        updatePreferences,
      }}
    >
      <MotionConfig reducedMotion={settings.preferences.reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Return safe fallback for components rendering outside the provider
    const fallbackSettings = loadSettings();
    return {
      settings: fallbackSettings,
      updateLanguage: (l) => saveSettings({ ...fallbackSettings, language: l }),
      updateTheme: (t) => saveSettings({ ...fallbackSettings, theme: t }),
      updateNotifications: (n) =>
        saveSettings({
          ...fallbackSettings,
          notifications: { ...fallbackSettings.notifications, ...n },
        }),
      updatePrivacy: (p) =>
        saveSettings({
          ...fallbackSettings,
          privacy: { ...fallbackSettings.privacy, ...p },
        }),
      updatePreferences: (pr) =>
        saveSettings({
          ...fallbackSettings,
          preferences: { ...fallbackSettings.preferences, ...pr },
        }),
    };
  }
  return ctx;
}
