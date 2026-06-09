const STORAGE_KEY = "discovery-one:active-deck-id";

export function getActiveDeckId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function setActiveDeckId(deckId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, deckId);
  } catch {
    /* ignore */
  }
}
