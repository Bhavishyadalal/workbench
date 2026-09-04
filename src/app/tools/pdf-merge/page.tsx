"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2, GripVertical, X } from "lucide-react";

const tool = findTool("pdf-merge")!;

export default function Page() {
  const { push } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) return;
    setBusy(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult(URL.createObjectURL(blob));
      push(`Merged ${files.length} PDFs`, "success");
    } catch {
      setError("Couldn't merge those files. Make sure they're all valid PDFs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone onFiles={addFiles} accept="application/pdf" multiple hint="Add two or more PDFs, in any order" />

        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2"
              >
                <GripVertical size={14} className="text-[var(--text-dim)] shrink-0" />
                <span className="text-sm truncate flex-1">{f.name}</span>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 px-1"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === files.length - 1}
                  className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 px-1"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeAt(i)}
                  aria-label="Remove"
                  className="text-[var(--text-dim)] hover:text-[var(--danger)] p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={merge} disabled={files.length < 2 || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Merging…" : `Merge ${files.length || ""} PDFs`}
          </Button>
        </div>

        {result && (
          <ResultBar celebrate>
            <a href={result} download="merged.pdf">
              <Button variant="secondary">
                <Download size={15} /> Download merged.pdf
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
