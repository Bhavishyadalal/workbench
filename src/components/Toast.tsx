"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

type ToastKind = "success" | "info" | "warn" | "error";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warn: TriangleAlert,
  error: TriangleAlert,
};

const iconColor: Record<ToastKind, string> = {
  success: "var(--success)",
  info: "var(--accent)",
  warn: "var(--warn)",
  error: "var(--danger)",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none sm:bottom-6"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="pointer-events-auto flex items-center gap-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full pl-3.5 pr-4 py-2.5 shadow-2xl"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}
              >
                <Icon size={16} style={{ color: iconColor[t.kind] }} className="shrink-0" />
                <span className="text-sm text-[var(--text)] font-medium whitespace-nowrap">
                  {t.message}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // graceful no-op fallback so tool pages never crash if provider is missing
    return { push: () => {} };
  }
  return ctx;
}
