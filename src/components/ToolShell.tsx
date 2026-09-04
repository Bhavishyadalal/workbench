"use client";

import { motion, Easing } from "framer-motion";

const easeOut: Easing = [0.16, 1, 0.3, 1];
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
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
    <div className="max-w-3xl mx-auto px-5 py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          All tools
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2"
            style={{ background: meta.accent }}
          />
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: meta.accent }}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {tool.name}
          </h1>
          <button
            onClick={() => {
              toggle(tool.slug);
              setJustToggled(true);
              window.setTimeout(() => setJustToggled(false), 400);
            }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={fav}
            className="shrink-0 mt-1 p-2 -mr-2 rounded-md text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
          >
            <Star
              size={19}
              fill={fav ? "var(--accent)" : "none"}
              className={`${fav ? "text-[var(--accent)]" : ""} ${justToggled ? "star-pop" : ""}`}
            />
          </button>
        </div>
        <p className="text-[var(--text-dim)] mb-8">{tool.short}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}
