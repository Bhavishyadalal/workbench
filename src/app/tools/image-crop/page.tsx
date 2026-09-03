"use client";

import { useState, useRef, useCallback } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download } from "lucide-react";

const tool = findTool("image-crop")!;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState<Box>({ x: 20, y: 20, w: 60, h: 60 }); // percentages
  const [result, setResult] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; box: Box } | null>(null);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.width, h: img.height });
    img.src = url;
    setBox({ x: 15, y: 15, w: 70, h: 70 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, box };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - dragState.current.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragState.current.startY) / rect.height) * 100;
      const base = dragState.current.box;
      let x = base.x + dxPct;
      let y = base.y + dyPct;
      x = Math.max(0, Math.min(100 - base.w, x));
      y = Math.max(0, Math.min(100 - base.h, y));
      setBox({ ...base, x, y });
    },
    []
  );

  const resizeHandle = (corner: "se") => (e: React.PointerEvent) => {
    e.stopPropagation();
    const startBox = box;
    const startX = e.clientX;
    const startY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startY) / rect.height) * 100;
      const w = Math.max(10, Math.min(100 - startBox.x, startBox.w + dxPct));
      const h = Math.max(10, Math.min(100 - startBox.y, startBox.h + dyPct));
      setBox({ ...startBox, w, h });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const crop = () => {
    if (!file || !imgUrl) return;
    const img = new Image();
    img.onload = () => {
      const sx = (box.x / 100) * img.width;
      const sy = (box.y / 100) * img.height;
      const sw = (box.w / 100) * img.width;
      const sh = (box.h / 100) * img.height;
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      setResult(canvas.toDataURL(file.type || "image/png"));
    };
    img.src = imgUrl;
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {!imgUrl && (
          <Dropzone onFiles={handleFile} accept="image/*" file={file} hint="Drag the corner to crop" />
        )}

        {imgUrl && (
          <>
            <div
              ref={containerRef}
              className="relative w-full max-h-[420px] overflow-hidden rounded-xl border border-[var(--border)] select-none touch-none"
              style={{ aspectRatio: naturalSize.w && naturalSize.h ? `${naturalSize.w}/${naturalSize.h}` : "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="To crop" className="w-full h-full object-contain pointer-events-none" draggable={false} />
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => (dragState.current = null)}
                className="absolute border-2 border-[var(--accent)] bg-[var(--accent)]/10 cursor-move"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
              >
                <div
                  onPointerDown={resizeHandle("se")}
                  className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full bg-[var(--accent)] cursor-se-resize border-2 border-[var(--bg)]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button onClick={crop}>Crop image</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setImgUrl(null);
                  setResult(null);
                }}
              >
                Choose different image
              </Button>
            </div>
          </>
        )}

        {result && (
          <ResultBar>
            <a href={result} download={`cropped-${file?.name ?? "image.png"}`}>
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
