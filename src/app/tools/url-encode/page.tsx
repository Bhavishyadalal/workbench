"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, ArrowDownUp } from "lucide-react";

const tool = findTool("url-encode")!;

export default function Page() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      const out = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
      return { output: out, error: "" };
    } catch {
      return { output: "", error: "That doesn't look like valid encoded text." };
    }
  }, [input, mode]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("encode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "encode" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "decode" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"
            }`}
          >
            Decode
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={mode === "encode" ? "Paste a URL or text to encode…" : "Paste encoded text to decode…"}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-y"
        />

        <div className="flex justify-center my-3 text-[var(--text-dim)]">
          <ArrowDownUp size={16} />
        </div>

        <textarea
          readOnly
          value={output}
          rows={4}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--accent)] outline-none resize-y"
        />

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-4">
          <Button variant="secondary" onClick={copy} disabled={!output}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy result"}
          </Button>
        </div>
      </Card>
    </ToolShell>
  );
}
