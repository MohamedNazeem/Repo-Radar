import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import type { ChangeEvent } from "react";
import { useLocale } from "./AppLocaleProvider.js";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchInputProps) {
  const { t } = useLocale();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      fullWidth
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? t("search.placeholder")}
      disabled={disabled}
      size="medium"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}
