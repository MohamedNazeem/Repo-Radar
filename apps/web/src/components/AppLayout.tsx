import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { label: "Search", to: "/" },
  { label: "Tracked", to: "/tracked" },
] as const;

export function AppLayout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: 1, borderColor: "divider", backdropFilter: "blur(10px)", bgcolor: "rgba(243,246,249,0.85)" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: "primary.main" }}>
            GitHub Repo Tracker
          </Typography>
          <Stack direction="row" spacing={1}>
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
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
