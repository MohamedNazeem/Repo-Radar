import type { TrackedRepo } from "@repo/api";

export const TRACKED_STORAGE_KEY = "github-repo-tracker:tracked";

export function loadTrackedRepos(): TrackedRepo[] {
  try {
    const raw = localStorage.getItem(TRACKED_STORAGE_KEY);
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
        TRACKED_STORAGE_KEY,
        JSON.stringify(store.getState().tracked.repos),
      );
    } catch {
      // Ignore quota / private-mode failures.
    }
  });
}
