import type { GithubRepo, TrackedRepo } from "./types.js";

export function toRepoId(fullName: string): string {
  return fullName.toLowerCase();
}

export function mapGithubRepoToTracked(
  repo: GithubRepo,
  lastCommitDate: string | null = null,
): TrackedRepo {
  return {
    id: toRepoId(repo.full_name),
    githubId: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    stars: repo.stargazers_count,
    openIssues: repo.open_issues_count,
    lastCommitDate,
    language: repo.language,
    ownerLogin: repo.owner.login,
    ownerAvatarUrl: repo.owner.avatar_url,
  };
}

export function parseFullName(fullName: string): { owner: string; repo: string } {
  const [owner, repo, ...rest] = fullName.split("/");
  if (!owner || !repo || rest.length > 0) {
    throw new Error(`Invalid repository full name: ${fullName}`);
  }
  return { owner, repo };
}
