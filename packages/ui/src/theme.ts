import { deDE, enUS } from "@mui/material/locale";
import { createTheme, type PaletteMode, type Theme } from "@mui/material/styles";
import type { Locale } from "./locale.js";

const shared = {
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 650,
    },
  },
  shape: {
    borderRadius: 10,
  },
} as const;

const muiLocales = {
  en: enUS,
  de: deDE,
} as const;

export function createAppTheme(mode: PaletteMode, locale: Locale = "en"): Theme {
  const isDark = mode === "dark";
  const focusColor = isDark ? "#7eb6d4" : "#0b3d5c";

  return createTheme(
    {
      ...shared,
      palette: {
        mode,
        primary: {
          main: focusColor,
        },
        secondary: {
          main: isDark ? "#e08a5a" : "#c45c26",
        },
        background: {
          default: isDark ? "#0f1720" : "#f3f6f9",
          paper: isDark ? "#16202a" : "#ffffff",
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            ":focus-visible": {
              outline: `2px solid ${focusColor}`,
              outlineOffset: 2,
            },
          },
        },
        MuiButtonBase: {
          styleOverrides: {
            root: {
              "&.Mui-focusVisible": {
                outline: `2px solid ${focusColor}`,
                outlineOffset: 2,
              },
            },
          },
        },
      },
    },
    muiLocales[locale],
  );
}

export const appTheme = createAppTheme("light");
