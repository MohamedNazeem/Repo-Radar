import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "@mui/material/Link";
import { useLocale } from "./AppLocaleProvider.js";
import { intlLocales } from "./locale.js";

export interface RepoCardProps {
  fullName: string;
  description?: string | null;
  htmlUrl: string;
  stars: number;
  openIssues: number;
  lastCommitDate?: string | null;
  language?: string | null;
  ownerLogin?: string | null;
  ownerAvatarUrl?: string | null;
  isTracked: boolean;
  isLoading?: boolean;
  error?: string | null;
  showRefresh?: boolean;
  onTrackToggle: () => void;
  onRefresh?: () => void;
}

function formatDate(value: string | null | undefined, locale: string, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ownerInitial(ownerLogin: string | null | undefined, fullName: string): string {
  const source = ownerLogin?.trim() || fullName.split("/")[0] || fullName;
  return source.slice(0, 1).toUpperCase();
}

export function RepoCard({
  fullName,
  description,
  htmlUrl,
  stars,
  openIssues,
  lastCommitDate,
  language,
  ownerLogin,
  ownerAvatarUrl,
  isTracked,
  isLoading = false,
  error = null,
  showRefresh = false,
  onTrackToggle,
  onRefresh,
}: RepoCardProps) {
  const { locale, t } = useLocale();
  const intlLocale = intlLocales[locale];
  const avatarName = ownerLogin?.trim() || fullName.split("/")[0] || fullName;

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Avatar
              src={ownerAvatarUrl || undefined}
              alt={t("repoCard.ownerAvatar", { name: avatarName })}
              sx={{ width: 40, height: 40, flexShrink: 0 }}
            >
              {ownerInitial(ownerLogin, fullName)}
            </Avatar>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Link
                href={htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                variant="h6"
                color="inherit"
                sx={{ fontWeight: 650, minWidth: 0, overflowWrap: "break-word" }}
              >
                {fullName}
              </Link>
              {isLoading ? <CircularProgress size={20} sx={{ flexShrink: 0 }} /> : null}
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {description || t("repoCard.noDescription")}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              icon={<StarBorderIcon />}
              label={t("repoCard.stars", { count: stars })}
            />
            <Chip
              size="small"
              icon={<BugReportOutlinedIcon />}
              label={t("repoCard.openIssues", { count: openIssues })}
            />
            {lastCommitDate != null || showRefresh ? (
              <Chip
                size="small"
                icon={<UpdateOutlinedIcon />}
                label={t("repoCard.lastCommit", {
                  date: formatDate(lastCommitDate, intlLocale, t("repoCard.dateUnavailable")),
                })}
              />
            ) : null}
            {language ? <Chip size="small" label={language} variant="outlined" /> : null}
          </Stack>

          {error ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {t(error)}
            </Alert>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          variant={isTracked ? "outlined" : "contained"}
          startIcon={isTracked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          onClick={onTrackToggle}
          disabled={isLoading && !isTracked}
        >
          {isTracked ? t("repoCard.untrack") : t("repoCard.track")}
        </Button>
        {showRefresh && onRefresh ? (
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            {t("repoCard.refresh")}
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}
