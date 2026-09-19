import { configureStore } from "@reduxjs/toolkit";
import type { GithubRepo } from "@repo/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchReducer, searchRepos, setQuery } from "./searchSlice.js";

const { searchReposMock } = vi.hoisted(() => ({
  searchReposMock: vi.fn(),
}));

vi.mock("../githubClient.js", () => ({
  getGithubClient: () => ({
    searchRepos: searchReposMock,
    getRepo: vi.fn(),
    getLatestCommitDate: vi.fn(),
  }),
}));

function makeRepo(fullName: string): GithubRepo {
  const [owner = "org", name = fullName] = fullName.split("/");
  return {
    id: fullName.length,
    full_name: fullName,
    name,
    description: null,
    html_url: `https://github.com/${fullName}`,
    stargazers_count: 1,
    open_issues_count: 0,
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
  return configureStore({ reducer: { search: searchReducer } });
}

describe("search slice", () => {
  beforeEach(() => {
    searchReposMock.mockReset();
  });

  it("does not fetch a blank query", async () => {
    const store = makeStore();
    store.dispatch(setQuery("   "));
    await store.dispatch(searchRepos("   "));

    expect(searchReposMock).not.toHaveBeenCalled();
    expect(store.getState().search.loading).toBe(false);
  });

  it("stores hits and remembers the fetched query", async () => {
    const repo = makeRepo("vitejs/vite");
    searchReposMock.mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [repo],
    });

    const store = makeStore();
    store.dispatch(setQuery("vite"));
    await store.dispatch(searchRepos("vite"));

    expect(store.getState().search.results).toEqual([repo]);
    expect(store.getState().search.lastFetchedQuery).toBe("vite");
    expect(store.getState().search.loading).toBe(false);
  });

  it("skips a second fetch for the same trimmed query", async () => {
    searchReposMock.mockResolvedValue({
      total_count: 0,
      incomplete_results: false,
      items: [],
    });

    const store = makeStore();
    store.dispatch(setQuery("vite"));
    await store.dispatch(searchRepos("vite"));
    await store.dispatch(searchRepos("vite"));

    expect(searchReposMock).toHaveBeenCalledOnce();
  });

  it("drops a stale response so a slower search cannot overwrite a newer one", async () => {
    const reactRepo = makeRepo("react/react");
    const vueRepo = makeRepo("vuejs/vue");
    let resolveReact: ((value: unknown) => void) | undefined;

    searchReposMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveReact = resolve;
          }),
      )
      .mockResolvedValueOnce({
        total_count: 1,
        incomplete_results: false,
        items: [vueRepo],
      });

    const store = makeStore();
    store.dispatch(setQuery("react"));
    const reactRequest = store.dispatch(searchRepos("react"));

    store.dispatch(setQuery("vue"));
    await store.dispatch(searchRepos("vue"));
    expect(store.getState().search.results).toEqual([vueRepo]);

    resolveReact?.({
      total_count: 1,
      incomplete_results: false,
      items: [reactRepo],
    });
    await reactRequest;

    expect(store.getState().search.results).toEqual([vueRepo]);
    expect(store.getState().search.lastFetchedQuery).toBe("vue");
  });

  it("clears hits when the query is emptied", () => {
    const store = makeStore();
    store.dispatch(setQuery("vite"));
    store.dispatch({
      type: searchRepos.fulfilled.type,
      payload: [makeRepo("vitejs/vite")],
      meta: { arg: "vite" },
    });

    store.dispatch(setQuery(""));

    expect(store.getState().search.results).toEqual([]);
    expect(store.getState().search.lastFetchedQuery).toBeNull();
    expect(store.getState().search.loading).toBe(false);
  });

  it("surfaces a catalog key when search fails", async () => {
    searchReposMock.mockRejectedValue(new Error("network down"));

    const store = makeStore();
    store.dispatch(setQuery("vite"));
    await store.dispatch(searchRepos("vite"));

    expect(store.getState().search.error).toBe("network down");
    expect(store.getState().search.results).toEqual([]);
  });
});
