import { useEffect } from "react";
import Grid from "@mui/material/Grid";
import {
  EmptyState,
  ErrorAlert,
  LoadingSkeleton,
  PageHeader,
  RepoCard,
  SearchInput,
} from "@repo/ui";
import {
  searchRepos,
  setQuery,
  trackRepo,
  untrackRepo,
  useAppDispatch,
  useAppSelector,
} from "@repo/store";
import { toRepoId } from "@repo/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export function SearchPage() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const results = useAppSelector((state) => state.search.results);
  const status = useAppSelector((state) => state.search.status);
  const error = useAppSelector((state) => state.search.error);
  const trackedIds = useAppSelector((state) => state.tracked.ids);
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    void dispatch(searchRepos(debouncedQuery));
  }, [debouncedQuery, dispatch]);

  return (
    <>
      <PageHeader
        title="Search repositories"
        subtitle="Find GitHub projects and track the ones you want to monitor."
      />

      <SearchInput
        value={query}
        onChange={(value) => dispatch(setQuery(value))}
      />

      <div style={{ marginTop: 24 }}>
        {error ? <ErrorAlert message={error} /> : null}

        {!query.trim() ? (
          <EmptyState
            title="Start typing to search"
            description="Results appear after a short debounce so GitHub is not hammered on every keystroke."
          />
        ) : null}

        {query.trim() && status === "loading" ? <LoadingSkeleton count={6} /> : null}

        {query.trim() && status === "succeeded" && results.length === 0 ? (
          <EmptyState
            title="No repositories found"
            description="Try a different keyword or a more specific owner/name query."
          />
        ) : null}

        {status === "succeeded" && results.length > 0 ? (
          <Grid container spacing={2}>
            {results.map((repo) => {
              const id = toRepoId(repo.full_name);
              const isTracked = trackedIds.includes(id);
              return (
                <Grid key={repo.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <RepoCard
                    fullName={repo.full_name}
                    description={repo.description}
                    htmlUrl={repo.html_url}
                    stars={repo.stargazers_count}
                    openIssues={repo.open_issues_count}
                    lastCommitDate={null}
                    language={repo.language}
                    isTracked={isTracked}
                    onTrackToggle={() => {
                      if (isTracked) {
                        dispatch(untrackRepo(id));
                      } else {
                        void dispatch(trackRepo(repo));
                      }
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        ) : null}
      </div>
    </>
  );
}
