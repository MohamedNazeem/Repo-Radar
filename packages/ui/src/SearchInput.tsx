import { forwardRef, type ChangeEvent, type KeyboardEvent } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useLocale } from "./AppLocaleProvider.js";

export interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { id = "repo-search", value, onChange, placeholder, disabled = false },
    ref,
  ) {
    const { t } = useLocale();
    const label = t("search.label");

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Escape") return;
      if (value) {
        event.preventDefault();
        onChange("");
        return;
      }
      event.currentTarget.blur();
    };

    return (
      <TextField
        id={id}
        inputRef={ref}
        fullWidth
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        label={label}
        placeholder={placeholder ?? t("search.placeholder")}
        disabled={disabled}
        size="medium"
        helperText={t("search.shortcutHint")}
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" aria-hidden />
              </InputAdornment>
            ),
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t("search.clear")}
                  onClick={() => onChange("")}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : (
              <InputAdornment position="end">
                <Box
                  component="kbd"
                  aria-hidden
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 24,
                    px: 0.75,
                    py: 0.15,
                    mr: 0.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    fontSize: 12,
                    fontWeight: 650,
                    color: "text.secondary",
                    bgcolor: "action.hover",
                  }}
                >
                  /
                </Box>
              </InputAdornment>
            ),
            sx: {
              '& input[type="search"]::-webkit-search-cancel-button': {
                WebkitAppearance: "none",
              },
            },
          },
          htmlInput: {
            "aria-keyshortcuts": "/",
          },
        }}
      />
    );
  },
);
