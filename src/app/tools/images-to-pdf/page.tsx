"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2, X } from "lucide-react";

const tool = findTool("images-to-pdf")!;

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

  const removeAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const build = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const isPng = file.type.includes("png");
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult(URL.createObjectURL(blob));
      push(`Built a ${files.length}-page PDF`, "success");
    } catch {
      setError("Couldn't build a PDF from those images. JPG and PNG work best.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone onFiles={addFiles} accept="image/png,image/jpeg" multiple hint="JPG or PNG, one page per image" />

        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2"
              >
                <span className="text-sm truncate flex-1">
                  {i + 1}. {f.name}
                </span>
                <button onClick={() => removeAt(i)} className="text-[var(--text-dim)] hover:text-[var(--danger)] p-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={build} disabled={files.length === 0 || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Building PDF…" : "Create PDF"}
          </Button>
        </div>

        {result && (
          <ResultBar celebrate>
            <a href={result} download="images.pdf">
              <Button variant="secondary">
                <Download size={15} /> Download images.pdf
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
