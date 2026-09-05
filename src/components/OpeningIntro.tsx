"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Cpu } from "lucide-react";
import { tools } from "@/lib/tools-registry";

const SESSION_KEY = "wb:seen_intro";
const VISIBLE_MS = 2000;
const EXIT_MS = 550;

export default function OpeningIntro() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setShow(false);
  };

  useEffect(() => {
    setMounted(true);

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable — show it anyway, don't persist
    }

    if (!seen) {
      setShow(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
    }

    // Manual replay hook, e.g. from a "replay intro" button somewhere in settings
    const handleReplay = () => {
      setProgress(0);
      setShow(true);
    };
    window.addEventListener("wb:replay-intro", handleReplay);
    return () => window.removeEventListener("wb:replay-intro", handleReplay);
  }, []);

  useEffect(() => {
    if (!show) return;

    setProgress(0);
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / VISIBLE_MS) * 100));
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hard-guaranteed minimum visible time, independent of the progress animation.
    dismissTimer.current = setTimeout(() => setShow(false), VISIBLE_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") dismiss();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Avoid any SSR/hydration mismatch flash — render nothing until mounted client-side.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro-curtain"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
          style={{ background: "var(--bg)", color: "var(--text)" }}
        >
          {/* Ambient neural glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, var(--accent) 0%, var(--accent-2) 50%, transparent 70%)",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
          >
            {/* Orbital ring emblem */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-60"
                style={{ borderColor: "var(--accent)" }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border opacity-80"
                style={{ borderColor: "var(--accent-2)" }}
              />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--accent-bright)]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, var(--bg)), var(--bg))",
                  border: "1px solid var(--accent-dim)",
                  boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 45%, transparent)",
                }}
              >
                <Cpu size={24} />
              </div>
            </div>

            {/* AI badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3"
              style={{
                border: "1px solid var(--accent-dim)",
                background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                color: "var(--accent-bright)",
                boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)",
              }}
            >
              <Sparkles size={11} style={{ color: "var(--accent)" }} />
              Neural Engine Active
            </motion.div>

            {/* Brand title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="font-extrabold text-4xl sm:text-5xl tracking-tight mb-2 text-gradient"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WORKBENCH
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-xs tracking-wider uppercase font-mono mb-6"
              style={{ color: "var(--text-dim)" }}
            >
              {tools.length} In-Browser Client Tools · Zero Uploads
            </motion.p>

            {/* Telemetry progress bar */}
            <div className="w-56 mb-3">
              <div
                className="flex justify-between items-center text-[10px] font-mono mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                <span>INITIALIZING</span>
                <span className="font-bold" style={{ color: "var(--accent)" }}>
                  {progress}%
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{
                  background: "color-mix(in srgb, var(--text) 8%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)",
                    transition: "width 60ms linear",
                  }}
                />
              </div>
            </div>

            <span
              className="text-[10px] font-mono tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Click anywhere or press Esc to start
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
