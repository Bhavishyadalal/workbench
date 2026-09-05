"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop({ threshold = 640 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="no-print press fixed right-5 z-40 w-10 h-10 flex items-center justify-center rounded-full text-[var(--accent)] transition-colors"
          style={{
            /* On mobile: above bottom bar (60px) + margin; on desktop: near bottom */
            bottom: "calc(70px + env(safe-area-inset-bottom))",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, var(--bg-card)), var(--bg-card))",
            border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--border))",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4), var(--shadow-glow)",
          }}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
