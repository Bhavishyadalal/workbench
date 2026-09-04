"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, Star, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { tools, categoryMeta } from "@/lib/tools-registry";
import { useFavorites, useRecentTools } from "@/lib/hooks";

interface PaletteContextValue {
  open: () => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function usePalette() {
  const ctx = useContext(PaletteContext);
  return ctx ?? { open: () => {} };
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { favorites } = useFavorites();
  const { recents } = useRecentTools();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      // slight delay so the entrance animation doesn't jank on autofocus
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // no query: show favorites then recents then everything else, deduped
      const seen = new Set<string>();
      const ordered: typeof tools = [];
      for (const slug of favorites) {
        const t = tools.find((x) => x.slug === slug);
        if (t && !seen.has(t.slug)) {
          ordered.push(t);
          seen.add(t.slug);
        }
      }
      for (const slug of recents) {
        const t = tools.find((x) => x.slug === slug);
        if (t && !seen.has(t.slug)) {
          ordered.push(t);
          seen.add(t.slug);
        }
      }
      for (const t of tools) {
        if (!seen.has(t.slug)) {
          ordered.push(t);
          seen.add(t.slug);
        }
      }
      return ordered.slice(0, 40);
    }
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        categoryMeta[t.category].label.toLowerCase().includes(q)
    );
  }, [query, favorites, recents]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const goTo = useCallback(
    (slug: string) => {
      router.push(`/tools/${slug}`);
      close();
    },
    [router, close]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) goTo(target.slug);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, activeIndex, goTo]);

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
              className="palette-backdrop fixed inset-0 bg-black/50 z-[90]"
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-[91] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center gap-3 px-4 border-b border-[var(--border-soft)]">
                <Search size={16} className="text-[var(--text-dim)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump to a tool…"
                  className="flex-1 bg-transparent py-3.5 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none"
                />
                <kbd className="hidden sm:inline-flex">esc</kbd>
              </div>

              <div className="max-h-[52vh] overflow-y-auto py-2">
                {results.length === 0 && (
                  <p className="px-4 py-6 text-sm text-[var(--text-dim)] text-center">
                    No tools match &ldquo;{query}&rdquo;.
                  </p>
                )}
                {results.map((t, i) => {
                  const meta = categoryMeta[t.category];
                  const isFav = favorites.includes(t.slug);
                  const isRecent = !query.trim() && !isFav && recents.includes(t.slug);
                  const active = i === activeIndex;
                  return (
                    <button
                      key={t.slug}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goTo(t.slug)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        active ? "bg-[var(--bg-elevated)]" : ""
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 shrink-0 rounded-full"
                        style={{ background: meta.accent }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-[var(--text)] font-medium truncate">
                          {t.name}
                        </span>
                        <span className="block text-xs text-[var(--text-dim)] truncate">
                          {t.short}
                        </span>
                      </span>
                      {isFav && <Star size={13} className="shrink-0 text-[var(--accent)]" fill="var(--accent)" />}
                      {isRecent && <Clock size={13} className="shrink-0 text-[var(--text-dim)]" />}
                      {active && <CornerDownLeft size={13} className="shrink-0 text-[var(--text-dim)]" />}
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border-soft)] text-[11px] text-[var(--text-dim)]">
                <span className="flex items-center gap-1">
                  <ArrowUp size={11} /><ArrowDown size={11} /> navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={11} /> open
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <kbd>⌘K</kbd> toggle
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PaletteContext.Provider>
  );
}
