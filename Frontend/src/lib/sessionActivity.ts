/**
 * Session Activity Data Models and Client Context Detection
 *
 * Provides typed data contracts for future backend integration and
 * safe, non-fabricated detection of the current browser/device environment.
 */

export interface DeviceSession {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browserName: string;
  osName: string;
  lastActiveAt?: string;
  signInAt?: string;
  location?: string;
  ipAddress?: string;
  isCurrent: boolean;
  status: "active" | "expired" | "revoked";
}

export interface SignInEvent {
  id: string;
  timestamp: string;
  deviceDescription: string;
  browser: string;
  os: string;
  location?: string;
  ipAddress?: string;
  outcome: "success" | "failed" | "blocked";
  failureReason?: string;
}

export interface CurrentDeviceContext {
  browserName: string;
  osName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  userAgentSnippet: string;
  isClient: boolean;
}

/**
 * Derives genuine client browser and OS context from navigator.
 * Does NOT fabricate IP, geolocation, or sign-in timestamps.
 */
export function getBrowserDeviceContext(): CurrentDeviceContext {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      browserName: "Web Browser",
      osName: "Standard OS",
      deviceType: "desktop",
      userAgentSnippet: "Server environment",
      isClient: false,
    };
  }

  const ua = navigator.userAgent || "";

  // 1. Detect Browser Name
  let browserName = "Web Browser";
  if (/edg\/([0-9.]+)/i.test(ua)) {
    browserName = "Microsoft Edge";
  } else if (/opr\/([0-9.]+)|opera/i.test(ua)) {
    browserName = "Opera";
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    browserName = "Google Chrome";
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    browserName = "Mozilla Firefox";
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    browserName = "Apple Safari";
  } else if (/msie|trident/i.test(ua)) {
    browserName = "Internet Explorer";
  }

  // 2. Detect Operating System
  let osName = "Unknown OS";
  if (/windows/i.test(ua)) {
    osName = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    osName = "macOS";
  } else if (/android/i.test(ua)) {
    osName = "Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    osName = "iOS";
  } else if (/linux/i.test(ua)) {
    osName = "Linux";
  } else if (/cros/i.test(ua)) {
    osName = "Chrome OS";
  }

  // 3. Detect Device Category
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/ipad|tablet/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|android/i.test(ua)) {
    deviceType = "mobile";
  } else if (window.innerWidth < 768) {
    deviceType = "mobile";
  } else if (window.innerWidth < 1024) {
    deviceType = "tablet";
  }

  return {
    browserName,
    osName,
    deviceType,
    userAgentSnippet: `${browserName} on ${osName}`,
    isClient: true,
  };
}
