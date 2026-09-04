"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check } from "lucide-react";

const tool = findTool("color-picker")!;

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return { r: 0, g: 0, b: 0 };
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function Page() {
  const { push } = useToast();
  const [hex, setHex] = useState("#E8A33D");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  const formats = {
    HEX: hex.toUpperCase(),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    push("Copied to clipboard");
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1200);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-20 h-20 rounded-2xl border border-[var(--border)] bg-transparent cursor-pointer"
          />
          <div
            className="flex-1 h-20 rounded-2xl border border-[var(--border)]"
            style={{ background: hex }}
          />
        </div>

        <div className="mt-5">
          <Field label="Hex value">
            <input
              className={`${inputClass} font-mono`}
              value={hex}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setHex(v);
              }}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 mt-5">
          {Object.entries(formats).map(([key, value]) => (
            <button
              key={key}
              onClick={() => copy(key, value)}
              className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 hover:border-[var(--accent-dim)] transition-colors text-left"
            >
              <div>
                <div className="text-[10px] text-[var(--text-dim)] font-medium">{key}</div>
                <div className="text-sm font-mono mt-0.5">{value}</div>
              </div>
              {copiedField === key ? <Check size={16} className="text-[var(--accent)]" /> : <Copy size={16} className="text-[var(--text-dim)]" />}
            </button>
          ))}
        </div>
      </Card>
    </ToolShell>
  );
}
