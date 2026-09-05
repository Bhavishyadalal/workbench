"use client";

import { useState, useRef, useEffect } from "react";
import { useAITheme, AITheme, useSound } from "@/lib/hooks";
import { Sparkles, Check, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIThemePicker({ className = "" }: { className?: string }) {
  const { aiTheme, setAiTheme, themes } = useAITheme();
  const { click } = useSound();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = themes.find((t) => t.id === aiTheme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => {
          click();
          setOpen((o) => !o);
        }}
        className="press flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] text-xs font-semibold transition-all shadow-[var(--shadow-sm)]"
        title="Switch AI Theme Accent"
        aria-label="Switch AI Color Theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ background: activeTheme.color, color: activeTheme.color }}
        />
        <Sparkles size={13} className="text-[var(--accent)]" />
        <span className="hidden sm:inline text-[var(--text)] text-[11px] font-mono">
          {activeTheme.name.split(" ")[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-50 w-56 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl glass"
            style={{ boxShadow: "0 12px 36px rgba(0,0,0,0.6)" }}
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--border)] mb-1">
              <Palette size={11} className="text-[var(--accent)]" /> AI Color Themes
            </div>

            <div className="space-y-1">
              {themes.map((t) => {
                const isSelected = t.id === aiTheme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      click();
                      setAiTheme(t.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-[var(--bg-elevated)] border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"
                        : "hover:bg-[var(--bg-elevated)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{
                          background: t.color,
                          boxShadow: isSelected ? `0 0 10px ${t.color}` : "none",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text)] truncate">{t.name}</div>
                        <div className="text-[9px] text-[var(--text-dim)] truncate">{t.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[var(--accent-bright)] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
