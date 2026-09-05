"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Star, Menu, X } from "lucide-react";
import { useTheme } from "@/lib/hooks";
import { usePalette } from "@/components/CommandPalette";
import { useFavorites } from "@/lib/hooks";
import AIThemePicker from "@/components/AIThemePicker";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { tools, categoryMeta, ToolCategory } from "@/lib/tools-registry";
import {
  ImageIcon,
  FileText,
  Repeat,
  Type,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";

const categories = Object.keys(categoryMeta) as ToolCategory[];
const categoryIcon: Record<ToolCategory, typeof ImageIcon> = {
  image: ImageIcon,
  pdf: FileText,
  convert: Repeat,
  text: Type,
  extras: Wrench,
};

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { open: openPalette } = usePalette();
  const { favorites } = useFavorites();
  const { theme, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="bottom-bar lg:hidden no-print" role="navigation" aria-label="Mobile navigation">
        {/* Home */}
        <Link
          href="/"
          className={`bottom-bar-item ${isHome ? "active" : ""}`}
          aria-label="Home"
        >
          <span className="bar-icon">
            <Home size={20} />
          </span>
          <span>Home</span>
        </Link>

        {/* Search */}
        <button
          onClick={openPalette}
          data-tour="search"
          className="bottom-bar-item"
          aria-label="Search tools"
        >
          <span className="bar-icon">
            <Search size={20} />
          </span>
          <span>Search</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`bottom-bar-item ${drawerOpen ? "active" : ""}`}
          aria-label="Browse all tools"
        >
          <span className="bar-icon" style={{ position: "relative" }}>
            <Menu size={20} />
            {favorites.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {favorites.length}
              </span>
            )}
          </span>
          <span>Tools</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          data-tour="theme"
          className="bottom-bar-item"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="bar-icon">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </span>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </nav>

      {/* Full-screen tools drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] palette-backdrop bg-black/60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl border-t border-[var(--border)] overflow-hidden"
              style={{
                background: "var(--bg-elevated)",
                maxHeight: "82vh",
              }}
            >
              {/* Handle */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border)]">
                <span
                  className="text-sm font-semibold text-gradient"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  All Tools
                </span>
                <div className="flex items-center gap-2">
                  <AIThemePicker />
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="press p-1.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto pb-6" style={{ maxHeight: "calc(82vh - 60px)" }}>
                {/* Favorites section */}
                {favorites.length > 0 && (
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-2 flex items-center gap-1.5">
                      <Star size={9} fill="var(--accent)" />
                      Pinned
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {favorites
                        .map((slug) => tools.find((t) => t.slug === slug))
                        .filter(Boolean)
                        .map((tool) => {
                          if (!tool) return null;
                          const meta = categoryMeta[tool.category];
                          return (
                            <Link
                              key={tool.slug}
                              href={`/tools/${tool.slug}`}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-medium text-[var(--text)] active:scale-95 transition-transform"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: meta.accent }}
                              />
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories.map((cat) => {
                  const meta = categoryMeta[cat];
                  const items = tools.filter((t) => t.category === cat);
                  const Icon = categoryIcon[cat];
                  return (
                    <div key={cat} className="px-4 pt-4">
                      <p
                        className="text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5"
                        style={{ color: meta.accent }}
                      >
                        <Icon size={9} />
                        {meta.label}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((tool) => (
                          <Link
                            key={tool.slug}
                            href={`/tools/${tool.slug}`}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-medium text-[var(--text-dim)] active:scale-95 transition-transform"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: meta.accent }}
                            />
                            <span className="truncate">{tool.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
