"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download, Loader2 } from "lucide-react";

const tool = findTool("pdf-split")!;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setError("");
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setPageCount(doc.getPageCount());
      setRange(`1-${doc.getPageCount()}`);
    } catch {
      setError("Couldn't read that PDF.");
    }
  };

  const parseRange = (input: string, max: number): number[] => {
    const out = new Set<number>();
    for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)-(\d+)$/);
      if (m) {
        const start = Math.max(1, parseInt(m[1]));
        const end = Math.min(max, parseInt(m[2]));
        for (let i = start; i <= end; i++) out.add(i - 1);
      } else if (/^\d+$/.test(part)) {
        const n = parseInt(part);
        if (n >= 1 && n <= max) out.add(n - 1);
      }
    }
    return Array.from(out).sort((a, b) => a - b);
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const indices = parseRange(range, pageCount);
      if (indices.length === 0) {
        setError("That page range didn't match any pages.");
        setBusy(false);
        return;
      }
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      setResult(URL.createObjectURL(blob));
    } catch {
      setError("Something went wrong splitting that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="application/pdf"
          hint="Choose which pages to extract after uploading"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
            setPageCount(0);
          }}
        />

        {pageCount > 0 && (
          <div className="mt-5">
            <Field label={`Pages to extract (this PDF has ${pageCount})`}>
              <input
                className={inputClass}
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-10"
              />
            </Field>
          </div>
        )}

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={split} disabled={!file || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Splitting…" : "Extract pages"}
          </Button>
        </div>

        {result && (
          <ResultBar>
            <a href={result} download="extracted.pdf">
              <Button variant="secondary">
                <Download size={15} /> Download extracted.pdf
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
