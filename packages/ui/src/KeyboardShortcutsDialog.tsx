import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useLocale } from "./AppLocaleProvider.js";

export interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["/"], descriptionKey: "a11y.shortcutSearch" },
  { keys: ["t"], descriptionKey: "a11y.shortcutTracked" },
  { keys: ["?"], descriptionKey: "a11y.shortcutHelp" },
  { keys: ["Esc"], descriptionKey: "a11y.shortcutEscape" },
] as const;

function Kbd({ children }: { children: string }) {
  return (
    <Box
      component="kbd"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
        px: 0.75,
        py: 0.25,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 650,
        bgcolor: "action.hover",
      }}
    >
      {children}
    </Box>
  );
}

export function KeyboardShortcutsDialog({
  open,
  onClose,
}: KeyboardShortcutsDialogProps) {
  const { t } = useLocale();
  const titleId = "keyboard-shortcuts-title";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id={titleId}>{t("a11y.shortcutsTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} component="ul" sx={{ listStyle: "none", m: 0, px: 0, pb: 1 }}>
          {SHORTCUTS.map((shortcut) => (
            <Stack
              key={shortcut.descriptionKey}
              component="li"
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2">{t(shortcut.descriptionKey)}</Typography>
              <Stack direction="row" spacing={0.5} component="span">
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("a11y.shortcutsClose")}</Button>
      </DialogActions>
    </Dialog>
  );
}
