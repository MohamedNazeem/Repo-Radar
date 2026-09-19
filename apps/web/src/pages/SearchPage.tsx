import { useEffect } from "react";
import Grid from "@mui/material/Grid";
import {
  EmptyState,
  ErrorAlert,
  LoadingSkeleton,
  PageHeader,
  RepoCard,
  SearchInput,
  useLocale,
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
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const results = useAppSelector((state) => state.search.results);
  const loading = useAppSelector((state) => state.search.loading);
  const error = useAppSelector((state) => state.search.error);
  const trackedIds = useAppSelector((state) =>
    state.tracked.repos.map((repo) => repo.id),
  );
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    void dispatch(searchRepos(debouncedQuery));
  }, [debouncedQuery, dispatch]);

  return (
    <>
      <PageHeader
        title={t("search.title")}
        subtitle={t("search.subtitle")}
      />

      <SearchInput
        value={query}
        onChange={(value) => dispatch(setQuery(value))}
      />

      <div style={{ marginTop: 24 }}>
        {error ? <ErrorAlert message={t(error)} /> : null}

        {!query.trim() ? (
          <EmptyState
            title={t("search.emptyTitle")}
            description={t("search.emptyDescription")}
          />
        ) : null}

        {query.trim() && loading ? <LoadingSkeleton count={6} /> : null}

        {query.trim() &&
        !loading &&
        !error &&
        results.length === 0 &&
        debouncedQuery.trim() === query.trim() ? (
          <EmptyState
            title={t("search.noResultsTitle")}
            description={t("search.noResultsDescription")}
          />
        ) : null}

        {!loading && results.length > 0 ? (
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
