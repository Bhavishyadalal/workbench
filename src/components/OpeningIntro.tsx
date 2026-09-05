"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Cpu, Zap } from "lucide-react";

export default function OpeningIntro() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if seen during current tab session
    const seen = sessionStorage.getItem("wb:seen_intro");
    if (!seen) {
      setShow(true);
      sessionStorage.setItem("wb:seen_intro", "1");
    }

    // Listen for custom replay event
    const handleReplay = () => {
      setProgress(0);
      setShow(true);
    };
    window.addEventListener("wb:replay-intro", handleReplay);
    return () => window.removeEventListener("wb:replay-intro", handleReplay);
  }, []);

  useEffect(() => {
    if (!show) return;

    // Fast progress increment
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setShow(false), 300);
          return 100;
        }
        return p + 5;
      });
    }, 45);

    // Auto dismiss after max 1.6s
    const timeout = setTimeout(() => setShow(false), 1600);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        setShow(false);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro-curtain"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setShow(false)}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09080A] text-white cursor-pointer select-none overflow-hidden"
      >
        {/* Ambient Neural Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, var(--accent) 0%, var(--accent-2) 50%, transparent 70%)",
            }}
          />
        </div>

        {/* Central Futuristic Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
        >
          {/* Animated Orbital Ring Emblem */}
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            {/* Outer Spinning Dashed Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--accent)] opacity-60"
            />
            {/* Inner Counter-spinning Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-[var(--accent-2)] opacity-80"
            />
            {/* Core Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--accent-bright)] shadow-[0_0_24px_var(--accent)]"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, #000), #000)",
                border: "1px solid var(--accent-dim)",
              }}
            >
              <Cpu size={24} />
            </div>
          </div>

          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[var(--accent-dim)] bg-[var(--accent)]/15 text-[var(--accent-bright)] mb-3 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
          >
            <Sparkles size={11} className="text-[var(--accent)]" />
            Neural Engine Active
          </motion.div>

          {/* Glowing Brand Title */}
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
            className="text-xs text-[#A1A1AA] tracking-wider uppercase font-mono mb-6"
          >
            34 In-Browser Client Tools · Zero Uploads
          </motion.p>

          {/* Telemetry Progress Bar */}
          <div className="w-56 mb-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#71717A] mb-1">
              <span>INITIALIZING</span>
              <span className="text-[var(--accent)] font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#18181B] rounded-full overflow-hidden border border-[#27272A]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)",
                }}
              />
            </div>
          </div>

          <span className="text-[10px] text-[#52525B] font-mono tracking-widest uppercase">
            Click anywhere or press Esc to start
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
