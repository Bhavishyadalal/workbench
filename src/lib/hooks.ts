"use client";

import { useCallback, useEffect, useState } from "react";

const RECENTS_KEY = "wb:recents";
const FAVORITES_KEY = "wb:favorites";
const THEME_KEY = "wb:theme";
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

  return { favorites, toggle, isFavorite };
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
