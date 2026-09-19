import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material/styles";
import { StarsBarChart } from "@repo/plots";
import { EmptyState, PageHeader, RepoCard, intlLocales, useLocale } from "@repo/ui";
import {
  refreshRepo,
  selectStarsChartData,
  untrackRepo,
  useAppDispatch,
  useAppSelector,
} from "@repo/store";

export function TrackedPage() {
  const theme = useTheme();
  const { locale, t } = useLocale();
  const dispatch = useAppDispatch();
  const trackedRepos = useAppSelector((state) => state.tracked.repos);
  const chartData = useAppSelector(selectStarsChartData);
  const loadingIds = useAppSelector((state) => state.tracked.loadingIds);
  const errorById = useAppSelector((state) => state.tracked.errorById);
  const isRefreshingAll = loadingIds.length > 0;

  return (
    <>
      <PageHeader
        title={t("tracked.title")}
        subtitle={t("tracked.subtitle")}
        actions={
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            disabled={trackedRepos.length === 0 || isRefreshingAll}
            onClick={() => {
              trackedRepos.forEach((repo) => {
                void dispatch(refreshRepo(repo.id));
              });
            }}
          >
            {t("tracked.refreshAll")}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("tracked.chartHeading")}
        </Typography>
        <StarsBarChart
          data={chartData}
          barColor={theme.palette.primary.main}
          gridColor={theme.palette.divider}
          tickColor={theme.palette.text.secondary}
          locale={intlLocales[locale]}
          emptyLabel={t("plots.empty")}
          seriesName={t("plots.stars")}
        />
      </Paper>

      {trackedRepos.length === 0 ? (
        <EmptyState
          title={t("tracked.emptyTitle")}
          description={t("tracked.emptyDescription")}
        />
      ) : (
        <Grid container spacing={2}>
          {trackedRepos.map((repo) => (
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
                isLoading={loadingIds.includes(repo.id)}
                error={errorById[repo.id]}
                showRefresh
                onTrackToggle={() => dispatch(untrackRepo(repo.id))}
                onRefresh={() => {
                  void dispatch(refreshRepo(repo.id));
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
