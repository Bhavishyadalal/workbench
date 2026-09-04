"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFirstVisitTour } from "@/lib/hooks";

interface Step {
  key: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    key: "search",
    title: "Jump to any tool",
    body: "Tap here (or press \u2318K on desktop) to fuzzy-search all 35+ tools by name.",
  },
  {
    key: "theme",
    title: "Make it yours",
    body: "Switch between dark and light, and turn on light sound effects — both stick around next time.",
  },
  {
    key: "categories",
    title: "Everything's grouped",
    body: "Tools are sorted into five categories. Star any tool from its page to pin it up top.",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findVisibleTarget(key: string): Rect | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`));
  for (const el of candidates) {
    if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }
  return null;
}

export default function Tour() {
  const { shouldShow, dismiss } = useFirstVisitTour();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    const t = window.setTimeout(() => setActive(true), 700);
    return () => window.clearTimeout(t);
  }, [shouldShow]);

  const recompute = useCallback(() => {
    if (!active) return;
    setRect(findVisibleTarget(STEPS[stepIndex].key));
  }, [active, stepIndex]);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, { passive: true });
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute);
    };
  }, [recompute]);

  const end = useCallback(() => {
    setActive(false);
    dismiss();
  }, [dismiss]);

  const next = () => {
    if (stepIndex >= STEPS.length - 1) {
      end();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  if (!active) return null;

  const step = STEPS[stepIndex];
  const pad = 8;

  // Position the tooltip below the target when there's room, otherwise above; clamp horizontally.
  const tooltipWidth = 280;
  const estimatedHeight = 130;
  let tooltipTop: number;
  let tooltipLeft: number;
  if (rect) {
    const belowRoom = window.innerHeight - (rect.top + rect.height) > estimatedHeight + 24;
    tooltipTop = belowRoom ? rect.top + rect.height + 14 : rect.top - 14 - estimatedHeight;
    tooltipLeft = Math.min(
      Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, 12),
      window.innerWidth - tooltipWidth - 12
    );
  } else {
    tooltipTop = window.innerHeight / 2 - 60;
    tooltipLeft = window.innerWidth / 2 - tooltipWidth / 2;
  }

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-label="Feature tour">
      <div className="palette-backdrop absolute inset-0 bg-black/25" onClick={end} />

      {rect && (
        <motion.div
          className="pointer-events-none absolute rounded-lg border-2 border-[var(--accent)]"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent)",
          }}
        />
      )}

      <motion.div
        key={step.key}
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        style={{
          position: "absolute",
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-[var(--text)]">{step.title}</h3>
          <button
            onClick={end}
            aria-label="Skip tour"
            className="press shrink-0 -mt-1 -mr-1 p-1 text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-3.5">{step.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i === stepIndex ? "var(--accent)" : "var(--border)" }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={end} className="press text-xs text-[var(--text-dim)] hover:text-[var(--text)]">
              Skip
            </button>
            <button
              onClick={next}
              className="press bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-medium rounded-md px-3 py-1.5"
            >
              {stepIndex === STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
