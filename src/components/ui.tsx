"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileCheck2, X, Inbox, Check, Copy, type LucideIcon } from "lucide-react";
import { useSound } from "@/lib/hooks";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-sm)] ${className}`}
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
    "press inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]";

  const styles: Record<string, string> = {
    primary:
      "btn-glow text-[var(--accent-ink)] relative overflow-hidden shadow-[var(--shadow-glow)]",
    secondary:
      "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent-dim)] hover:text-[var(--accent-bright)] shadow-[var(--shadow-sm)]",
    ghost: "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]",
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
      style={
        variant === "primary"
          ? {
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 50%, var(--accent-2) 100%)",
            }
          : undefined
      }
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
      <span className="text-xs font-semibold text-[var(--text-dim)] tracking-wide uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-3 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all outline-none min-h-[44px]";

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
      className={`relative flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 px-6 py-12 sm:py-16 group ${
        dragOver
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg-card))] scale-[1.01]"
          : "border-[var(--border)] hover:border-[var(--accent-dim)] hover:bg-[var(--bg-elevated)]"
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
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="flex items-center gap-3 text-[var(--text)]"
        >
          <FileCheck2 size={22} className="text-[var(--success)] shrink-0" />
          <span className="text-sm font-semibold">{label}</span>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              aria-label="Clear file"
              className="ml-1 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={{ y: dragOver ? -5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-1"
              style={{
                background:
                  "color-mix(in srgb, var(--accent) 10%, var(--bg-elevated))",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 20%, var(--border))",
              }}
            >
              <UploadCloud
                size={26}
                className="text-[var(--accent)] group-hover:text-[var(--accent-bright)] transition-colors"
              />
            </div>
          </motion.div>
          <p className="text-sm font-semibold text-[var(--text)] mb-1">
            Drop {multiple ? "files" : "a file"} here, or tap to browse
          </p>
          {hint && (
            <p className="text-xs text-[var(--text-dim)] mt-1">{hint}</p>
          )}
        </>
      )}
    </div>
  );
}

const CONFETTI_COLORS = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--success)",
  "var(--accent-3)",
];

function ConfettiBurst() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 220,
        dy: -(50 + Math.random() * 90),
        rotate: (Math.random() - 0.5) * 400,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.08,
        size: 4 + Math.random() * 4,
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
          animate={{ opacity: 0, x: p.dx, y: p.dy, rotate: p.rotate, scale: 0.4 }}
          transition={{ duration: 0.85, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "50%",
            top: "0%",
            width: p.size,
            height: p.size,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

export function ResultBar({
  children,
  celebrate = false,
}: {
  children: ReactNode;
  celebrate?: boolean;
}) {
  const { chime } = useSound();

  useEffect(() => {
    if (celebrate) chime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`relative flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-[var(--border)] ${
        celebrate ? "success-burst rounded-xl" : ""
      }`}
    >
      {celebrate && <ConfettiBurst />}
      {children}
    </motion.div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

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
    <div className="flex flex-col items-center justify-center text-center px-6 py-14 text-[var(--text-dim)]">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "color-mix(in srgb, var(--accent) 8%, var(--bg-elevated))",
          border: "1px solid color-mix(in srgb, var(--accent) 15%, var(--border))",
        }}
      >
        <Icon size={24} className="text-[var(--accent)] opacity-70" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
      {hint && <p className="text-xs mt-1 max-w-xs leading-relaxed">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const styles = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-dim)] border-[var(--border)]",
    accent: "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent-bright)] border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
    success: "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_30%,transparent)]",
    warning: "bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] text-[var(--warn)] border-[color-mix(in_srgb,var(--warn)_30%,transparent)]",
    danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_30%,transparent)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
  variant = "ghost",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <Button
      variant={variant}
      onClick={copy}
      disabled={!text}
      className={`!px-3 !py-1.5 !min-h-[36px] text-xs font-medium ${className}`}
    >
      {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { value: T; label: ReactNode; icon?: LucideIcon }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 p-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`press flex-1 min-w-[72px] py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              active
                ? "bg-[var(--bg-card)] text-[var(--accent-bright)] shadow-[var(--shadow-sm)] border border-[color-mix(in_srgb,var(--accent)_25%,var(--border))]"
                : "text-[var(--text-dim)] hover:text-[var(--text)] border border-transparent"
            }`}
          >
            {Icon && <Icon size={14} className={active ? "text-[var(--accent)]" : "opacity-70"} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({
  progress,
  label,
  className = "",
}: {
  progress: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text-dim)] mb-1.5">
          <span>{label}</span>
          <span className="font-mono text-[var(--accent)]">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)",
          }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: "easeOut", duration: 0.25 }}
        />
      </div>
    </div>
  );
}
