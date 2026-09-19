import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useColorMode } from "./AppThemeProvider.js";
import { useLocale } from "./AppLocaleProvider.js";

export function ThemeToggle() {
  const { mode, toggleColorMode } = useColorMode();
  const { t } = useLocale();
  const nextMode = mode === "light" ? "dark" : "light";
  const label =
    nextMode === "dark" ? t("theme.switchToDark") : t("theme.switchToLight");

  return (
    <Tooltip title={label}>
      <IconButton
        color="primary"
        onClick={toggleColorMode}
        aria-label={label}
      >
        {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
