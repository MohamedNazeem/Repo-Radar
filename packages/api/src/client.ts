import type {
  GithubCommit,
  GithubRepo,
  GithubSearchResponse,
} from "./types.js";
import { GithubApiError } from "./types.js";

const GITHUB_API_BASE = "https://api.github.com";

export interface GithubClientOptions {
  /** Optional personal access token for higher rate limits. */
  token?: string;
  fetchImpl?: typeof fetch;
}

function parseHeaderInt(headers: Headers, name: string): number | null {
  const value = headers.get(name);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function githubFetch<T>(
  path: string,
  options: GithubClientOptions = {},
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetchImpl(`${GITHUB_API_BASE}${path}`, { headers });
  const remaining = parseHeaderInt(response.headers, "x-ratelimit-remaining");
  const reset = parseHeaderInt(response.headers, "x-ratelimit-reset");

  if (!response.ok) {
    let message = `GitHub API error (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }

    if (response.status === 403 && remaining === 0) {
      const resetDate = reset ? new Date(reset * 1000).toLocaleTimeString() : "later";
      message = `GitHub API rate limit exceeded. Try again after ${resetDate}, or set VITE_GITHUB_TOKEN.`;
    }

    throw new GithubApiError(message, response.status, remaining, reset);
  }

  return (await response.json()) as T;
}

export function createGithubClient(options: GithubClientOptions = {}) {
  return {
    async searchRepos(query: string, perPage = 10): Promise<GithubSearchResponse> {
      const trimmed = query.trim();
      if (!trimmed) {
        return { total_count: 0, incomplete_results: false, items: [] };
      }

      const params = new URLSearchParams({
        q: trimmed,
        sort: "stars",
        order: "desc",
        per_page: String(perPage),
      });

      return githubFetch<GithubSearchResponse>(
        `/search/repositories?${params.toString()}`,
        options,
      );
    },

    async getRepo(owner: string, repo: string): Promise<GithubRepo> {
      return githubFetch<GithubRepo>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        options,
      );
    },

    async getLatestCommitDate(
      owner: string,
      repo: string,
    ): Promise<string | null> {
      const commits = await githubFetch<GithubCommit[]>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=1`,
        options,
      );

      const latest = commits[0];
      if (!latest) return null;

      return (
        latest.commit.committer?.date ??
        latest.commit.author?.date ??
        null
      );
    },
  };
}

export type GithubClient = ReturnType<typeof createGithubClient>;
