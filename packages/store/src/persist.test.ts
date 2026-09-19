import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TRACKED_STORAGE_KEY,
  loadTrackedRepos,
  persistTrackedRepos,
} from "./persist.js";
import type { TrackedRepo } from "@repo/api";

function mockLocalStorage() {
  const map = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
  };
  vi.stubGlobal("localStorage", localStorage);
  return { map, localStorage };
}

const sample: TrackedRepo = {
  id: "vitejs/vite",
  githubId: 1,
  fullName: "vitejs/vite",
  name: "vite",
  description: "Next generation frontend tooling.",
  htmlUrl: "https://github.com/vitejs/vite",
  stars: 1,
  openIssues: 0,
  lastCommitDate: null,
  language: "TypeScript",
  ownerLogin: "vitejs",
  ownerAvatarUrl: "https://example.com/avatar.png",
};

describe("tracked persistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("returns an empty list when nothing is stored", () => {
    mockLocalStorage();
    expect(loadTrackedRepos()).toEqual([]);
  });

  it("returns an empty list for invalid JSON or a non-array payload", () => {
    const { localStorage } = mockLocalStorage();
    localStorage.setItem(TRACKED_STORAGE_KEY, "{not json");
    expect(loadTrackedRepos()).toEqual([]);

    localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify({ repos: [] }));
    expect(loadTrackedRepos()).toEqual([]);
  });

  it("reloads a previously saved watchlist", () => {
    const { localStorage } = mockLocalStorage();
    localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify([sample]));
    expect(loadTrackedRepos()).toEqual([sample]);
  });

  it("writes the current watchlist on every store notification", () => {
    const { map } = mockLocalStorage();
    const listeners: Array<() => void> = [];
    const store = {
      getState: () => ({ tracked: { repos: [sample] } }),
      subscribe: (listener: () => void) => {
        listeners.push(listener);
      },
    };

    persistTrackedRepos(store);
    listeners[0]?.();

    expect(JSON.parse(map.get(TRACKED_STORAGE_KEY) ?? "[]")).toEqual([sample]);
  });
});
