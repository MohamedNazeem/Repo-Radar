import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SEARCH_INPUT_ID = "repo-search";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useAppKeyboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  const focusSearch = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/", { state: { focusSearch: true } });
      return;
    }
    document.getElementById(SEARCH_INPUT_ID)?.focus();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (shortcutsOpen) return;

      if (isTypingTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (event.key === "t" || event.key === "T") {
        event.preventDefault();
        navigate("/tracked");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusSearch, navigate, shortcutsOpen]);

  return { shortcutsOpen, closeShortcuts, focusSearch };
}

export { SEARCH_INPUT_ID };
