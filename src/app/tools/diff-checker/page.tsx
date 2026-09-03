"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("diff-checker")!;

// Simple line-based LCS diff
function diffLines(a: string[], b: string[]) {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: { type: "same" | "removed" | "added"; text: string }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) { result.push({ type: "removed", text: a[i] }); i++; }
  while (j < m) { result.push({ type: "added", text: b[j] }); j++; }
  return result;
}

export default function Page() {
  const [left, setLeft] = useState("The quick brown fox\njumps over the lazy dog\nGoodbye");
  const [right, setRight] = useState("The quick brown fox\njumps over the sleepy dog\nGoodbye\nExtra line");

  const diff = useMemo(() => diffLines(left.split("\n"), right.split("\n")), [left, right]);
  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Original">
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={8}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y"
            />
          </Field>
          <Field label="Changed">
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={8}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y"
            />
          </Field>
        </div>

        <p className="text-xs text-[var(--text-dim)] mt-4">
          <span className="text-[var(--accent)]">+{added} added</span> · <span className="text-[var(--danger)]">-{removed} removed</span>
        </p>

        <div className="mt-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg overflow-hidden font-mono text-xs">
          {diff.map((d, i) => (
            <div
              key={i}
              className="px-3 py-1 whitespace-pre-wrap"
              style={{
                background:
                  d.type === "added" ? "rgba(94,234,212,0.1)" : d.type === "removed" ? "rgba(251,113,133,0.1)" : "transparent",
                color: d.type === "added" ? "var(--accent)" : d.type === "removed" ? "var(--danger)" : "var(--text-dim)",
                borderLeft: `2px solid ${d.type === "added" ? "var(--accent)" : d.type === "removed" ? "var(--danger)" : "transparent"}`,
              }}
            >
              {d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  "}
              {d.text || " "}
            </div>
          ))}
        </div>
      </Card>
    </ToolShell>
  );
}
