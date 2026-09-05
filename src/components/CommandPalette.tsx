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
import {
  Search,
  CornerDownLeft,
  Star,
  Clock,
  ArrowUp,
  ArrowDown,
  Hash,
} from "lucide-react";
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

type GroupLabel = "Pinned" | "Recent" | "All tools";

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
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

  // ⌘K / Ctrl+K
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
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // Build grouped results
  const { flat, groups } = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const matched = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.short.toLowerCase().includes(q) ||
          categoryMeta[t.category].label.toLowerCase().includes(q)
      );
      return { flat: matched, groups: null };
    }

    // No query — build groups
    const seen = new Set<string>();
    const pinned: typeof tools = [];
    const recent: typeof tools = [];
    const rest: typeof tools = [];

    for (const slug of favorites) {
      const t = tools.find((x) => x.slug === slug);
      if (t && !seen.has(t.slug)) { pinned.push(t); seen.add(t.slug); }
    }
    for (const slug of recents) {
      const t = tools.find((x) => x.slug === slug);
      if (t && !seen.has(t.slug)) { recent.push(t); seen.add(t.slug); }
    }
    for (const t of tools) {
      if (!seen.has(t.slug)) { rest.push(t); seen.add(t.slug); }
    }

    const g: { label: GroupLabel; items: typeof tools }[] = [];
    if (pinned.length) g.push({ label: "Pinned", items: pinned });
    if (recent.length) g.push({ label: "Recent", items: recent.slice(0, 5) });
    g.push({ label: "All tools", items: rest.slice(0, 30) });

    const flatAll = [...pinned, ...recent.slice(0, 5), ...rest.slice(0, 30)];
    return { flat: flatAll, groups: g };
  }, [query, favorites, recents]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

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
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flat[activeIndex];
        if (target) goTo(target.slug);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, flat, activeIndex, goTo]);

  const renderItem = (
    t: (typeof tools)[number],
    i: number,
    active: boolean,
    meta: (typeof categoryMeta)[keyof typeof categoryMeta]
  ) => {
    const isFav = favorites.includes(t.slug);
    const isRecent = !query.trim() && !isFav && recents.includes(t.slug);
    return (
      <button
        key={t.slug}
        ref={active ? activeRef : undefined}
        onMouseEnter={() => setActiveIndex(i)}
        onClick={() => goTo(t.slug)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
          active
            ? "bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg-elevated))]"
            : "hover:bg-[var(--bg-elevated)]"
        }`}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${meta.accent} 14%, var(--bg))`,
            border: `1px solid color-mix(in srgb, ${meta.accent} 25%, var(--border))`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: meta.accent }}
          />
        </div>

        <span className="flex-1 min-w-0">
          <span className="block text-sm text-[var(--text)] font-medium truncate">
            {t.name}
          </span>
          <span className="block text-xs text-[var(--text-dim)] truncate">
            {t.short}
          </span>
        </span>

        <span className="flex items-center gap-1.5 shrink-0">
          {isFav && (
            <Star size={12} className="text-[var(--accent)]" fill="var(--accent)" />
          )}
          {isRecent && <Clock size={12} className="text-[var(--text-muted)]" />}
          {active && (
            <CornerDownLeft size={12} className="text-[var(--text-dim)]" />
          )}
        </span>
      </button>
    );
  };

  const renderGroups = () => {
    if (!groups) {
      return flat.map((t, i) => {
        const active = i === activeIndex;
        const meta = categoryMeta[t.category];
        return renderItem(t, i, active, meta);
      });
    }

    let offset = 0;
    return groups.map(({ label, items }) => {
      const groupStart = offset;
      offset += items.length;
      return (
        <div key={label}>
          <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
              {label === "Pinned" && <Star size={8} className="inline mr-1 text-[var(--accent)]" fill="var(--accent)" />}
              {label === "Recent" && <Clock size={8} className="inline mr-1" />}
              {label === "All tools" && <Hash size={8} className="inline mr-1" />}
              {label}
            </span>
          </div>
          {items.map((t, i) => {
            const globalI = groupStart + i;
            const active = globalI === activeIndex;
            const meta = categoryMeta[t.category];
            return renderItem(t, globalI, active, meta);
          })}
        </div>
      );
    });
  };

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
              className="palette-backdrop fixed inset-0 bg-black/60 z-[90]"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 450, damping: 36 }}
              className="fixed top-[10vh] sm:top-[12vh] left-1/2 -translate-x-1/2 w-[96%] max-w-xl z-[91] bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.6), var(--shadow-glow)" }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 border-b border-[var(--border-soft)]">
                <Search size={16} className="text-[var(--text-dim)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools…"
                  className="flex-1 bg-transparent py-4 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none"
                />
                <kbd className="hidden sm:inline-flex">esc</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[55vh] overflow-y-auto py-1">
                {flat.length === 0 && (
                  <p className="px-4 py-8 text-sm text-[var(--text-dim)] text-center">
                    No tools match &ldquo;{query}&rdquo;.
                  </p>
                )}
                {renderGroups()}
              </div>

              {/* Footer hints */}
              <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border-soft)] text-[11px] text-[var(--text-dim)]">
                <span className="flex items-center gap-1">
                  <ArrowUp size={11} />
                  <ArrowDown size={11} /> navigate
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
