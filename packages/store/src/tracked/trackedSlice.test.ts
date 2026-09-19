import { configureStore } from "@reduxjs/toolkit";
import type { GithubRepo } from "@repo/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  refreshRepo,
  selectStarsChartData,
  trackRepo,
  trackedReducer,
  untrackRepo,
} from "./trackedSlice.js";

const { getLatestCommitDateMock, getRepoMock } = vi.hoisted(() => ({
  getLatestCommitDateMock: vi.fn(),
  getRepoMock: vi.fn(),
}));

vi.mock("../githubClient.js", () => ({
  getGithubClient: () => ({
    searchRepos: vi.fn(),
    getRepo: getRepoMock,
    getLatestCommitDate: getLatestCommitDateMock,
  }),
}));

function makeRepo(fullName: string): GithubRepo {
  const [owner = "org", name = fullName] = fullName.split("/");
  return {
    id: 42,
    full_name: fullName,
    name,
    description: "A repo",
    html_url: `https://github.com/${fullName}`,
    stargazers_count: 10,
    open_issues_count: 2,
    language: "TypeScript",
    owner: {
      login: owner,
      avatar_url: "https://example.com/avatar.png",
      html_url: `https://github.com/${owner}`,
    },
    updated_at: "2026-01-01T00:00:00Z",
    pushed_at: "2026-01-01T00:00:00Z",
    default_branch: "main",
  };
}

function makeStore() {
  return configureStore({ reducer: { tracked: trackedReducer } });
}

describe("tracked slice", () => {
  beforeEach(() => {
    getLatestCommitDateMock.mockReset();
    getRepoMock.mockReset();
  });

  it("optimistically adds a repo, then fills in the last commit", async () => {
    getLatestCommitDateMock.mockResolvedValue("2026-09-18T00:00:00Z");
    const store = makeStore();
    const repo = makeRepo("vitejs/vite");

    const pending = store.dispatch(trackRepo(repo));
    expect(store.getState().tracked.repos).toHaveLength(1);
    expect(store.getState().tracked.repos[0]?.lastCommitDate).toBeNull();
    expect(store.getState().tracked.loadingIds).toContain("vitejs/vite");

    await pending;

    expect(store.getState().tracked.repos[0]?.lastCommitDate).toBe(
      "2026-09-18T00:00:00Z",
    );
    expect(store.getState().tracked.loadingIds).toEqual([]);
  });

  it("still tracks when the commit lookup fails", async () => {
    getLatestCommitDateMock.mockRejectedValue(new Error("timeout"));
    const store = makeStore();

    await store.dispatch(trackRepo(makeRepo("vitejs/vite")));

    expect(store.getState().tracked.repos).toHaveLength(1);
    expect(store.getState().tracked.repos[0]?.lastCommitDate).toBeNull();
    expect(store.getState().tracked.errorById).toEqual({});
  });

  it("untracks by id and drops per-id error state", async () => {
    getLatestCommitDateMock.mockResolvedValue(null);
    const store = makeStore();
    await store.dispatch(trackRepo(makeRepo("vitejs/vite")));

    store.dispatch(untrackRepo("vitejs/vite"));

    expect(store.getState().tracked.repos).toEqual([]);
  });

  it("rejects a refresh for a repo that is not tracked", async () => {
    const store = makeStore();
    const result = await store.dispatch(refreshRepo("missing/repo"));

    expect(result.type).toBe("tracked/refreshRepo/rejected");
    expect(store.getState().tracked.errorById["missing/repo"]).toBe(
      "errors.notTracked",
    );
  });

  it("maps tracked repos into chart rows", async () => {
    getLatestCommitDateMock.mockResolvedValue(null);
    const store = makeStore();
    await store.dispatch(trackRepo(makeRepo("vitejs/vite")));

    expect(selectStarsChartData(store.getState())).toEqual([
      { label: "vitejs/vite", stars: 10 },
    ]);
  });
});
