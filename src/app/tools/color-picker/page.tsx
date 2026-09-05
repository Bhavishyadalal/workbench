"use client";

import { useState, useMemo, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Field, inputClass, Badge, CopyButton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, Pipette, Sparkles, Sliders, ShieldCheck, Palette, Layers } from "lucide-react";

const tool = findTool("color-picker")!;

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const m = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  if (!m || m.length < 6) return { r: 0, g: 0, b: 0 };
  const r = parseInt(m.substring(0, 2), 16) || 0;
  const g = parseInt(m.substring(2, 4), 16) || 0;
  const b = parseInt(m.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
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

function hslToRgb(h: number, s: number, l: number) {
  h = (h % 360) / 360;
  s = s / 100;
  l = l / 100;
  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max !== min) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((c - k) / (1 - k)) * 100),
    m: Math.round(((m - k) / (1 - k)) * 100),
    y: Math.round(((y - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }) {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const aestheticPresets = [
  { name: "Cyber Violet", hex: "#A855F7" },
  { name: "Electric Cyan", hex: "#06B6D4" },
  { name: "Neon Emerald", hex: "#10B981" },
  { name: "Sunset Rose", hex: "#F43F5E" },
  { name: "Solar Amber", hex: "#F59E0B" },
  { name: "Nordic Blue", hex: "#3B82F6" },
  { name: "Velvet Plum", hex: "#7E22CE" },
  { name: "Mint Frost", hex: "#2DD4BF" },
];

export default function Page() {
  const { push } = useToast();
  const [hex, setHex] = useState("#A855F7");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  useEffect(() => {
    setHasEyeDropper(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  const formats = useMemo(
    () => ({
      HEX: hex.toUpperCase(),
      RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      HSV: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      CMYK: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      "CSS Variable": `--color-primary: ${hex.toUpperCase()};`,
      "Tailwind Class": `bg-[${hex.toLowerCase()}]`,
    }),
    [hex, rgb, hsl, hsv, cmyk]
  );

  const whiteContrast = useMemo(() => getContrast(rgb, { r: 255, g: 255, b: 255 }), [rgb]);
  const blackContrast = useMemo(() => getContrast(rgb, { r: 0, g: 0, b: 0 }), [rgb]);

  // Harmonies
  const harmonies = useMemo(() => {
    const shift = (degrees: number, sMod = 0, lMod = 0) => {
      const newH = (hsl.h + degrees + 360) % 360;
      const newS = Math.max(0, Math.min(100, hsl.s + sMod));
      const newL = Math.max(0, Math.min(100, hsl.l + lMod));
      const r = hslToRgb(newH, newS, newL);
      return rgbToHex(r.r, r.g, r.b);
    };

    return [
      { name: "Complementary", colors: [hex, shift(180)] },
      { name: "Analogous", colors: [shift(-30), hex, shift(30)] },
      { name: "Triadic", colors: [hex, shift(120), shift(240)] },
      { name: "Split-Comp.", colors: [hex, shift(150), shift(210)] },
    ];
  }, [hex, hsl]);

  // Lightness Ramp
  const shades = useMemo(() => {
    return [10, 25, 40, 50, 60, 75, 90].map((l) => {
      const r = hslToRgb(hsl.h, hsl.s, l);
      return {
        lightness: l,
        hex: rgbToHex(r.r, r.g, r.b),
      };
    });
  }, [hsl]);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    push(`Copied ${key}: ${value}`, "success");
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const pickScreenColor = async () => {
    if (!hasEyeDropper) {
      push("EyeDropper is not supported in this browser", "error");
      return;
    }
    try {
      // @ts-expect-error EyeDropper is browser standard in modern Chrome/Edge
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        setHex(result.sRGBHex.toUpperCase());
        push(`Picked ${result.sRGBHex}`, "success");
      }
    } catch {}
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Main Color Header Block */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
          <div className="relative group shrink-0">
            <input
              type="color"
              value={hex.length === 7 ? hex : "#A855F7"}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-[var(--border)] cursor-pointer shadow-lg transition-transform group-hover:scale-105"
            />
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-[var(--text)]">
                {hex.toUpperCase()}
              </div>

              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={pickScreenColor}
                  className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  <Pipette size={14} className="text-[var(--accent)]" /> Pick from Screen
                </button>
              )}
            </div>

            {/* Input hex */}
            <div className="flex gap-2">
              <input
                className={`${inputClass} font-mono !py-2 !text-sm`}
                value={hex}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!v.startsWith("#")) v = "#" + v;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setHex(v.toUpperCase());
                }}
                placeholder="#A855F7"
              />
            </div>
          </div>
        </div>

        {/* Curated Swatches */}
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-2">
            Curated Swatches
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {aestheticPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setHex(preset.hex)}
                className={`press p-1.5 rounded-xl border text-center transition-all ${
                  hex.toLowerCase() === preset.hex.toLowerCase()
                    ? "border-[var(--accent)] bg-[var(--bg-elevated)] shadow-md"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-dim)]"
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg shadow-inner mb-1 border border-black/10"
                  style={{ background: preset.hex }}
                />
                <span className="text-[10px] font-medium text-[var(--text-dim)] truncate block">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Format Conversions */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-3">
            Color Formats & Code Snippets (1-Click Copy)
          </span>
          <div className="grid sm:grid-cols-2 gap-2">
            {Object.entries(formats).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => copy(key, value)}
                className="press flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-dim)] transition-all text-left group"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-bold text-[var(--text-dim)] tracking-wider uppercase">
                    {key}
                  </div>
                  <div className="text-xs font-mono font-medium text-[var(--text)] truncate mt-0.5 group-hover:text-[var(--accent-bright)]">
                    {value}
                  </div>
                </div>
                <div className="shrink-0 p-1 rounded-lg text-[var(--text-dim)] group-hover:text-[var(--accent)]">
                  {copiedField === key ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* WCAG Contrast Checker */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5 mb-3">
            <ShieldCheck size={14} /> WCAG 2.1 Contrast Checker
          </span>
          <div className="grid sm:grid-cols-2 gap-3">
            {/* White text */}
            <div
              className="p-4 rounded-xl flex items-center justify-between shadow-inner"
              style={{ background: hex, color: "#FFFFFF" }}
            >
              <div>
                <div className="font-bold text-sm">White Text on Color</div>
                <div className="text-xs opacity-90 font-mono mt-0.5">Ratio: {whiteContrast.toFixed(2)}:1</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${whiteContrast >= 4.5 ? "bg-white/25 text-white" : "bg-black/30 text-white/70"}`}>
                  AA {whiteContrast >= 4.5 ? "Pass" : "Fail"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${whiteContrast >= 7.0 ? "bg-white/25 text-white" : "bg-black/30 text-white/70"}`}>
                  AAA {whiteContrast >= 7.0 ? "Pass" : "Fail"}
                </span>
              </div>
            </div>

            {/* Black text */}
            <div
              className="p-4 rounded-xl flex items-center justify-between shadow-inner"
              style={{ background: hex, color: "#000000" }}
            >
              <div>
                <div className="font-bold text-sm">Black Text on Color</div>
                <div className="text-xs opacity-90 font-mono mt-0.5">Ratio: {blackContrast.toFixed(2)}:1</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${blackContrast >= 4.5 ? "bg-black/25 text-black" : "bg-white/30 text-black/70"}`}>
                  AA {blackContrast >= 4.5 ? "Pass" : "Fail"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${blackContrast >= 7.0 ? "bg-black/25 text-black" : "bg-white/30 text-black/70"}`}>
                  AAA {blackContrast >= 7.0 ? "Pass" : "Fail"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Color Harmonies */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5 mb-3">
            <Palette size={14} /> Color Harmonies
          </span>
          <div className="grid sm:grid-cols-2 gap-3">
            {harmonies.map((harmony) => (
              <div
                key={harmony.name}
                className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl"
              >
                <div className="text-xs font-bold text-[var(--text-dim)] mb-2">{harmony.name}</div>
                <div className="flex gap-2 h-12 rounded-lg overflow-hidden border border-[var(--border)] p-1 bg-[var(--bg-card)]">
                  {harmony.colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHex(c)}
                      className="press flex-1 h-full rounded-md transition-transform hover:scale-105 relative group"
                      style={{ background: c }}
                      title={`Click to use ${c}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 text-white font-mono text-[10px] font-bold rounded-md transition-opacity">
                        {c}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightness Ramp (Shades & Tints) */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5 mb-3">
            <Layers size={14} /> Tints & Shades Ramp (10% - 90%)
          </span>
          <div className="grid grid-cols-7 gap-1.5 h-14 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl">
            {shades.map((s) => (
              <button
                key={s.lightness}
                type="button"
                onClick={() => setHex(s.hex)}
                className="press h-full rounded-xl transition-transform hover:scale-105 relative group border border-black/15 overflow-hidden"
                style={{ background: s.hex }}
                title={`${s.lightness}% Lightness: ${s.hex}`}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white font-mono text-[9px] font-bold transition-opacity">
                  {s.lightness}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </ToolShell>
  );
}
