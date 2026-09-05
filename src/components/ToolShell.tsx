"use client";

import { motion, Easing } from "framer-motion";

const easeOut: Easing = [0.16, 1, 0.3, 1];
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";
import { ToolDef, categoryMeta } from "@/lib/tools-registry";
import { useFavorites, useRecentTools } from "@/lib/hooks";

export default function ToolShell({
  tool,
  children,
}: {
  tool: ToolDef;
  children: ReactNode;
}) {
  const meta = categoryMeta[tool.category];
  const { track } = useRecentTools();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(tool.slug);
  const [justToggled, setJustToggled] = useState(false);

  useEffect(() => {
    track(tool.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 pb-28 lg:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        {/* Breadcrumb */}
        <nav className="no-print flex items-center gap-1.5 text-xs text-[var(--text-dim)] mb-6">
          <Link
            href="/"
            className="hover:text-[var(--text)] transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={12} className="text-[var(--text-muted)]" />
          <span style={{ color: meta.accent }}>{meta.label}</span>
          <ChevronRight size={12} className="text-[var(--text-muted)]" />
          <span className="text-[var(--text)] font-medium truncate max-w-[200px]">
            {tool.name}
          </span>
        </nav>

        {/* Back button */}
        <Link
          href="/"
          className="no-print inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-5 group"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          All tools
        </Link>

        {/* Category pill */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="shine inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border"
            style={{
              color: meta.accent,
              borderColor: `color-mix(in srgb, ${meta.accent} 30%, var(--border))`,
              background: `color-mix(in srgb, ${meta.accent} 10%, var(--bg-elevated))`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: meta.accent }}
            />
            {meta.label}
          </span>
        </div>

        {/* Title + favorite */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {tool.name}
          </h1>
          <button
            onClick={() => {
              toggle(tool.slug);
              setJustToggled(true);
              window.setTimeout(() => setJustToggled(false), 450);
            }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={fav}
            className="shrink-0 mt-1 p-2.5 -mr-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg-card))] transition-all"
          >
            <Star
              size={20}
              fill={fav ? "var(--accent)" : "none"}
              className={`transition-colors ${fav ? "text-[var(--accent)]" : ""} ${
                justToggled ? "star-pop" : ""
              }`}
            />
          </button>
        </div>
        <p className="text-[var(--text-dim)] mb-8 text-sm leading-relaxed">
          {tool.short}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}
