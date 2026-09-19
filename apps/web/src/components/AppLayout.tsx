import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
  KeyboardShortcutsDialog,
  LanguageToggle,
  MAIN_CONTENT_ID,
  SkipLink,
  ThemeToggle,
  useLocale,
} from "@repo/ui";
import { useAppKeyboard } from "../hooks/useAppKeyboard";

const navItems = [
  { key: "nav.search", to: "/" },
  { key: "nav.tracked", to: "/tracked" },
] as const;

export function AppLayout() {
  const location = useLocation();
  const { t } = useLocale();
  const { shortcutsOpen, closeShortcuts } = useAppKeyboard();

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <SkipLink />
      <AppBar
        component="header"
        position="sticky"
        color="transparent"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backdropFilter: "blur(10px)",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, overflowX: "hidden", minWidth: 0 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              fontWeight: 700,
              color: "primary.main",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            {t("app.title")}
          </Typography>
          <Stack
            component="nav"
            aria-label={t("a11y.navLabel")}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            {navItems.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  variant={active ? "contained" : "text"}
                  color="primary"
                  aria-current={active ? "page" : undefined}
                >
                  {t(item.key)}
                </Button>
              );
            })}
            <LanguageToggle />
            <ThemeToggle />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        maxWidth="lg"
        sx={{ pt: 4, outline: "none", "&:focus, &:focus-visible": { outline: "none" } }}
      >
        <Outlet />
      </Container>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={closeShortcuts} />
    </Box>
  );
}
