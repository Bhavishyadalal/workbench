"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SquareSlash } from "lucide-react";

const BRAND = "Workbench";
const SESSION_KEY = "wb:splash-seen";

export default function Splash() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable — just skip the splash quietly
    }

    if (seen) return;

    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}

    const exitTimer = setTimeout(() => setExiting(true), 1400);
    const removeTimer = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        >
          <motion.div
            animate={{ scale: exiting ? 0.94 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-5"
          >
            <div className="relative flex items-center justify-center">
              <span className="splash-ring" />
              <span className="splash-ring" style={{ animationDelay: "0.8s" }} />
              <div
                className="corner-ticks relative w-16 h-16 flex items-center justify-center rounded-2xl border border-[var(--accent-dim)] text-[var(--accent)]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent-2) 8%, transparent))",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <SquareSlash size={28} strokeWidth={2} />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient"
              style={{ fontFamily: "var(--font-brand)", perspective: "400px" }}
            >
              {BRAND.split("").map((ch, i) => (
                <span
                  key={i}
                  className="splash-letter"
                  style={{ animationDelay: `${0.15 + i * 0.045}s` }}
                >
                  {ch}
                </span>
              ))}
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
