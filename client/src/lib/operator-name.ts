const STORAGE_KEY = "discovery-one:operator-name";
const MAX_LEN = 120;

export function getOperatorName(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" ? raw.slice(0, MAX_LEN) : "";
  } catch {
    return "";
  }
}

export function setOperatorName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, name.slice(0, MAX_LEN));
  } catch {
    /* ignore quota / private mode */
  }
}
