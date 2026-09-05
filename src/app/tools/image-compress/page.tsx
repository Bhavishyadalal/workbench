"use client";

import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, Badge, Tabs } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2, Copy, Sliders, Sparkles, Check, ArrowRight, Eye, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tool = findTool("image-compress")!;

type Mode = "quality" | "target";
type FormatChoice = "original" | "image/webp" | "image/jpeg" | "image/png";

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(72);
  const [targetKb, setTargetKb] = useState(150);
  const [format, setFormat] = useState<FormatChoice>("original");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; size: number; name: string } | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [splitPos, setSplitPos] = useState(50);
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<"split" | "side" | "result">("split");
  const splitRef = useRef<HTMLDivElement>(null);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setError("");
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
      // auto-suggest target KB as roughly 40% of original
      setTargetKb(Math.max(20, Math.round((f.size / 1024) * 0.45)));
    };
    img.src = url;
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      let options: any = {
        useWebWorker: true,
      };

      if (mode === "quality") {
        options.initialQuality = quality / 100;
        options.maxSizeMB = Math.max(0.01, (file.size / 1024 / 1024) * (quality / 100));
      } else {
        // Target size in KB
        options.maxSizeMB = Math.max(0.01, targetKb / 1024);
        options.initialQuality = 0.85;
      }

      if (format !== "original") {
        options.fileType = format;
      }

      const compressedFile = await imageCompression(file, options);
      const url = URL.createObjectURL(compressedFile);
      const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : file.name.split(".").pop() || "jpg";
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}-compressed.${ext}`;

      setResult({ blob: compressedFile, url, size: compressedFile.size, name: outputName });
      const savingsPct = Math.max(0, 100 - (compressedFile.size / file.size) * 100);
      push(`Saved ${savingsPct.toFixed(0)}% — compressed from ${(file.size / 1024).toFixed(0)} KB to ${(compressedFile.size / 1024).toFixed(0)} KB`, "success");
    } catch {
      setError("Couldn't compress that image. Try adjusting quality or choose another file.");
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      // browser clipboard requires PNG or blob
      let blobToCopy = result.blob;
      if (blobToCopy.type !== "image/png") {
        const img = new Image();
        img.src = result.url;
        await new Promise((res) => (img.onload = res));
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        blobToCopy = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blobToCopy,
        }),
      ]);
      setCopied(true);
      push("Image copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push("Unable to copy image directly. Please use Download.", "error");
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!splitRef.current) return;
    const rect = splitRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setSplitPos((x / rect.width) * 100);
  };

  const presets = [
    { label: "Max Savings", q: 45, badge: "Tiny Size" },
    { label: "Balanced", q: 72, badge: "Recommended" },
    { label: "High Quality", q: 88, badge: "Minimal Loss" },
  ];

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
            setPreview(null);
            setDimensions(null);
          }}
          hint="JPG, PNG, WebP, or AVIF"
        />

        {file && dimensions && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-xs">
            <span className="text-[var(--text-dim)]">
              Original: <strong className="text-[var(--text)] font-mono">{dimensions.w} × {dimensions.h}px</strong> · <strong className="text-[var(--text)] font-mono">{(file.size / 1024).toFixed(1)} KB</strong>
            </span>
            <Badge variant="accent">
              {(file.type.split("/")[1] || "IMAGE").toUpperCase()}
            </Badge>
          </div>
        )}

        {file && (
          <div className="mt-6 space-y-5">
            {/* Mode Tabs */}
            <Tabs
              value={mode}
              onChange={setMode}
              options={[
                { value: "quality", label: "Quality Level", icon: Sliders },
                { value: "target", label: "Target File Size", icon: Sparkles },
              ]}
            />

            {mode === "quality" ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Quality Preset
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{quality}%</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {presets.map((p) => (
                    <button
                      key={p.q}
                      type="button"
                      onClick={() => setQuality(p.q)}
                      className={`press p-2.5 rounded-xl border text-center transition-all ${
                        quality === p.q
                          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] shadow-[var(--shadow-sm)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-dim)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text)]">{p.label}</div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{p.q}%</div>
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={10}
                  max={95}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] h-2 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Target Maximum Size
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{targetKb} KB</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {[50, 100, 200, 500, 1000].map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => setTargetKb(kb)}
                      className={`press px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        targetKb === kb
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                      }`}
                    >
                      {kb < 1000 ? `${kb} KB` : "1 MB"}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={20}
                  max={Math.max(1000, Math.round(file.size / 1024))}
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] h-2 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Output Format Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "original", label: "Original" },
                  { id: "image/webp", label: "WebP (Best)" },
                  { id: "image/jpeg", label: "JPEG" },
                  { id: "image/png", label: "PNG" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id as FormatChoice)}
                    className={`press py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                      format === fmt.id
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent-bright)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)]"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-[var(--danger)] font-medium">{error}</p>}

            <div>
              <Button onClick={compress} disabled={busy} className="w-full sm:w-auto">
                {busy && <Loader2 size={16} className="animate-spin" />}
                {busy ? "Compressing in browser…" : result ? "Re-compress image" : "Compress image now"}
              </Button>
            </div>
          </div>
        )}

        {/* Results & Interactive Comparison */}
        {result && file && preview && (
          <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="success">Compressed Successfully</Badge>
                <Badge variant="accent">
                  -{Math.max(0, 100 - (result.size / file.size) * 100).toFixed(0)}% Smaller
                </Badge>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => setViewTab("split")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    viewTab === "split" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
                  }`}
                >
                  Interactive Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("side")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    viewTab === "side" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
                  }`}
                >
                  Side by Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("result")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    viewTab === "result" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
                  }`}
                >
                  Result Only
                </button>
              </div>
            </div>

            {/* Interactive Split Comparison */}
            {viewTab === "split" && (
              <div
                ref={splitRef}
                onPointerDown={(e) => {
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  handlePointerMove(e);
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerMove(e);
                }}
                className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-[var(--border)] select-none cursor-ew-resize bg-[var(--bg-elevated)]"
              >
                {/* Result Image (Full background) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="Compressed"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Original Image (Clipped overlay) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-[var(--accent)]"
                  style={{ width: `${splitPos}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ width: splitRef.current?.clientWidth || "100%", maxWidth: "none" }}
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider">
                    Original ({(file.size / 1024).toFixed(0)} KB)
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--accent-bright)] uppercase tracking-wider pointer-events-none">
                  Compressed ({(result.size / 1024).toFixed(0)} KB)
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[var(--accent)] pointer-events-none"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-xl flex items-center justify-center text-[var(--accent)] text-xs font-bold">
                    ↔
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-side mode */}
            {viewTab === "side" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                  <div className="flex justify-between text-xs text-[var(--text-dim)] mb-2 font-medium">
                    <span>Original</span>
                    <span className="font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="h-60 flex items-center justify-center overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Original" className="max-h-60 object-contain" />
                  </div>
                </div>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                  <div className="flex justify-between text-xs text-[var(--accent)] mb-2 font-semibold">
                    <span>Compressed</span>
                    <span className="font-mono">{(result.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="h-60 flex items-center justify-center overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.url} alt="Compressed" className="max-h-60 object-contain" />
                  </div>
                </div>
              </div>
            )}

            {/* Result only mode */}
            {viewTab === "result" && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                <div className="h-72 sm:h-96 flex items-center justify-center overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.url} alt="Compressed preview" className="max-h-full object-contain" />
                </div>
              </div>
            )}

            {/* Download and Copy Action Row */}
            <ResultBar celebrate>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                <div className="text-xs text-[var(--text-dim)]">
                  <span className="font-medium text-[var(--text)]">{result.name}</span>
                  <span className="ml-2 font-mono text-[var(--success)]">
                    {(file.size / 1024).toFixed(0)} KB → {(result.size / 1024).toFixed(0)} KB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={copyToClipboard}>
                    {copied ? <Check size={15} className="text-[var(--success)]" /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy Image"}
                  </Button>
                  <a href={result.url} download={result.name}>
                    <Button variant="primary">
                      <Download size={15} /> Download
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
