"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileCheck2, X } from "lucide-react";

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
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
  const styles = {
    primary: "bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110",
    secondary:
      "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]",
    ghost: "text-[var(--text-dim)] hover:text-[var(--text)]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
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
      className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed cursor-pointer transition-colors px-6 py-10 ${
        dragOver
          ? "border-[var(--accent)] bg-[var(--accent)]/5"
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
          <UploadCloud size={28} className="text-[var(--text-dim)] mb-3" />
          <p className="text-sm text-[var(--text)] font-medium">
            Drop {multiple ? "files" : "a file"} here, or click to browse
          </p>
          {hint && <p className="text-xs text-[var(--text-dim)] mt-1">{hint}</p>}
        </>
      )}
    </div>
  );
}

export function ResultBar({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-[var(--border)]"
    >
      {children}
    </motion.div>
  );
}
