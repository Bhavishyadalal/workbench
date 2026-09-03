"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("regex-tester")!;

export default function Page() {
  const [pattern, setPattern] = useState("\\b[A-Z][a-z]+\\b");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("Hello World, this is a Test string with Several Capitalized words.");

  const { matches, error, highlighted } = useMemo(() => {
    try {
      if (!pattern) return { matches: [], error: "", highlighted: testStr };
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const found: string[] = [];
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let m: RegExpExecArray | null;
      let count = 0;
      while ((m = re.exec(testStr)) !== null && count < 1000) {
        found.push(m[0]);
        parts.push(testStr.slice(lastIndex, m.index));
        parts.push(
          <mark key={m.index} style={{ background: "var(--accent)", color: "var(--accent-ink)", borderRadius: 2 }}>
            {m[0]}
          </mark>
        );
        lastIndex = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
        count++;
      }
      parts.push(testStr.slice(lastIndex));
      return { matches: found, error: "", highlighted: parts };
    } catch (e) {
      return { matches: [], error: (e as Error).message, highlighted: testStr };
    }
  }, [pattern, flags, testStr]);

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <Field label="Pattern">
            <input
              className={`${inputClass} font-mono`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \\d+"
            />
          </Field>
          <Field label="Flags">
            <input
              className={`${inputClass} font-mono w-24`}
              value={flags}
              onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
              placeholder="gi"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Test string">
            <textarea
              value={testStr}
              onChange={(e) => setTestStr(e.target.value)}
              rows={5}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-[var(--danger)] mt-3">Invalid pattern: {error}</p>}

        <div className="mt-5">
          <p className="text-xs font-medium text-[var(--text-dim)] mb-2">
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </p>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
            {highlighted}
          </div>
        </div>
      </Card>
    </ToolShell>
  );
}
