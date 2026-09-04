"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download } from "lucide-react";

const tool = findTool("image-watermark")!;
const positions = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "center", label: "Center" },
];

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© Your name");
  const [opacity, setOpacity] = useState(60);
  const [position, setPosition] = useState("bottom-right");
  const [fontSize, setFontSize] = useState(28);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  };

  const apply = () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      ctx.font = `700 ${fontSize}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${opacity / 100})`;
      ctx.strokeStyle = `rgba(0,0,0,${opacity / 200})`;
      ctx.lineWidth = 2;
      const metrics = ctx.measureText(text);
      const pad = 24;
      let x = pad;
      let y = fontSize + pad;
      if (position.includes("right")) x = canvas.width - metrics.width - pad;
      if (position === "center") {
        x = (canvas.width - metrics.width) / 2;
        y = canvas.height / 2;
      }
      if (position.includes("bottom") && position !== "center") y = canvas.height - pad;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      setResult(canvas.toDataURL(file.type || "image/png"));
      push("Watermark applied", "success");
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          hint="PNG, JPG, or WebP"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <Field label="Watermark text">
            <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <Field label="Position">
            <select className={inputClass} value={position} onChange={(e) => setPosition(e.target.value)}>
              {positions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`Opacity — ${opacity}%`}>
            <input
              type="range"
              min={10}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
          <Field label={`Font size — ${fontSize}px`}>
            <input
              type="range"
              min={12}
              max={80}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Button onClick={apply} disabled={!file}>
            Add watermark
          </Button>
        </div>

        {result && (
          <>
            <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] max-h-72 flex items-center justify-center bg-[var(--bg-elevated)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result} alt="Watermarked preview" className="max-h-72 object-contain" />
            </div>
            <ResultBar celebrate>
              <a href={result} download={`watermarked-${file?.name ?? "image.png"}`}>
                <Button variant="secondary">
                  <Download size={15} /> Download
                </Button>
              </a>
            </ResultBar>
          </>
        )}
      </Card>
    </ToolShell>
  );
}
