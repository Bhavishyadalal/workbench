"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Star,
  Sun,
  Moon,
  SquareSlash,
  Command,
  GripVertical,
  ImageIcon,
  FileText,
  Repeat,
  Type,
  Wrench,
} from "lucide-react";
import { tools, categoryMeta, ToolCategory } from "@/lib/tools-registry";
import { useFavorites, useTheme } from "@/lib/hooks";
import ThemeToggle from "@/components/ThemeToggle";
import SoundToggle from "@/components/SoundToggle";
import { usePalette } from "@/components/CommandPalette";

const categories = Object.keys(categoryMeta) as ToolCategory[];

const categoryIcon: Record<ToolCategory, typeof ImageIcon> = {
  image: ImageIcon,
  pdf: FileText,
  convert: Repeat,
  text: Type,
  extras: Wrench,
};

function PaletteTrigger() {
  const { open } = usePalette();
  return (
    <button
      onClick={open}
      data-tour="search"
      className="press w-full flex items-center gap-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl py-2.5 pl-3.5 pr-2.5 text-sm text-[var(--text-dim)] hover:border-[var(--accent-dim)] hover:text-[var(--text)] transition-all duration-200"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <Search size={14} className="shrink-0" />
      <span className="flex-1 text-left text-xs">Jump to any tool…</span>
      <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded-md px-1.5 py-0.5 font-mono">
        <Command size={10} />K
      </span>
    </button>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { favorites, toggle, isFavorite, reorder } = useFavorites();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const favoriteTools = useMemo(
    () =>
      favorites
        .map((slug) => tools.find((t) => t.slug === slug))
        .filter(Boolean) as typeof tools,
    [favorites]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3 group">
          <div
            className="corner-ticks w-8 h-8 flex items-center justify-center shrink-0 rounded-lg border border-[var(--accent-dim)] text-[var(--accent)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[var(--shadow-glow)]"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--accent-2) 5%, transparent))",
            }}
          >
            <SquareSlash size={16} strokeWidth={2} />
          </div>
          <span
            className="text-lg font-semibold tracking-tight text-gradient"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Workbench
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-1" data-tour="theme">
          <ThemeToggle />
          <SoundToggle />
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-4 pb-4 shrink-0">
        <PaletteTrigger />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
        {/* Favorites */}
        {favoriteTools.length > 0 && (
          <div className="mb-3">
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-widest uppercase flex items-center gap-1.5 text-[var(--accent)]">
              <Star size={9} fill="var(--accent)" />
              Pinned
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
                      if (dragIndex !== null && dragIndex !== i)
                        setDragOverIndex(i);
                    }}
                    onDragLeave={() =>
                      setDragOverIndex((cur) => (cur === i ? null : cur))
                    }
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
                    className={`press group relative flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                      active
                        ? "text-[var(--accent-bright)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg-card))]"
                        : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                    } ${
                      dragOverIndex === i
                        ? "outline-dashed outline-1 outline-[var(--accent)]"
                        : ""
                    }`}
                    style={
                      active
                        ? { boxShadow: `0 0 0 1px ${meta.accent}40` }
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-2 pl-1 min-w-0">
                      <GripVertical
                        size={12}
                        className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-70 transition-opacity"
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: meta.accent }}
                      />
                      <span className="truncate text-xs font-medium">
                        {tool.name}
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(tool.slug);
                      }}
                      aria-label="Remove from favorites"
                      className="press opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                    >
                      <Star
                        size={11}
                        fill="var(--accent)"
                        className="text-[var(--accent)]"
                      />
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category groups */}
        {categories.map((cat) => {
          const items = tools.filter((t) => t.category === cat);
          const meta = categoryMeta[cat];
          const Icon = categoryIcon[cat];
          return (
            <div key={cat} className="mb-3">
              <div
                className="px-2 pb-1.5 text-[10px] font-semibold tracking-widest uppercase flex items-center gap-1.5"
                style={{ color: meta.accent }}
              >
                <Icon size={9} />
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
                      className={`press group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-all ${
                        active
                          ? "text-[var(--accent-bright)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg-card))]"
                          : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                      }`}
                      style={
                        active
                          ? { boxShadow: `0 0 0 1px ${meta.accent}40` }
                          : undefined
                      }
                    >
                      <span className="pl-1.5 truncate font-medium">
                        {tool.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(tool.slug);
                        }}
                        aria-label={
                          fav ? "Remove from favorites" : "Add to favorites"
                        }
                        className={`press p-0.5 shrink-0 transition-opacity ${
                          fav ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Star
                          size={11}
                          fill={fav ? "var(--accent)" : "none"}
                          className={
                            fav ? "text-[var(--accent)]" : "text-[var(--text-dim)]"
                          }
                        />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[268px] shrink-0 h-screen sticky top-0 border-r border-[var(--border)]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--bg) 92%, var(--accent)) 0%, var(--bg) 100%)",
        }}
      >
        <NavContent />
      </aside>

      {/* Mobile top bar — only shown on mobile (bottom bar handles navigation) */}
      <div className="no-print lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-[var(--border)] glass">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="corner-ticks w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--accent-dim)] text-[var(--accent)]"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), transparent)",
            }}
          >
            <SquareSlash size={13} strokeWidth={2} />
          </div>
          <span
            className="font-semibold text-base text-gradient"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Workbench
          </span>
        </Link>
        <div className="flex items-center gap-1" data-tour="theme">
          <ThemeToggle />
          <SoundToggle />
        </div>
      </div>

      {/* Mobile drawer (opened from bottom bar menu tap) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-50 palette-backdrop bg-black/60"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[85%] max-w-[320px] border-r border-[var(--border)] z-50 flex flex-col"
              style={{
                background: "var(--bg)",
                backdropFilter: "blur(20px)",
              }}
            >
              <NavContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
