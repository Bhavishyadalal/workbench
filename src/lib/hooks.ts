"use client";

import { useCallback, useEffect, useState } from "react";

const RECENTS_KEY = "wb:recents";
const FAVORITES_KEY = "wb:favorites";
const THEME_KEY = "wb:theme";
const SOUND_KEY = "wb:sound";
const TOUR_KEY = "wb:hasSeenTour";
const MAX_RECENTS = 5;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, feature is non-critical
  }
}

/** Track and read the last N tools visited, most-recent-first. */
export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(readJSON<string[]>(RECENTS_KEY, []));
  }, []);

  const track = useCallback((slug: string) => {
    setRecents((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_RECENTS);
      writeJSON(RECENTS_KEY, next);
      return next;
    });
  }, []);

  return { recents, track };
}

/** Star/pin tools, persisted to localStorage, synced across components via storage events. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readJSON<string[]>(FAVORITES_KEY, []));
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        setFavorites(readJSON<string[]>(FAVORITES_KEY, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      writeJSON(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  /** Move the favorite at `from` to index `to`, persisting the new order. */
  const reorder = useCallback((from: number, to: number) => {
    setFavorites((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      writeJSON(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  return { favorites, toggle, isFavorite, reorder };
}

export type Theme = "dark" | "light";

/** Theme is primarily set synchronously via an inline script in <head> to avoid FOUC;
 *  this hook just mirrors/updates that state after hydration. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setThemeState(current);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    writeJSON(THEME_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}

export const THEME_STORAGE_KEY = THEME_KEY;

/** Sound effects are OFF by default; persist the user's choice once they opt in. */
export function useSoundPref() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(readJSON<boolean>(SOUND_KEY, false));
    const onStorage = (e: StorageEvent) => {
      if (e.key === SOUND_KEY) setEnabled(readJSON<boolean>(SOUND_KEY, false));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      writeJSON(SOUND_KEY, next);
      return next;
    });
  }, []);

  return { enabled, toggle };
}

/** True exactly once, for a visitor who has never dismissed the onboarding tour. */
export function useFirstVisitTour() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!window.localStorage.getItem(TOUR_KEY)) setShouldShow(true);
    } catch {
      // storage unavailable — just skip the tour rather than crash
    }
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    try {
      window.localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // non-critical
    }
  }, []);

  return { shouldShow, dismiss };
}

/** Combines the sound preference with the actual players, muted by default. */
export function useSound() {
  const { enabled, toggle } = useSoundPref();

  const click = useCallback(() => {
    if (!enabled) return;
    import("@/lib/sound").then((m) => m.playClick());
  }, [enabled]);

  const chime = useCallback(() => {
    if (!enabled) return;
    import("@/lib/sound").then((m) => m.playChime());
  }, [enabled]);

  return { enabled, toggle, click, chime };
}
