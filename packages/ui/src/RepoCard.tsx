import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "@mui/material/Link";

export interface RepoCardProps {
  fullName: string;
  description?: string | null;
  htmlUrl: string;
  stars: number;
  openIssues: number;
  lastCommitDate?: string | null;
  language?: string | null;
  isTracked: boolean;
  isLoading?: boolean;
  error?: string | null;
  showRefresh?: boolean;
  onTrackToggle: () => void;
  onRefresh?: () => void;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RepoCard({
  fullName,
  description,
  htmlUrl,
  stars,
  openIssues,
  lastCommitDate,
  language,
  isTracked,
  isLoading = false,
  error = null,
  showRefresh = false,
  onTrackToggle,
  onRefresh,
}: RepoCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Link
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              variant="h6"
              color="inherit"
              sx={{ fontWeight: 650 }}
            >
              {fullName}
            </Link>
            {isLoading ? <CircularProgress size={20} /> : null}
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {description || "No description provided."}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              icon={<StarBorderIcon />}
              label={`${stars.toLocaleString()} stars`}
            />
            <Chip
              size="small"
              icon={<BugReportOutlinedIcon />}
              label={`${openIssues.toLocaleString()} open issues`}
            />
            <Chip
              size="small"
              icon={<UpdateOutlinedIcon />}
              label={`Last commit ${formatDate(lastCommitDate)}`}
            />
            {language ? <Chip size="small" label={language} variant="outlined" /> : null}
          </Stack>

          {error ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
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
          {isTracked ? "Untrack" : "Track"}
        </Button>
        {showRefresh && onRefresh ? (
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}
