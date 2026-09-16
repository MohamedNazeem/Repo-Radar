import type { TrackedRepo } from "@repo/api";

const STORAGE_KEY = "github-repo-tracker:tracked";

export function loadTrackedRepos(): TrackedRepo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TrackedRepo[]) : [];
  } catch {
    return [];
  }
}

export function persistTrackedRepos(store: {
  getState: () => { tracked: { repos: TrackedRepo[] } };
  subscribe: (listener: () => void) => void;
}): void {
  store.subscribe(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(store.getState().tracked.repos),
      );
    } catch {
  
    }
  });
}
