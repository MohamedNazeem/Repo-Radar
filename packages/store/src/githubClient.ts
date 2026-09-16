import { createGithubClient, type GithubClientOptions } from "@repo/api";

let clientOptions: GithubClientOptions = {};

export function configureGithubClient(options: GithubClientOptions): void {
  clientOptions = options;
}

export function getGithubClient() {
  return createGithubClient(clientOptions);
}
