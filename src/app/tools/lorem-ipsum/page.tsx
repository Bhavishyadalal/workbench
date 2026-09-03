"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, Button, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check } from "lucide-react";

const tool = findTool("lorem-ipsum")!;

const words = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum",
];

function makeSentence(): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const chosen = Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]);
  const s = chosen.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function makeParagraph(sentences: number): string {
  return Array.from({ length: sentences }, makeSentence).join(" ");
}

export default function Page() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPer, setSentencesPer] = useState(5);
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    void seed;
    return Array.from({ length: paragraphs }, () => makeParagraph(sentencesPer)).join("\n\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphs, sentencesPer, seed]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={`Paragraphs — ${paragraphs}`}>
            <input
              type="range"
              min={1}
              max={10}
              value={paragraphs}
              onChange={(e) => setParagraphs(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
          <Field label={`Sentences per paragraph — ${sentencesPer}`}>
            <input
              type="range"
              min={2}
              max={12}
              value={sentencesPer}
              onChange={(e) => setSentencesPer(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>

        <textarea
          readOnly
          value={text}
          rows={10}
          className={`${inputClass} mt-5 leading-relaxed resize-y`}
        />

        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button variant="ghost" onClick={() => setSeed((s) => s + 1)}>
            Regenerate
          </Button>
        </div>
      </Card>
    </ToolShell>
  );
}
