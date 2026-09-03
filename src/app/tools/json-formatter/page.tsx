"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, Sparkles, Minimize2 } from "lucide-react";

const tool = findTool("json-formatter")!;

export default function Page() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "nested": { "a": 1, "b": [1,2,3] }\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = (indent = 2) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste JSON here…"
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono resize-y outline-none focus:border-[var(--accent)] transition-colors"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => format(2)}>
            <Sparkles size={15} /> Format
          </Button>
          <Button variant="secondary" onClick={minify}>
            <Minimize2 size={15} /> Minify
          </Button>
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)] mt-4 font-mono">{error}</p>
        )}

        {output && !error && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--text-dim)]">Result</span>
              <Button variant="ghost" onClick={copy} className="px-2 py-1">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all text-[var(--accent)]">
              {output}
            </pre>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
