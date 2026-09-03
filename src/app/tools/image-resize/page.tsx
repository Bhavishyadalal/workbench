"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download, Lock, Unlock } from "lucide-react";

const tool = findTool("image-resize")!;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    if (lockRatio && origDims) {
      setHeight(Math.round((v / origDims.w) * origDims.h));
    }
  };

  const onHeightChange = (v: number) => {
    setHeight(v);
    if (lockRatio && origDims) {
      setWidth(Math.round((v / origDims.h) * origDims.w));
    }
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
      ctx.drawImage(img, 0, 0, width, height);
      setResult(canvas.toDataURL(file.type || "image/png"));
    };
    img.src = URL.createObjectURL(file);
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
            setOrigDims(null);
          }}
        />

        {origDims && (
          <>
            <p className="text-xs text-[var(--text-dim)] mt-4">
              Original: {origDims.w} × {origDims.h}px
            </p>
            <div className="flex items-end gap-3 mt-3">
              <Field label="Width (px)">
                <input
                  type="number"
                  className={inputClass}
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                />
              </Field>
              <button
                onClick={() => setLockRatio((v) => !v)}
                aria-label="Toggle lock aspect ratio"
                className="mb-2.5 p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
                title={lockRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                {lockRatio ? <Lock size={15} /> : <Unlock size={15} />}
              </button>
              <Field label="Height (px)">
                <input
                  type="number"
                  className={inputClass}
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Button onClick={resize}>Resize image</Button>
            </div>
          </>
        )}

        {result && (
          <ResultBar>
            <span className="text-sm text-[var(--text-dim)]">
              {width} × {height}px
            </span>
            <a href={result} download={`resized-${file?.name ?? "image.png"}`}>
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
