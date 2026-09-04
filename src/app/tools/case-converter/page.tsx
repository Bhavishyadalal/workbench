"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Button } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check } from "lucide-react";

const tool = findTool("case-converter")!;

const transforms: Record<string, (s: string) => string> = {
  "UPPERCASE": (s) => s.toUpperCase(),
  "lowercase": (s) => s.toLowerCase(),
  "Title Case": (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
  "Sentence case": (s) =>
    s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  "camelCase": (s) =>
    s
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^./, (c) => c.toLowerCase()),
  "PascalCase": (s) =>
    s
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^./, (c) => c.toUpperCase()),
  "snake_case": (s) =>
    s
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase(),
  "kebab-case": (s) =>
    s
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase(),
};

export default function Page() {
  const { push } = useToast();
  const [text, setText] = useState("the quick brown fox jumps over the lazy dog");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    push("Copied to clipboard");
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm resize-y outline-none focus:border-[var(--accent)] transition-colors"
        />

        <div className="flex flex-col gap-2 mt-5">
          {Object.entries(transforms).map(([label, fn]) => {
            const value = text ? fn(text) : "";
            return (
              <div
                key={label}
                className="flex items-center justify-between gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[var(--text-dim)]">{label}</div>
                  <div className="text-sm truncate font-mono">{value || "—"}</div>
                </div>
                <Button variant="ghost" onClick={() => copy(label, value)} className="shrink-0 px-2">
                  {copied === label ? <Check size={15} /> : <Copy size={15} />}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </ToolShell>
  );
}
