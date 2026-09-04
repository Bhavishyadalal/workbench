"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileCheck2, X, Inbox, type LucideIcon } from "lucide-react";
import { useSound } from "@/lib/hooks";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "press inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
  const styles = {
    primary: "bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110",
    secondary:
      "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]",
    ghost: "text-[var(--text-dim)] hover:text-[var(--text)]",
  };
  const { click } = useSound();
  return (
    <button
      type={type}
      onClick={() => {
        click();
        onClick?.();
      }}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--text-dim)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] transition-colors outline-none";

export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  file,
  onClear,
  hint,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  file?: File | File[] | null;
  onClear?: () => void;
  hint?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles]
  );

  const hasFile = Array.isArray(file) ? file.length > 0 : !!file;
  const label = Array.isArray(file)
    ? `${file.length} file${file.length !== 1 ? "s" : ""} selected`
    : file?.name;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 px-6 py-10 ${
        dragOver
          ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]"
          : "border-[var(--border)] hover:border-[var(--accent-dim)]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {hasFile ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="flex items-center gap-2 text-[var(--text)]"
        >
          <FileCheck2 size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">{label}</span>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              aria-label="Clear file"
              className="ml-1 p-1 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-dim)]"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={{ y: dragOver ? -3 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <UploadCloud size={28} className="text-[var(--text-dim)] mb-3" />
          </motion.div>
          <p className="text-sm text-[var(--text)] font-medium">
            Drop {multiple ? "files" : "a file"} here, or click to browse
          </p>
          {hint && <p className="text-xs text-[var(--text-dim)] mt-1">{hint}</p>}
        </>
      )}
    </div>
  );
}

const CONFETTI_COLORS = ["var(--accent)", "var(--accent-2)", "var(--success)", "var(--text)"];

/** One-time particle burst layered on top of the success-burst glow. Fires once on mount. */
function ConfettiBurst() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 180,
        dy: -(40 + Math.random() * 70),
        rotate: (Math.random() - 0.5) * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.06,
      })),
    []
  );

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, rotate: p.rotate, scale: 0.5 }}
          transition={{ duration: 0.75, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "10%",
            top: "0%",
            width: 6,
            height: 6,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

export function ResultBar({ children, celebrate = false }: { children: ReactNode; celebrate?: boolean }) {
  const { chime } = useSound();

  useEffect(() => {
    if (celebrate) chime();
    // Fire once per mount (i.e. once per completed action) — chime is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`relative flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-[var(--border)] ${
        celebrate ? "success-burst rounded-lg" : ""
      }`}
    >
      {celebrate && <ConfettiBurst />}
      {children}
    </motion.div>
  );
}

/** Shimmering placeholder block for async tool loading states. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/** Friendlier placeholder shown before the user has provided input, instead of a blank card. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 text-[var(--text-dim)]">
      <Icon size={26} className="mb-3 opacity-60" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[var(--text)]">{title}</p>
      {hint && <p className="text-xs mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
