"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Button, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, Sparkles, Minimize2, ArrowDownAZ, Download, Search, AlertCircle, FileCode, Trash2 } from "lucide-react";

const tool = findTool("json-formatter")!;

const samples = {
  user: `{
  "id": 1042,
  "username": "alex_mercer",
  "email": "alex@workbench.dev",
  "active": true,
  "role": "admin",
  "preferences": {
    "theme": "dark",
    "notifications": { "email": true, "push": false },
    "tags": ["developer", "nextjs", "typescript"]
  }
}`,
  api: `{
  "status": "success",
  "code": 200,
  "meta": { "total": 2, "page": 1, "per_page": 10 },
  "data": [
    { "id": "tx_01", "amount": 149.99, "currency": "USD", "settled": true },
    { "id": "tx_02", "amount": 89.00, "currency": "EUR", "settled": false }
  ]
}`,
  config: `{
  "app": "Workbench OS",
  "version": "2.4.0",
  "environment": "production",
  "security": {
    "cors": ["https://app.domain.com"],
    "rate_limit": 1000,
    "ssl_enabled": true
  }
}`,
};

function sortKeysDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortKeysDeep(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

function computeMetrics(obj: any) {
  let keysCount = 0;
  let objectsCount = 0;
  let arraysCount = 0;
  let maxDepth = 0;

  function traverse(item: any, depth = 1) {
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(item)) {
      arraysCount++;
      item.forEach((el) => traverse(el, depth + 1));
    } else if (item !== null && typeof item === "object") {
      objectsCount++;
      const keys = Object.keys(item);
      keysCount += keys.length;
      keys.forEach((k) => traverse(item[k], depth + 1));
    }
  }

  traverse(obj);
  return { keysCount, objectsCount, arraysCount, maxDepth };
}

export default function Page() {
  const { push } = useToast();
  const [input, setInput] = useState(samples.user);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState<number | string>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const format = (indentSpaces: number | string = indent, sort: boolean = sortKeys) => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      let parsed = JSON.parse(input);
      if (sort) {
        parsed = sortKeysDeep(parsed);
      }
      const formatted = JSON.stringify(parsed, null, indentSpaces);
      setOutput(formatted);
      setError(null);
      push("Formatted successfully", "success");
    } catch (e: any) {
      setError(e?.message || "Invalid JSON syntax");
      setOutput("");
    }
  };

  const minify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
      push("JSON minified", "success");
    } catch (e: any) {
      setError(e?.message || "Invalid JSON syntax");
      setOutput("");
    }
  };

  const copy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    push("Copied JSON to clipboard", "success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadJson = () => {
    const textToDownload = output || input;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
    push("Downloaded data.json", "success");
  };

  const metrics = useMemo(() => {
    try {
      if (!input.trim()) return null;
      const parsed = JSON.parse(input);
      const computed = computeMetrics(parsed);
      const rawBytes = new Blob([input]).size;
      const minifiedBytes = new Blob([JSON.stringify(parsed)]).size;
      return { ...computed, rawBytes, minifiedBytes };
    } catch {
      return null;
    }
  }, [input]);

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim() || !output) return 0;
    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      return (output.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [searchQuery, output]);

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Sample Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] font-medium">
            <FileCode size={14} className="text-[var(--accent)]" /> Samples:
            <button
              onClick={() => { setInput(samples.user); setOutput(""); setError(null); }}
              className="px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] hover:text-[var(--accent)] transition-colors border border-[var(--border)]"
            >
              User
            </button>
            <button
              onClick={() => { setInput(samples.api); setOutput(""); setError(null); }}
              className="px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] hover:text-[var(--accent)] transition-colors border border-[var(--border)]"
            >
              API
            </button>
            <button
              onClick={() => { setInput(samples.config); setOutput(""); setError(null); }}
              className="px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] hover:text-[var(--accent)] transition-colors border border-[var(--border)]"
            >
              Config
            </button>
          </div>

          <button
            onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="text-xs text-[var(--text-dim)] hover:text-[var(--danger)] flex items-center gap-1 transition-colors"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            rows={10}
            spellCheck={false}
            placeholder="Paste raw JSON here…"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-sm font-mono resize-y outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => format(indent, sortKeys)}>
              <Sparkles size={15} /> Format
            </Button>
            <Button variant="secondary" onClick={minify}>
              <Minimize2 size={15} /> Minify
            </Button>
            
            {/* Indent Selector */}
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] text-xs">
              {[
                { val: 2, label: "2sp" },
                { val: 4, label: "4sp" },
                { val: "\t", label: "Tab" },
              ].map((opt) => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => {
                    setIndent(opt.val);
                    format(opt.val, sortKeys);
                  }}
                  className={`px-2 py-1 rounded-lg font-mono font-medium transition-all ${
                    indent === opt.val
                      ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort Keys Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !sortKeys;
                setSortKeys(next);
                format(indent, next);
              }}
              className={`press px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sortKeys
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <ArrowDownAZ size={14} /> Sort Keys (A-Z)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={downloadJson} disabled={!input.trim()}>
              <Download size={14} /> Export JSON
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,var(--bg-elevated))] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] flex items-start gap-2.5 text-xs text-[var(--danger)] font-mono">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">JSON Syntax Error:</div>
              <div className="mt-0.5 opacity-90">{error}</div>
            </div>
          </div>
        )}

        {/* Metrics Bar */}
        {metrics && !error && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl text-xs font-mono">
            <div>
              <span className="text-[var(--text-dim)] block text-[10px] uppercase font-sans font-semibold">Size</span>
              <span className="font-bold text-[var(--text)]">{(metrics.rawBytes / 1024).toFixed(1)} KB</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)] block text-[10px] uppercase font-sans font-semibold">Minified</span>
              <span className="font-bold text-[var(--success)]">{(metrics.minifiedBytes / 1024).toFixed(1)} KB</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)] block text-[10px] uppercase font-sans font-semibold">Keys</span>
              <span className="font-bold text-[var(--accent)]">{metrics.keysCount}</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)] block text-[10px] uppercase font-sans font-semibold">Objects / Arrays</span>
              <span className="font-bold text-[var(--text)]">{metrics.objectsCount} / {metrics.arraysCount}</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)] block text-[10px] uppercase font-sans font-semibold">Max Depth</span>
              <span className="font-bold text-[var(--text)]">{metrics.maxDepth} levels</span>
            </div>
          </div>
        )}

        {/* Formatted Output */}
        {output && !error && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="accent">Valid JSON</Badge>
                {searchMatches > 0 && (
                  <Badge variant="success">{searchMatches} match{searchMatches !== 1 ? "es" : ""}</Badge>
                )}
              </div>

              {/* In-JSON Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in JSON…"
                    className="pl-8 pr-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-xs font-mono outline-none focus:border-[var(--accent)] w-36 sm:w-48"
                  />
                </div>

                <Button variant="ghost" onClick={copy} className="!px-3 !py-1.5 text-xs">
                  {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <pre className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[480px] text-[var(--accent-bright)] selection:bg-[var(--accent)] selection:text-[var(--accent-ink)]">
              {output}
            </pre>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
