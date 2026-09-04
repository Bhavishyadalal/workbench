"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download } from "lucide-react";

const tool = findTool("image-convert")!;
const formats = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState(formats[0].value);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  };

  const convert = () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (format === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      setResult(canvas.toDataURL(format, 0.92));
    };
    img.src = URL.createObjectURL(file);
  };

  const chosenExt = formats.find((f) => f.value === format)!.ext;

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          hint="PNG, JPG, WebP, or GIF"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />

        <div className="mt-5">
          <Field label="Convert to">
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    format === f.value
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <Button onClick={convert} disabled={!file}>
            Convert image
          </Button>
        </div>

        {result && (
          <ResultBar>
            <span className="text-sm text-[var(--text-dim)]">Ready as {chosenExt.toUpperCase()}</span>
            <a href={result} download={`converted.${chosenExt}`}>
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
