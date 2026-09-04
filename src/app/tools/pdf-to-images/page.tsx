"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar, Skeleton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Loader2 } from "lucide-react";

const tool = findTool("pdf-to-images")!;

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setImages([]);
    setError("");
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pdfjsLib = (await import("@/lib/pdfjs")).default;
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const urls: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        urls.push(canvas.toDataURL("image/png"));
      }
      setImages(urls);
      push(`Rendered ${urls.length} page${urls.length !== 1 ? "s" : ""}`, "success");
    } catch {
      setError("Couldn't render that PDF. Try a different file.");
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
          hint="Each page exports as a separate PNG"
          file={file}
          onClear={() => {
            setFile(null);
            setImages([]);
          }}
        />

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={convert} disabled={!file || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Rendering pages…" : "Convert to images"}
          </Button>
        </div>

        {busy && images.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        )}

        {images.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 success-burst rounded-lg">
              {images.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  download={`page-${i + 1}.png`}
                  className="group relative rounded-lg overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Download size={18} className="text-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {i + 1}
                  </span>
                </a>
              ))}
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-3">Click any page to download it.</p>
          </>
        )}
      </Card>
    </ToolShell>
  );
}
