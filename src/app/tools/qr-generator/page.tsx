"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import ToolShell from "@/components/ToolShell";
import { Card, Field, Button, inputClass, Skeleton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download } from "lucide-react";

const tool = findTool("qr-generator")!;

export default function Page() {
  const { push } = useToast();
  const [text, setText] = useState("https://example.com");
  const [color, setColor] = useState("#F2EFE6");
  const [bg, setBg] = useState("#0D0C0A");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!text.trim()) {
      setDataUrl(null);
      setRendering(false);
      return;
    }
    setRendering(true);
    QRCode.toCanvas(
      canvasRef.current,
      text,
      { width: 280, margin: 2, color: { dark: color, light: bg } },
      (err) => {
        if (!err && canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL("image/png"));
        }
        setRendering(false);
      }
    );
  }, [text, color, bg]);

  return (
    <ToolShell tool={tool}>
      <Card>
        <Field label="Text or URL">
          <input
            className={inputClass}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setText("");
            }}
            placeholder="https://…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Foreground">
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] bg-transparent cursor-pointer" />
              <span className="text-xs text-[var(--text-dim)] font-mono">{color}</span>
            </div>
          </Field>
          <Field label="Background">
            <div className="flex items-center gap-2">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] bg-transparent cursor-pointer" />
              <span className="text-xs text-[var(--text-dim)] font-mono">{bg}</span>
            </div>
          </Field>
        </div>

        <div className="relative flex justify-center mt-6 p-6 rounded-xl border border-[var(--border)]" style={{ background: bg }}>
          {rendering && (
            <Skeleton className="absolute inset-6 rounded-lg" />
          )}
          <canvas
            ref={canvasRef}
            className="rounded-lg transition-opacity duration-200"
            style={{ opacity: rendering ? 0 : 1 }}
          />
        </div>

        {dataUrl && (
          <div className="mt-5">
            <a
              href={dataUrl}
              download="qrcode.png"
              onClick={() => push("QR code downloaded", "success")}
            >
              <Button variant="secondary">
                <Download size={15} /> Download PNG
              </Button>
            </a>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
