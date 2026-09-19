import { describe, expect, it } from "vitest";
import {
  mapGithubRepoToTracked,
  parseFullName,
  toRepoId,
} from "./mappers.js";
import type { GithubRepo } from "./types.js";

function makeRepo(overrides: Partial<GithubRepo> = {}): GithubRepo {
  return {
    id: 70107786,
    full_name: "vercel/next.js",
    name: "next.js",
    description: "The React Framework",
    html_url: "https://github.com/vercel/next.js",
    stargazers_count: 142345,
    open_issues_count: 3383,
    language: "JavaScript",
    owner: {
      login: "vercel",
      avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
      html_url: "https://github.com/vercel",
    },
    updated_at: "2026-01-01T00:00:00Z",
    pushed_at: "2026-01-01T00:00:00Z",
    default_branch: "canary",
    ...overrides,
  };
}

describe("toRepoId", () => {
  it("normalizes owner/name to lowercase", () => {
    expect(toRepoId("Vercel/Next.js")).toBe("vercel/next.js");
  });
});

describe("parseFullName", () => {
  it("splits a valid owner/repo pair", () => {
    expect(parseFullName("vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("rejects names that are not owner/repo", () => {
    expect(() => parseFullName("next.js")).toThrow(/Invalid repository full name/);
    expect(() => parseFullName("vercel/next.js/tree")).toThrow(
      /Invalid repository full name/,
    );
  });
});

describe("mapGithubRepoToTracked", () => {
  it("maps GitHub fields onto the persisted watchlist shape", () => {
    const tracked = mapGithubRepoToTracked(
      makeRepo(),
      "2026-09-16T17:46:39Z",
    );

    expect(tracked).toMatchObject({
      id: "vercel/next.js",
      githubId: 70107786,
      fullName: "vercel/next.js",
      name: "next.js",
      htmlUrl: "https://github.com/vercel/next.js",
      stars: 142345,
      openIssues: 3383,
      lastCommitDate: "2026-09-16T17:46:39Z",
      language: "JavaScript",
      ownerLogin: "vercel",
      ownerAvatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
    });
  });

  it("allows a missing last-commit date", () => {
    expect(mapGithubRepoToTracked(makeRepo()).lastCommitDate).toBeNull();
  });
});
