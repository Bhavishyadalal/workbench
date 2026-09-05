"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Accent sweep bar — fires on every route change, top of viewport */}
      <AnimatePresence>
        <motion.div
          key={`sweep-${pathname}`}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: easeOut, opacity: { delay: 0.3, duration: 0.3 } }}
          style={{
            transformOrigin: "left",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            zIndex: 100,
            background:
              "linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))",
            pointerEvents: "none",
          }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10, scale: 0.994, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, scale: 0.996, filter: "blur(2px)" }}
          transition={{ duration: 0.32, ease: easeOut }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
