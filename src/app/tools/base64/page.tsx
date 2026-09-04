"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Button } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, ArrowDownUp } from "lucide-react";

const tool = findTool("base64")!;

export default function Page() {
  const { push } = useToast();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello, world!");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  let output = "";
  try {
    output = mode === "encode" ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
    if (error) setError("");
  } catch {
    output = "";
  }

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    push("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("encode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "encode"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-dim)]"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "decode"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-dim)]"
            }`}
          >
            Decode
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setInput("");
          }}
          rows={5}
          placeholder={mode === "encode" ? "Plain text…" : "Base64 text…"}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono resize-y outline-none focus:border-[var(--accent)] transition-colors"
        />
        <p className="hidden sm:block text-xs text-[var(--text-dim)] mt-1.5">
          <kbd>Esc</kbd> to clear
        </p>

        <div className="flex justify-center my-3 text-[var(--text-dim)]">
          <ArrowDownUp size={16} />
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={output}
            rows={5}
            placeholder={!input ? "" : "That doesn't look like valid Base64."}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono resize-y outline-none"
          />
          {output && (
            <Button variant="ghost" onClick={copy} className="absolute top-2 right-2 px-2 py-1 bg-[var(--bg-card)]">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          )}
        </div>
      </Card>
    </ToolShell>
  );
}
