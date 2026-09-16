export interface GithubRepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

/** Subset of GitHub repository fields used by the app. */
export interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  language: string | null;
  owner: GithubRepoOwner;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}

export interface GithubCommit {
  sha: string;
  commit: {
    author: { name: string; email: string; date: string } | null;
    committer: { name: string; email: string; date: string } | null;
    message: string;
  };
}

/** Normalized repo entity stored in app state. */
export interface TrackedRepo {
  id: string;
  githubId: number;
  fullName: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  openIssues: number;
  lastCommitDate: string | null;
  language: string | null;
  ownerLogin: string;
  ownerAvatarUrl: string;
}

export class GithubApiError extends Error {
  readonly status: number;
  readonly rateLimitRemaining: number | null;
  readonly rateLimitReset: number | null;

  constructor(
    message: string,
    status: number,
    rateLimitRemaining: number | null = null,
    rateLimitReset: number | null = null,
  ) {
    super(message);
    this.name = "GithubApiError";
    this.status = status;
    this.rateLimitRemaining = rateLimitRemaining;
    this.rateLimitReset = rateLimitReset;
  }
}
