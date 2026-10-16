export function getInitials(name?: string, email?: string): string {
  if (!name && !email) return "RC";
  const cleanName = (name || "").trim();
  if (cleanName) {
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return cleanName[0].toUpperCase();
  }
  if (email) {
    return (email.trim()[0] || "RC").toUpperCase();
  }
  return "RC";
}
