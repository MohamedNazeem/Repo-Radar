import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { LanguageToggle, ThemeToggle, useLocale } from "@repo/ui";

const navItems = [
  { key: "nav.search", to: "/" },
  { key: "nav.tracked", to: "/tracked" },
] as const;

export function AppLayout() {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <AppBar
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
            sx={{
              flexGrow: 1,
              minWidth: 0,
              fontWeight: 700,
              color: "primary.main",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t("app.title")}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
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

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
