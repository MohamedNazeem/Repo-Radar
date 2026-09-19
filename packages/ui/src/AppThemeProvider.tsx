import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import type { PaletteMode } from "@mui/material/styles";
import { useLocale } from "./AppLocaleProvider.js";
import { createAppTheme } from "./theme.js";

const STORAGE_KEY = "github-repo-tracker:theme";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

function readStoredMode(): PaletteMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Ignore private-mode / blocked storage.
  }

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [mode, setMode] = useState<PaletteMode>(() => readStoredMode());

  const toggleColorMode = useCallback(() => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore quota / private-mode failures.
      }
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode, locale), [mode, locale]);
  const value = useMemo(
    () => ({ mode, toggleColorMode }),
    [mode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used inside AppThemeProvider");
  }
  return context;
}
