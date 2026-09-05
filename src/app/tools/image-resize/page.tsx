"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Lock, Unlock, Copy, Check, Sliders, Maximize2, Sparkles } from "lucide-react";

const tool = findTool("image-resize")!;

const presets = [
  { name: "IG Post", w: 1080, h: 1080, group: "Social" },
  { name: "IG Story / Reel", w: 1080, h: 1920, group: "Social" },
  { name: "YouTube Thumb", w: 1280, h: 720, group: "Social" },
  { name: "Twitter Banner", w: 1500, h: 500, group: "Social" },
  { name: "Full HD (1080p)", w: 1920, h: 1080, group: "Screen" },
  { name: "HD (720p)", w: 1280, h: 720, group: "Screen" },
  { name: "Square Avatar", w: 512, h: 512, group: "Avatar" },
];

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    const img = new Image();
    img.onload = () => {
      setOrigDims({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = URL.createObjectURL(f);
  };

  const onWidthChange = (v: number) => {
    setWidth(v);
    if (lockRatio && origDims && origDims.w > 0) {
      setHeight(Math.round((v / origDims.w) * origDims.h));
    }
  };

  const onHeightChange = (v: number) => {
    setHeight(v);
    if (lockRatio && origDims && origDims.h > 0) {
      setWidth(Math.round((v / origDims.h) * origDims.w));
    }
  };

  const applyScale = (pct: number) => {
    if (!origDims) return;
    const w = Math.round((origDims.w * pct) / 100);
    const h = Math.round((origDims.h * pct) / 100);
    setWidth(w);
    setHeight(h);
  };

  const applyPreset = (p: { w: number; h: number }) => {
    setWidth(p.w);
    setHeight(p.h);
    setLockRatio(false);
  };

  const resize = () => {
    if (!file || !width || !height) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setResult({ url, size: blob.size });
          push(`Image resized to ${width} × ${height}px`, "success");
        },
        format,
        0.92
      );
    };
    img.src = URL.createObjectURL(file);
  };

  const copyImage = async () => {
    if (!result) return;
    try {
      const res = await fetch(result.url);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      push("Resized image copied to clipboard", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      push("Browser does not support copying this image directly", "warn");
    }
  };

  const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          hint="PNG, JPG, WebP, or AVIF"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
            setOrigDims(null);
          }}
        />

        {origDims && (
          <div className="mt-5 space-y-5">
            {/* Dimensions Info Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-xs font-mono">
              <span className="text-[var(--text-dim)]">
                Original: <strong className="text-[var(--text)]">{origDims.w} × {origDims.h}px</strong> ({(file!.size / 1024).toFixed(1)} KB)
              </span>
              <Badge variant="accent">
                Target: {width} × {height}px
              </Badge>
            </div>

            {/* Quick Scale Buttons */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-2">
                Scale Proportionally
              </span>
              <div className="flex flex-wrap gap-2">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyScale(pct)}
                    className="press px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Presets */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-2">
                Standard & Social Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`press p-2 rounded-xl border text-left transition-all ${
                      width === p.w && height === p.h
                        ? "border-[var(--accent)] bg-[var(--accent)]/15"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-dim)]"
                    }`}
                  >
                    <div className="text-xs font-bold text-[var(--text)]">{p.name}</div>
                    <div className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">{p.w} × {p.h}px</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Dimension Inputs */}
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <Field label="Width (pixels)">
                <input
                  type="number"
                  className={`${inputClass} font-mono font-bold`}
                  value={width || ""}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                />
              </Field>

              <button
                type="button"
                onClick={() => setLockRatio((v) => !v)}
                aria-label="Toggle lock aspect ratio"
                className={`press mb-2 p-2.5 rounded-xl border transition-all justify-self-center ${
                  lockRatio
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                }`}
                title={lockRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
              </button>

              <Field label="Height (pixels)">
                <input
                  type="number"
                  className={`${inputClass} font-mono font-bold`}
                  value={height || ""}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                />
              </Field>
            </div>

            {/* Export Format */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">
                Output Format
              </span>
              <div className="flex gap-2">
                {[
                  { id: "image/png", label: "PNG" },
                  { id: "image/jpeg", label: "JPEG" },
                  { id: "image/webp", label: "WebP" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id as any)}
                    className={`press flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      format === fmt.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Button onClick={resize}>Resize image now</Button>
            </div>
          </div>
        )}

        {/* Result Preview & Download */}
        {result && file && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="h-64 sm:h-80 flex items-center justify-center p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt="Resized output" className="max-h-full object-contain rounded-lg" />
            </div>

            <ResultBar celebrate>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                <span className="text-xs font-mono text-[var(--text-dim)]">
                  {width} × {height}px · {(result.size / 1024).toFixed(1)} KB
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={copyImage}>
                    {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Image"}
                  </Button>
                  <a href={result.url} download={`resized-${file.name.replace(/\.[^/.]+$/, "")}.${ext}`}>
                    <Button variant="primary">
                      <Download size={15} /> Download {ext.toUpperCase()}
                    </Button>
                  </a>
                </div>
              </div>
            </ResultBar>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
