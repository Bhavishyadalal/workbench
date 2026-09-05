"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Copy, Check, Binary, Sparkles, Hash, Cpu } from "lucide-react";

const tool = findTool("base-converter")!;

const bases = [
  { label: "Binary (Base 2)", base: 2, regex: /^[01]*$/, prefix: "0b" },
  { label: "Octal (Base 8)", base: 8, regex: /^[0-7]*$/, prefix: "0o" },
  { label: "Decimal (Base 10)", base: 10, regex: /^[0-9]*$/, prefix: "" },
  { label: "Hexadecimal (Base 16)", base: 16, regex: /^[0-9a-fA-F]*$/, prefix: "0x" },
  { label: "Base 32", base: 32, regex: /^[0-9a-vA-V]*$/, prefix: "" },
  { label: "Base 36", base: 36, regex: /^[0-9a-zA-Z]*$/, prefix: "" },
];

export default function Page() {
  const { push } = useToast();
  const [decimal, setDecimal] = useState<number | null>(42);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const values = useMemo(() => {
    if (decimal === null || isNaN(decimal) || decimal < 0) return null;
    return bases.reduce((acc, b) => {
      acc[b.label] = decimal.toString(b.base).toUpperCase();
      return acc;
    }, {} as Record<string, string>);
  }, [decimal]);

  const handleChange = (base: number, regex: RegExp, raw: string) => {
    if (raw === "") {
      setDecimal(null);
      return;
    }
    if (!regex.test(raw)) return;
    const parsed = parseInt(raw, base);
    setDecimal(isNaN(parsed) ? null : Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, parsed)));
  };

  const copy = async (key: string, val: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    push(`Copied ${key}: ${val}`, "success");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 16-bit interactive binary toggle board
  const bits16 = useMemo(() => {
    const val = decimal ?? 0;
    const bits: number[] = [];
    for (let i = 15; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
    return bits;
  }, [decimal]);

  const toggleBit = (bitIndexFromLeft: number) => {
    const bitPosition = 15 - bitIndexFromLeft;
    const currentVal = decimal ?? 0;
    const nextVal = currentVal ^ (1 << bitPosition);
    setDecimal(nextVal);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Base Input Fields Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {bases.map((b) => {
            const val = values?.[b.label] ?? "";
            return (
              <div key={b.label} className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                    {b.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(b.label, val)}
                    disabled={!val}
                    className="p-1 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors disabled:opacity-30"
                    title={`Copy ${b.label}`}
                  >
                    {copiedKey === b.label ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="relative flex items-center">
                  {b.prefix && (
                    <span className="absolute left-3 font-mono text-xs text-[var(--text-dim)] select-none">
                      {b.prefix}
                    </span>
                  )}
                  <input
                    className={`${inputClass} font-mono font-bold !py-2 text-sm ${b.prefix ? "!pl-8" : ""}`}
                    value={val}
                    onChange={(e) => handleChange(b.base, b.regex, e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive 16-bit Binary Inspector */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
              <Cpu size={14} /> Interactive 16-Bit Register (Click bit to toggle)
            </span>
            <span className="text-xs font-mono text-[var(--accent)] font-bold">
              Value: {decimal ?? 0}
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            {bits16.map((bit, idx) => {
              const bitWeight = Math.pow(2, 15 - idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleBit(idx)}
                  className={`press flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    bit === 1
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 shadow-sm"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-dim)]"
                  }`}
                  title={`Bit 2^${15 - idx} (${bitWeight})`}
                >
                  <span
                    className={`font-mono text-base font-bold ${
                      bit === 1 ? "text-[var(--accent-bright)]" : "text-[var(--text-dim)]"
                    }`}
                  >
                    {bit}
                  </span>
                  <span className="text-[8px] font-mono text-[var(--text-dim)] mt-0.5 opacity-60">
                    2^{15 - idx}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Bitwise Operations */}
        {decimal !== null && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-3">
              Common Bitwise Operations
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-dim)] block uppercase">NOT (~x)</span>
                <span className="font-bold text-[var(--text)]">{(~decimal >>> 0).toString(10)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-dim)] block uppercase">Shift Left (x &lt;&lt; 1)</span>
                <span className="font-bold text-[var(--text)]">{(decimal << 1).toString(10)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-dim)] block uppercase">Shift Right (x &gt;&gt; 1)</span>
                <span className="font-bold text-[var(--text)]">{(decimal >> 1).toString(10)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-dim)] block uppercase">Parity</span>
                <span className="font-bold text-[var(--accent)]">{decimal % 2 === 0 ? "Even" : "Odd"}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
