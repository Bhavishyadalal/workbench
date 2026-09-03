"use client";

import { useState, useEffect, useCallback } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

const tool = findTool("image-rotate")!;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResult(null);
  };

  const render = useCallback(() => {
    if (!imgUrl) return;
    const img = new Image();
    img.onload = () => {
      const swap = rotation % 180 !== 0;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? img.height : img.width;
      canvas.height = swap ? img.width : img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      setResult(canvas.toDataURL(file?.type || "image/png"));
    };
    img.src = imgUrl;
  }, [imgUrl, rotation, flipH, flipV, file]);

  useEffect(() => {
    if (imgUrl) render();
  }, [imgUrl, rotation, flipH, flipV, render]);

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          file={file}
          onClear={() => {
            setFile(null);
            setImgUrl(null);
            setResult(null);
          }}
        />

        {result && (
          <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] max-h-72 flex items-center justify-center bg-[var(--bg-elevated)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="Preview" className="max-h-72 object-contain" />
          </div>
        )}

        {imgUrl && (
          <div className="flex flex-wrap gap-2 mt-5">
            <Button variant="secondary" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
              <RotateCcw size={15} /> Rotate left
            </Button>
            <Button variant="secondary" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw size={15} /> Rotate right
            </Button>
            <Button variant="secondary" onClick={() => setFlipH((v) => !v)}>
              <FlipHorizontal size={15} /> Flip horizontal
            </Button>
            <Button variant="secondary" onClick={() => setFlipV((v) => !v)}>
              <FlipVertical size={15} /> Flip vertical
            </Button>
          </div>
        )}

        {result && (
          <ResultBar>
            <a href={result} download={`rotated-${file?.name ?? "image.png"}`}>
              <Button>
                <Download size={15} /> Download
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
