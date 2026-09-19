import { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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
import { SEARCH_INPUT_ID } from "../hooks/useAppKeyboard";

type SearchLocationState = {
  focusSearch?: boolean;
};

export function SearchPage() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = useAppSelector((state) => state.search.query);
  const results = useAppSelector((state) => state.search.results);
  const loading = useAppSelector((state) => state.search.loading);
  const error = useAppSelector((state) => state.search.error);
  const trackedIds = useAppSelector((state) =>
    state.tracked.repos.map((repo) => repo.id),
  );
  const debouncedQuery = useDebouncedValue(query, 400);
  const [trackedToast, setTrackedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    void dispatch(searchRepos(debouncedQuery));
  }, [debouncedQuery, dispatch]);

  useEffect(() => {
    const state = location.state as SearchLocationState | null;
    if (!state?.focusSearch) return;
    inputRef.current?.focus();
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  const statusMessage = !query.trim()
    ? ""
    : loading
      ? t("search.loadingStatus")
      : error
        ? t(error)
        : results.length === 0 && debouncedQuery.trim() === query.trim()
          ? t("search.noResultsTitle")
          : results.length > 0
            ? t("search.resultStatus", { count: results.length })
            : "";

  return (
    <>
      <PageHeader
        title={t("search.title")}
        subtitle={t("search.subtitle")}
      />

      <SearchInput
        id={SEARCH_INPUT_ID}
        ref={inputRef}
        value={query}
        onChange={(value) => dispatch(setQuery(value))}
      />

      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {statusMessage}
      </Box>

      <Box
        component="section"
        aria-labelledby="page-title"
        aria-busy={loading}
        sx={{ mt: 3 }}
      >
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
                    ownerLogin={repo.owner.login}
                    ownerAvatarUrl={repo.owner.avatar_url}
                    isTracked={isTracked}
                    onTrackToggle={() => {
                      if (isTracked) {
                        dispatch(untrackRepo(id));
                      } else {
                        void dispatch(trackRepo(repo));
                        setTrackedToast(repo.full_name);
                      }
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        ) : null}
      </Box>

      <Snackbar
        open={Boolean(trackedToast)}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setTrackedToast(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ alignItems: "center", width: "100%" }}
          action={
            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/tracked"
              onClick={() => setTrackedToast(null)}
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("search.viewTracked")}
            </Button>
          }
        >
          {trackedToast
            ? t("search.trackedToast", { name: trackedToast })
            : null}
        </Alert>
      </Snackbar>
    </>
  );
}
