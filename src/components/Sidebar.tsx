"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, SquareSlash } from "lucide-react";
import { tools, categoryMeta, ToolCategory } from "@/lib/tools-registry";

const categories = Object.keys(categoryMeta) as ToolCategory[];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-6 pb-4 shrink-0 group"
      >
        <div
          className="corner-ticks w-7 h-7 flex items-center justify-center shrink-0 border border-[var(--accent-dim)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-105"
          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent)" }}
        >
          <SquareSlash size={15} strokeWidth={2} />
        </div>
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Workbench
        </span>
      </Link>

      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] transition-colors outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
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
                  return (
                    <Link
                      key={tool.slug}
                      href={href}
                      onClick={onNavigate}
                      className={`relative px-2.5 py-2 text-sm transition-colors border-l ${
                        active
                          ? "text-[var(--text)] bg-[var(--bg-card)]"
                          : "text-[var(--text-dim)] border-transparent hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                      }`}
                      style={active ? { borderLeftColor: meta.accent } : undefined}
                    >
                      <span className="pl-1.5">{tool.name}</span>
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
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg)]">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="corner-ticks w-6 h-6 flex items-center justify-center border border-[var(--accent-dim)] text-[var(--accent)]">
            <SquareSlash size={13} strokeWidth={2} />
          </div>
          <span className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
            Workbench
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-[var(--text)]"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
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
                className="absolute right-3 top-4 p-2 text-[var(--text-dim)]"
              >
                <X size={20} />
              </button>
              <NavContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
