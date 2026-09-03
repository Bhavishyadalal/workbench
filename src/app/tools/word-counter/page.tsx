"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("word-counter")!;

export default function Page() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const readingMinutes = words / 200;
    return { words, chars, charsNoSpaces, sentences, paragraphs, readingMinutes };
  }, [text]);

  const stat = (label: string, value: string | number) => (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3">
      <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      <div className="text-xs text-[var(--text-dim)] mt-0.5">{label}</div>
    </div>
  );

  return (
    <ToolShell tool={tool}>
      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          rows={10}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm resize-y outline-none focus:border-[var(--accent)] transition-colors"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {stat("Words", stats.words)}
          {stat("Characters", stats.chars)}
          {stat("No spaces", stats.charsNoSpaces)}
          {stat("Sentences", stats.sentences)}
          {stat("Paragraphs", stats.paragraphs)}
          {stat("Read time", `${Math.max(1, Math.ceil(stats.readingMinutes))} min`)}
        </div>
      </Card>
    </ToolShell>
  );
}
