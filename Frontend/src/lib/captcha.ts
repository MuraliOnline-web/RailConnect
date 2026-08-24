// Lightweight frontend CAPTCHA generator.
// Replace with backend-issued CAPTCHA during Spring Boot integration.
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateCaptcha(length = 6): string {
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += CHARS[arr[i] % CHARS.length];
  return out;
}

export function verifyCaptcha(expected: string, actual: string): boolean {
  return expected.trim() === actual.trim();
}
