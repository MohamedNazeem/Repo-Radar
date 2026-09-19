import { useState } from "react";
import Box from "@mui/material/Box";
import { useLocale } from "./AppLocaleProvider.js";

const MAIN_CONTENT_ID = "main-content";

const visibleSx = {
  width: "auto",
  height: "auto",
  px: 2,
  py: 1,
  margin: 0,
  clipPath: "none",
  overflow: "visible",
  outline: "2px solid",
  outlineColor: "primary.contrastText",
  outlineOffset: 2,
} as const;

export function SkipLink() {
  const { t } = useLocale();
  const [focused, setFocused] = useState(false);

  return (
    <Box
      component="a"
      href={`#${MAIN_CONTENT_ID}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      sx={{
        position: "fixed",
        left: 16,
        top: 16,
        zIndex: 4000,
        borderRadius: 1,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontWeight: 650,
        textDecoration: "none",
        whiteSpace: "nowrap",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        border: 0,
        "&:focus, &:focus-visible": visibleSx,
        ...(focused ? visibleSx : {}),
      }}
    >
      {t("a11y.skipToMain")}
    </Box>
  );
}

export { MAIN_CONTENT_ID };
