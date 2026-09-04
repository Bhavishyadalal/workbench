"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2, RotateCw } from "lucide-react";

const tool = findTool("pdf-rotate")!;

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError("");
  };

  const rotate = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach((page) => {
        const current = page.getRotation().angle;
        page.setRotation(degrees(current + angle));
      });
      const outBytes = await doc.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      setResult(URL.createObjectURL(blob));
      push("PDF rotated", "success");
    } catch {
      setError("Couldn't rotate that PDF.");
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
          hint="Rotate individual pages or the whole document"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />

        <div className="flex gap-2 mt-5">
          {[90, 180, 270].map((a) => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                angle === a
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <RotateCw size={14} /> {a}°
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={rotate} disabled={!file || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Rotating…" : "Rotate all pages"}
          </Button>
        </div>

        {result && (
          <ResultBar celebrate>
            <a href={result} download={`rotated-${file?.name ?? "file.pdf"}`}>
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
