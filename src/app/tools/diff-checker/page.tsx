"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, Button, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { ArrowLeftRight, Copy, Check, Download, Sparkles, FileDiff, Columns, AlignLeft } from "lucide-react";

const tool = findTool("diff-checker")!;

interface DiffLine {
  type: "same" | "removed" | "added" | "modified";
  leftNum?: number;
  rightNum?: number;
  leftText?: string;
  rightText?: string;
  text: string;
}

const sampleOriginal = `function calculateDiscount(user, cart) {
  let discount = 0;
  if (user.isVip) {
    discount = 0.15;
  }
  return cart.total * (1 - discount);
}`;

const sampleModified = `function calculateDiscount(user, cart) {
  // Apply promotional discount based on membership tier
  let discount = 0.05;
  if (user.tier === 'vip') {
    discount = 0.20;
  } else if (user.tier === 'pro') {
    discount = 0.10;
  }
  return Number((cart.total * (1 - discount)).toFixed(2));
}`;

function diffLines(a: string[], b: string[], ignoreWs: boolean, ignoreCase: boolean): DiffLine[] {
  const normalize = (s: string) => {
    let res = s;
    if (ignoreWs) res = res.replace(/\s+/g, " ").trim();
    if (ignoreCase) res = res.toLowerCase();
    return res;
  };

  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = normalize(a[i]) === normalize(b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0, j = 0;
  let lineA = 1, lineB = 1;

  while (i < n && j < m) {
    if (normalize(a[i]) === normalize(b[j])) {
      result.push({ type: "same", leftNum: lineA, rightNum: lineB, text: a[i], leftText: a[i], rightText: b[j] });
      i++; j++; lineA++; lineB++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", leftNum: lineA, text: a[i], leftText: a[i] });
      i++; lineA++;
    } else {
      result.push({ type: "added", rightNum: lineB, text: b[j], rightText: b[j] });
      j++; lineB++;
    }
  }
  while (i < n) {
    result.push({ type: "removed", leftNum: lineA, text: a[i], leftText: a[i] });
    i++; lineA++;
  }
  while (j < m) {
    result.push({ type: "added", rightNum: lineB, text: b[j], rightText: b[j] });
    j++; lineB++;
  }
  return result;
}

export default function Page() {
  const { push } = useToast();
  const [left, setLeft] = useState(sampleOriginal);
  const [right, setRight] = useState(sampleModified);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    return diffLines(left.split("\n"), right.split("\n"), ignoreWs, ignoreCase);
  }, [left, right, ignoreWs, ignoreCase]);

  const addedCount = diff.filter((d) => d.type === "added").length;
  const removedCount = diff.filter((d) => d.type === "removed").length;
  const sameCount = diff.filter((d) => d.type === "same").length;

  const swap = () => {
    const temp = left;
    setLeft(right);
    setRight(temp);
  };

  const copyPatch = async () => {
    const patch = diff
      .map((d) => `${d.type === "added" ? "+" : d.type === "removed" ? "-" : " "} ${d.text}`)
      .join("\n");
    await navigator.clipboard.writeText(patch);
    push("Unified diff copied to clipboard", "success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadPatch = () => {
    const patch = diff
      .map((d) => `${d.type === "added" ? "+" : d.type === "removed" ? "-" : " "} ${d.text}`)
      .join("\n");
    const blob = new Blob([patch], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "changes.patch";
    a.click();
    URL.revokeObjectURL(url);
    push("Downloaded changes.patch", "success");
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Editor Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Original Text
              </span>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                {left.split("\n").length} lines
              </span>
            </div>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder="Paste original text here…"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs font-mono resize-y outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Modified Text
              </span>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                {right.split("\n").length} lines
              </span>
            </div>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder="Paste modified text here…"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs font-mono resize-y outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Diff Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "split"
                    ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text)]"
                }`}
              >
                <Columns size={13} /> Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "unified"
                    ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text)]"
                }`}
              >
                <AlignLeft size={13} /> Unified View
              </button>
            </div>

            <button
              type="button"
              onClick={swap}
              className="press px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5"
              title="Swap Left & Right"
            >
              <ArrowLeftRight size={13} /> Swap
            </button>

            {/* Options */}
            <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-dim)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreWs}
                onChange={(e) => setIgnoreWs(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span>Ignore Whitespace</span>
            </label>

            <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-dim)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span>Ignore Case</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={copyPatch} className="!px-3 !py-1.5 text-xs">
              {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Diff"}
            </Button>
            <Button variant="secondary" onClick={downloadPatch} className="!px-3 !py-1.5 text-xs">
              <Download size={14} /> .patch
            </Button>
          </div>
        </div>

        {/* Diff Stats Banner */}
        <div className="flex items-center gap-2 mt-4 text-xs font-mono">
          <Badge variant="success">+{addedCount} added</Badge>
          <Badge variant="danger">-{removedCount} removed</Badge>
          <span className="text-[var(--text-dim)]">{sameCount} unchanged</span>
        </div>

        {/* Diff Output Display */}
        <div className="mt-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl overflow-hidden font-mono text-xs shadow-inner">
          {viewMode === "unified" ? (
            <div className="divide-y divide-[var(--border)]/40 overflow-x-auto">
              {diff.map((d, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-3 py-1 leading-relaxed ${
                    d.type === "added"
                      ? "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]"
                      : d.type === "removed"
                      ? "bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]"
                      : "text-[var(--text-dim)]"
                  }`}
                >
                  <span className="w-8 shrink-0 select-none text-[10px] text-[var(--text-dim)] opacity-50 font-mono">
                    {d.leftNum || d.rightNum || " "}
                  </span>
                  <span className="w-5 shrink-0 select-none font-bold">
                    {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1">{d.text || " "}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto divide-y divide-[var(--border)]/40">
              <div className="grid grid-cols-2 divide-x divide-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider select-none">
                <div>Original Version</div>
                <div className="pl-3">Modified Version</div>
              </div>
              {diff.map((d, idx) => (
                <div key={idx} className="grid grid-cols-2 divide-x divide-[var(--border)]/60 text-xs">
                  {/* Left (Original) */}
                  <div
                    className={`flex items-start px-3 py-1 min-w-0 ${
                      d.type === "removed"
                        ? "bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]"
                        : d.type === "added"
                        ? "bg-[var(--bg-card)]/40 text-transparent select-none"
                        : "text-[var(--text-dim)]"
                    }`}
                  >
                    <span className="w-7 shrink-0 select-none text-[10px] text-[var(--text-dim)] opacity-50 font-mono">
                      {d.leftNum || ""}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">{d.leftText || " "}</span>
                  </div>

                  {/* Right (Modified) */}
                  <div
                    className={`flex items-start px-3 py-1 min-w-0 ${
                      d.type === "added"
                        ? "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]"
                        : d.type === "removed"
                        ? "bg-[var(--bg-card)]/40 text-transparent select-none"
                        : "text-[var(--text-dim)]"
                    }`}
                  >
                    <span className="w-7 shrink-0 select-none text-[10px] text-[var(--text-dim)] opacity-50 font-mono">
                      {d.rightNum || ""}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">{d.rightText || " "}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </ToolShell>
  );
}
