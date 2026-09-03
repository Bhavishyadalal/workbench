"use client";

import { useState, useMemo, useCallback } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, Button } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, RefreshCw } from "lucide-react";

const tool = findTool("password-generator")!;

const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function strengthLabel(length: number, poolSize: number) {
  const entropy = length * Math.log2(poolSize || 1);
  if (entropy < 40) return { label: "Weak", color: "var(--danger)" };
  if (entropy < 70) return { label: "Okay", color: "var(--warn)" };
  if (entropy < 100) return { label: "Strong", color: "var(--accent)" };
  return { label: "Very strong", color: "var(--accent)" };
}

export default function Page() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const pool = useMemo(() => {
    let p = "";
    if (useLower) p += sets.lower;
    if (useUpper) p += sets.upper;
    if (useNumbers) p += sets.numbers;
    if (useSymbols) p += sets.symbols;
    return p;
  }, [useLower, useUpper, useNumbers, useSymbols]);

  const generate = useCallback(() => {
    if (!pool) {
      setPassword("");
      return;
    }
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const pass = Array.from(arr, (n) => pool[n % pool.length]).join("");
    setPassword(pass);
  }, [pool, length]);

  useMemo(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, length]);

  const strength = strengthLabel(length, pool.length);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggle = (
    label: string,
    checked: boolean,
    setChecked: (v: boolean) => void
  ) => (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-4 h-4 accent-[var(--accent)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3.5">
          <span className="flex-1 font-mono text-base sm:text-lg break-all">{password || "—"}</span>
          <button onClick={generate} aria-label="Regenerate" className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={copy} aria-label="Copy password" className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: strength.color }} />
          <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
        </div>

        <div className="mt-6">
          <Field label={`Length — ${length}`}>
            <input
              type="range"
              min={6}
              max={48}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {toggle("Lowercase (a-z)", useLower, setUseLower)}
          {toggle("Uppercase (A-Z)", useUpper, setUseUpper)}
          {toggle("Numbers (0-9)", useNumbers, setUseNumbers)}
          {toggle("Symbols (!@#…)", useSymbols, setUseSymbols)}
        </div>

        <div className="mt-5">
          <Button onClick={generate} disabled={!pool}>Generate new password</Button>
        </div>
      </Card>
    </ToolShell>
  );
}
