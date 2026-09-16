import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { StarsBarChart } from "@repo/plots";
import { EmptyState, PageHeader, RepoCard } from "@repo/ui";
import {
  refreshAllTracked,
  refreshRepo,
  selectStarsChartData,
  selectTrackedRepos,
  untrackRepo,
  useAppDispatch,
  useAppSelector,
} from "@repo/store";

export function TrackedPage() {
  const dispatch = useAppDispatch();
  const trackedRepos = useAppSelector(selectTrackedRepos);
  const chartData = useAppSelector(selectStarsChartData);
  const statusById = useAppSelector((state) => state.tracked.statusById);
  const errorById = useAppSelector((state) => state.tracked.errorById);
  const isRefreshingAll = trackedRepos.some(
    (repo) => statusById[repo.id] === "loading",
  );

  return (
    <>
      <PageHeader
        title="Tracked repositories"
        subtitle="Monitor stars, open issues, and the latest commit for each favorite."
        actions={
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            disabled={trackedRepos.length === 0 || isRefreshingAll}
            onClick={() => {
              void dispatch(refreshAllTracked());
            }}
          >
            Refresh all
          </Button>
        }
      />

      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Stars by repository
        </Typography>
        <StarsBarChart data={chartData} />
      </Paper>

      {trackedRepos.length === 0 ? (
        <EmptyState
          title="No tracked repositories yet"
          description="Search for a repository and click Track to start monitoring it here."
        />
      ) : (
        <Grid container spacing={2}>
          {trackedRepos.map((repo) => {
            const status = statusById[repo.id] ?? "idle";
            return (
              <Grid key={repo.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <RepoCard
                  fullName={repo.fullName}
                  description={repo.description}
                  htmlUrl={repo.htmlUrl}
                  stars={repo.stars}
                  openIssues={repo.openIssues}
                  lastCommitDate={repo.lastCommitDate}
                  language={repo.language}
                  isTracked
                  isLoading={status === "loading"}
                  error={errorById[repo.id]}
                  showRefresh
                  onTrackToggle={() => dispatch(untrackRepo(repo.id))}
                  onRefresh={() => {
                    void dispatch(refreshRepo(repo.id));
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
}
