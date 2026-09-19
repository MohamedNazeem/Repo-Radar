import { describe, expect, it, vi } from "vitest";
import { createGithubClient } from "./client.js";
import { GithubApiError } from "./types.js";

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

describe("createGithubClient", () => {
  it("does not hit the network for a blank search", async () => {
    const fetchImpl = vi.fn();
    const client = createGithubClient({ fetchImpl });

    const result = await client.searchRepos("   ");

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toEqual({
      total_count: 0,
      incomplete_results: false,
      items: [],
    });
  });

  it("searches repositories by stars with the tracker User-Agent", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/search/repositories?");
      expect(String(input)).toContain("q=vite");
      expect(String(input)).toContain("sort=stars");
      expect(init?.headers).toMatchObject({
        Accept: "application/vnd.github+json",
        "User-Agent": "github-repo-tracker",
      });
      expect(
        (init?.headers as Record<string, string>).Authorization,
      ).toBeUndefined();

      return jsonResponse({
        total_count: 1,
        incomplete_results: false,
        items: [{ id: 1, full_name: "vitejs/vite" }],
      });
    });

    const client = createGithubClient({ fetchImpl });
    const result = await client.searchRepos("vite");

    expect(result.total_count).toBe(1);
    expect(result.items[0]?.full_name).toBe("vitejs/vite");
  });

  it("sends a bearer token when one is configured", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>).Authorization).toBe(
        "Bearer ghp_test",
      );
      return jsonResponse({
        id: 1,
        full_name: "vitejs/vite",
        owner: { login: "vitejs" },
      });
    });

    const client = createGithubClient({ fetchImpl, token: "ghp_test" });
    await client.getRepo("vitejs", "vite");

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("maps a GitHub 404 body onto GithubApiError", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ message: "Not Found" }, { status: 404 }),
    );
    const client = createGithubClient({ fetchImpl });

    await expect(client.getRepo("nope", "missing")).rejects.toMatchObject({
      name: "GithubApiError",
      message: "Not Found",
      status: 404,
    } satisfies Partial<GithubApiError>);
  });

  it("explains an exhausted rate limit", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        { message: "API rate limit exceeded" },
        {
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": "1710000000",
          },
        },
      ),
    );
    const client = createGithubClient({ fetchImpl });

    await expect(client.searchRepos("react")).rejects.toThrow(
      /rate limit exceeded.*VITE_GITHUB_TOKEN/i,
    );
  });

  it("prefers the committer date for the latest commit", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        {
          sha: "abc",
          commit: {
            author: { name: "A", email: "a@x", date: "2026-01-01T00:00:00Z" },
            committer: { name: "C", email: "c@x", date: "2026-02-02T00:00:00Z" },
            message: "ship it",
          },
        },
      ]),
    );
    const client = createGithubClient({ fetchImpl });

    await expect(client.getLatestCommitDate("vitejs", "vite")).resolves.toBe(
      "2026-02-02T00:00:00Z",
    );
  });

  it("returns null when a repo has no commits", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([]));
    const client = createGithubClient({ fetchImpl });

    await expect(client.getLatestCommitDate("empty", "repo")).resolves.toBeNull();
  });
});
