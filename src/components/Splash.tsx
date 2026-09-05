"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SquareSlash, Wrench, FileText, ImageIcon, Repeat, Type } from "lucide-react";

const BRAND = "Workbench";
const SESSION_KEY = "wb:splash-seen-v2";
const VISIBLE_MS = 2000;
const EXIT_MS = 550;

const orbitIcons = [Wrench, FileText, ImageIcon, Repeat, Type];

export default function Splash() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setMounted(true);

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private mode etc) — show it anyway, don't persist
    }

    if (seen) return;

    setShow(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}

    const exitTimer = setTimeout(() => setExiting(true), VISIBLE_MS);
    const removeTimer = setTimeout(() => setShow(false), VISIBLE_MS + EXIT_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Avoid any SSR/hydration mismatch flash — render nothing until mounted.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] } }}
          aria-hidden
        >
          {/* Orbiting tool icons */}
          <div className="splash-orbit" aria-hidden>
            {orbitIcons.map((Icon, i) => (
              <span
                key={i}
                className="splash-orbit-item"
                style={{
                  animationDelay: `${i * -2.4}s`,
                  ["--orbit-offset" as string]: `${(360 / orbitIcons.length) * i}deg`,
                }}
              >
                <Icon size={14} />
              </span>
            ))}
          </div>

          <motion.div
            animate={exiting ? { scale: 0.92, y: -6 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-6"
          >
            <div className="relative flex items-center justify-center">
              <span className="splash-ring" />
              <span className="splash-ring" style={{ animationDelay: "0.7s" }} />
              <span className="splash-ring" style={{ animationDelay: "1.4s" }} />
              <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="corner-ticks relative w-[72px] h-[72px] flex items-center justify-center rounded-2xl border border-[var(--accent-dim)] text-[var(--accent)]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent-2) 10%, transparent))",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <SquareSlash size={30} strokeWidth={2} />
              </motion.div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient"
              style={{ fontFamily: "var(--font-brand)", perspective: "400px" }}
            >
              {BRAND.split("").map((ch, i) => (
                <span
                  key={i}
                  className="splash-letter"
                  style={{ animationDelay: `${0.25 + i * 0.045}s` }}
                >
                  {ch}
                </span>
              ))}
            </h1>

            {/* Progress bar — visually communicates the load, spans the full visible duration */}
            <div className="splash-progress-track">
              <motion.div
                className="splash-progress-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: VISIBLE_MS / 1000 - 0.2, ease: "easeInOut", delay: 0.15 }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-[11px] tracking-[0.2em] uppercase text-[var(--text-dim)]"
            >
              Every tool, one bench
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
