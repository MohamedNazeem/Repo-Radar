import { useId, useState, type KeyboardEvent, type MouseEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import { useLocale } from "./AppLocaleProvider.js";
import { LOCALES, localeLabels, type Locale } from "./locale.js";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const label = t("language.change");

  const handleOpen = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (next: Locale) => {
    setLocale(next);
    handleClose();
  };

  return (
    <>
      <Button
        color="primary"
        size="small"
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            handleOpen(event);
          }
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? menuId : undefined}
        startIcon={<TranslateOutlinedIcon />}
        endIcon={
          <KeyboardArrowDownIcon
            sx={{
              transition: "transform 0.2s ease",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        }
        sx={{
          minWidth: 0,
          ml: { xs: 0.5, sm: 3 },
          px: 1,
          fontWeight: 650,
          letterSpacing: "0.04em",
        }}
      >
        {locale.toUpperCase()}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { minWidth: 168, mt: 0.5 },
          },
          list: {
            "aria-label": label,
          },
        }}
      >
        {LOCALES.map((code) => {
          const selected = code === locale;
          return (
            <MenuItem
              key={code}
              role="menuitemradio"
              selected={selected}
              aria-checked={selected}
              onClick={() => handleSelect(code)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {selected ? <CheckIcon fontSize="small" color="primary" /> : null}
              </ListItemIcon>
              <ListItemText>{localeLabels[code]}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
