"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, SquareSlash, Star, Command, GripVertical } from "lucide-react";
import { tools, categoryMeta, ToolCategory } from "@/lib/tools-registry";
import { useFavorites } from "@/lib/hooks";
import ThemeToggle from "@/components/ThemeToggle";
import SoundToggle from "@/components/SoundToggle";
import { usePalette } from "@/components/CommandPalette";

const categories = Object.keys(categoryMeta) as ToolCategory[];

/** Wordmark used identically across all nav tiers, sized via props. */
function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`corner-ticks flex items-center justify-center shrink-0 border border-[var(--accent-dim)] text-[var(--accent)] ${
          compact ? "w-6 h-6" : "w-7 h-7"
        }`}
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent)",
        }}
      >
        <SquareSlash size={compact ? 13 : 15} strokeWidth={2} />
      </div>
      <span
        className={`font-semibold tracking-tight ${compact ? "text-base" : "text-lg"}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        Workbench
      </span>
    </div>
  );
}

function PaletteTrigger({ className = "" }: { className?: string }) {
  const { open } = usePalette();
  return (
    <button
      onClick={open}
      data-tour="search"
      className={`press w-full flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md py-2 pl-3 pr-2 text-sm text-[var(--text-dim)] hover:border-[var(--accent-dim)] transition-colors ${className}`}
    >
      <Search size={14} className="shrink-0" />
      <span className="flex-1 text-left truncate">Jump to a tool…</span>
      <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded px-1.5 py-0.5 shrink-0">
        <Command size={10} />K
      </span>
    </button>
  );
}

/**
 * Full nav list — favorites (draggable) + categorized tools + local filter.
 * Shared verbatim across the desktop sidebar and the mobile/tablet slide-in
 * panel so both tiers show identical, always-in-sync nav.
 */
function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const { favorites, toggle, isFavorite, reorder } = useFavorites();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q)
    );
  }, [query]);

  const favoriteTools = useMemo(
    () => favorites.map((slug) => tools.find((t) => t.slug === slug)).filter(Boolean) as typeof tools,
    [favorites]
  );

  return (
    <>
      <div className="px-4 pb-3 shrink-0">
        <div className="relative" data-tour="search">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] transition-colors outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 min-h-0">
        {favoriteTools.length > 0 && !query.trim() && (
          <div className="mb-4">
            <div className="px-2 pb-1.5 text-[11px] font-medium tracking-wide flex items-center gap-1.5 text-[var(--accent)]">
              <Star size={10} fill="var(--accent)" />
              Favorites
            </div>
            <div className="flex flex-col gap-0.5">
              {favoriteTools.map((tool, i) => {
                const meta = categoryMeta[tool.category];
                const href = `/tools/${tool.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={tool.slug}
                    href={href}
                    onClick={onNavigate}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null && dragIndex !== i) setDragOverIndex(i);
                    }}
                    onDragLeave={() => setDragOverIndex((cur) => (cur === i ? null : cur))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) reorder(dragIndex, i);
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`press group relative flex items-center justify-between px-2.5 py-2 text-sm transition-colors border-l cursor-grab active:cursor-grabbing ${
                      active
                        ? "text-[var(--text)] bg-[var(--bg-card)]"
                        : "text-[var(--text-dim)] border-transparent hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                    } ${dragOverIndex === i ? "outline-dashed outline-1 outline-[var(--accent)]" : ""}`}
                    style={active ? { borderLeftColor: meta.accent } : undefined}
                  >
                    <span className="flex items-center gap-1.5 pl-1.5 min-w-0">
                      <GripVertical
                        size={12}
                        className="shrink-0 text-[var(--text-dim)] opacity-0 group-hover:opacity-70 transition-opacity"
                      />
                      <span className="truncate">{tool.name}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(tool.slug);
                      }}
                      aria-label="Remove from favorites"
                      className="press opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                    >
                      <Star size={12} fill="var(--accent)" className="text-[var(--accent)]" />
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {categories.map((cat) => {
          const items = filtered.filter((t) => t.category === cat);
          if (items.length === 0) return null;
          const meta = categoryMeta[cat];
          return (
            <div key={cat} className="mb-4">
              <div
                className="px-2 pb-1.5 text-[11px] font-medium tracking-wide flex items-center gap-1.5"
                style={{ color: meta.accent }}
              >
                <span className="w-1 h-1" style={{ background: meta.accent }} />
                {meta.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {items.map((tool) => {
                  const href = `/tools/${tool.slug}`;
                  const active = pathname === href;
                  const fav = isFavorite(tool.slug);
                  return (
                    <Link
                      key={tool.slug}
                      href={href}
                      onClick={onNavigate}
                      className={`press group relative flex items-center justify-between px-2.5 py-2 text-sm transition-colors border-l ${
                        active
                          ? "text-[var(--text)] bg-[var(--bg-card)]"
                          : "text-[var(--text-dim)] border-transparent hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                      }`}
                      style={active ? { borderLeftColor: meta.accent } : undefined}
                    >
                      <span className="pl-1.5 truncate">{tool.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(tool.slug);
                        }}
                        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                        className={`press p-0.5 transition-opacity shrink-0 ${
                          fav ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Star
                          size={12}
                          fill={fav ? "var(--accent)" : "none"}
                          className={fav ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}
                        />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-2 text-sm text-[var(--text-dim)]">No tools match &ldquo;{query}&rdquo;.</p>
        )}
      </nav>
    </>
  );
}

/** Slide-in panel shared by every width under 1024px — one set of chrome,
 *  only the trigger button in the header differs by width. */
function NavPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50"
      />
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-[var(--bg)] border-r border-[var(--border)] z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0 safe-top">
          <Link href="/" onClick={onClose}>
            <Wordmark />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="tap-target p-2 -mr-2 text-[var(--text-dim)]"
          >
            <X size={20} />
          </button>
        </div>
        <NavList onNavigate={onClose} />
      </motion.aside>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close any open slide-in panel whenever the route changes (e.g. after
  // picking a tool). Also runs harmlessly on first mount, since `open`
  // already starts false there.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar — full permanent nav, ≥1024px */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg)]">
<<<<<<< HEAD
        <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
          <Link href="/" className="group">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Wordmark />
            </div>
          </Link>
          <div className="flex items-center gap-1.5" data-tour="theme">
            <ThemeToggle />
            <SoundToggle />
          </div>
=======
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="safe-top no-print lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="corner-ticks w-6 h-6 flex items-center justify-center border border-[var(--accent-dim)] text-[var(--accent)]">
            <SquareSlash size={13} strokeWidth={2} />
          </div>
          <span className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
            Workbench
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1" data-tour="theme">
            <ThemeToggle />
            <SoundToggle />
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="tap-target p-2 -mr-1 text-[var(--text)]"
          >
            <Menu size={22} />
          </button>
>>>>>>> a46212d85ec06ecaf0a74e627b8f1da58d307ca4
        </div>
        <div className="px-4 pb-3 shrink-0">
          <PaletteTrigger />
        </div>
        <NavList />
      </aside>

      {/*
        Header bar for everything under 1024px — one consistent bar rather
        than a phone-only strip that also has to awkwardly serve tablet and
        small-desktop windows. Search stays inline down to 640px; below
        that it collapses into just the menu button so the bar doesn't
        crowd on phone widths (search is still reachable inside the panel).
      */}
      <header className="safe-top no-print lg:hidden sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/" className="shrink-0">
            <Wordmark compact />
          </Link>

          <div className="hidden sm:block flex-1 min-w-0 max-w-sm">
            <PaletteTrigger />
          </div>

          <div className="flex items-center gap-1 ml-auto shrink-0" data-tour="theme">
            <ThemeToggle />
            <SoundToggle />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="tap-target p-2 -mr-1 text-[var(--text)]"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Shared slide-in nav panel for every sub-1024px width */}
      <AnimatePresence>
        {open && (
<<<<<<< HEAD
          <div className="lg:hidden">
            <NavPanel onClose={() => setOpen(false)} />
          </div>
=======
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-[var(--bg)] border-r border-[var(--border)] z-50 flex flex-col"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="tap-target absolute right-3 top-4 p-2 text-[var(--text-dim)]"
              >
                <X size={20} />
              </button>
              <NavContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
>>>>>>> a46212d85ec06ecaf0a74e627b8f1da58d307ca4
        )}
      </AnimatePresence>
    </>
  );
}
