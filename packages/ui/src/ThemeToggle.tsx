import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useColorMode } from "./AppThemeProvider.js";

export function ThemeToggle() {
  const { mode, toggleColorMode } = useColorMode();
  const nextMode = mode === "light" ? "dark" : "light";

  return (
    <Tooltip title={`Switch to ${nextMode} mode`}>
      <IconButton
        color="primary"
        onClick={toggleColorMode}
        aria-label={`Switch to ${nextMode} mode`}
      >
        {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
