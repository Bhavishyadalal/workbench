"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const tool = findTool("pdf-compress")!;

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(60);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError("");
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const pdfjsLib = (await import("@/lib/pdfjs")).default;
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const out = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const jpegUrl = canvas.toDataURL("image/jpeg", quality / 100);
        const jpegBytes = await fetch(jpegUrl).then((r) => r.arrayBuffer());
        const img = await out.embedJpg(jpegBytes);
        const pdfPage = out.addPage([viewport.width, viewport.height]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const outBytes = await out.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      setResult({ url: URL.createObjectURL(blob), size: blob.size });
      const pct = Math.max(0, 100 - (blob.size / file.size) * 100);
      push(`Saved ${pct.toFixed(0)}% — PDF compressed`, "success");
    } catch {
      setError("Couldn't compress that PDF. Try a different file.");
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
          hint="Works best on scanned or image-heavy PDFs"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />

        <p className="text-xs text-[var(--text-dim)] mt-4">
          Pages are re-rendered as compressed images — great for shrinking scanned or
          image-heavy PDFs. Text won&apos;t stay selectable afterward.
        </p>

        <div className="mt-4">
          <Field label={`Quality — ${quality}%`}>
            <input
              type="range"
              min={20}
              max={90}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={compress} disabled={!file || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? `Compressing… ${progress}%` : "Compress PDF"}
          </Button>
          {busy && (
            <div className="mt-3 h-1 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent)]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
          )}
        </div>

        {result && (
          <ResultBar celebrate>
            <span className="text-sm text-[var(--text-dim)]">
              {(file!.size / 1024).toFixed(0)} KB → {(result.size / 1024).toFixed(0)} KB
              <span className="text-[var(--accent)] ml-1.5">
                (-{Math.max(0, 100 - (result.size / file!.size) * 100).toFixed(0)}%)
              </span>
            </span>
            <a href={result.url} download={`compressed-${file?.name ?? "file.pdf"}`}>
              <Button variant="secondary">
                <Download size={15} /> Download
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
