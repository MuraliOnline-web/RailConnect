export type FavoriteRoute = {
  id: string;
  userId: string;
  fromCode: string;
  toCode: string;
  label?: string;
  createdAt: string;
};

const KEY = "railconnect.favorites";

export function loadFavorites(userId: string): FavoriteRoute[] {
  if (typeof window === "undefined") return [];
  try {
    const all: FavoriteRoute[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return all.filter((f) => f.userId === userId);
  } catch {
    return [];
  }
}

export function addFavorite(f: FavoriteRoute) {
  const all: FavoriteRoute[] = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (all.some((x) => x.userId === f.userId && x.fromCode === f.fromCode && x.toCode === f.toCode))
    return;
  all.push(f);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function removeFavorite(userId: string, id: string) {
  const all: FavoriteRoute[] = JSON.parse(localStorage.getItem(KEY) || "[]");
  localStorage.setItem(
    KEY,
    JSON.stringify(all.filter((f) => !(f.userId === userId && f.id === id))),
  );
}
