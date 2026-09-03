"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download, Loader2 } from "lucide-react";

const tool = findTool("image-compress")!;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(70);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setError("");
    setPreview(URL.createObjectURL(f));
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: Math.max(0.05, (file.size / 1024 / 1024) * (quality / 100)),
        useWebWorker: true,
        initialQuality: quality / 100,
      });
      const url = URL.createObjectURL(compressed);
      setResult({ url, size: compressed.size, name: file.name });
    } catch {
      setError("Couldn't compress that image. Try a different file.");
    } finally {
      setBusy(false);
    }
  };

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
          }}
          hint="JPG, PNG, or WebP"
        />

        {preview && (
          <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] max-h-64 flex items-center justify-center bg-[var(--bg-elevated)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-64 object-contain" />
          </div>
        )}

        <div className="mt-5">
          <Field label={`Quality — ${quality}%`}>
            <input
              type="range"
              min={10}
              max={95}
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
            {busy ? "Compressing…" : "Compress image"}
          </Button>
        </div>

        {result && (
          <ResultBar>
            <span className="text-sm text-[var(--text-dim)]">
              {(file!.size / 1024).toFixed(0)} KB → {(result.size / 1024).toFixed(0)} KB
              <span className="text-[var(--accent)] ml-1.5">
                (-{Math.max(0, 100 - (result.size / file!.size) * 100).toFixed(0)}%)
              </span>
            </span>
            <a href={result.url} download={`compressed-${result.name}`}>
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
