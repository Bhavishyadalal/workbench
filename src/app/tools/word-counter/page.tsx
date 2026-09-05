"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Copy, Check, Sparkles, BookOpen, Clock, Mic, AlignLeft, BarChart2, Trash2 } from "lucide-react";

const tool = findTool("word-counter")!;

export default function Page() {
  const { push } = useToast();
  const [text, setText] = useState(
    "Workbench is a client-side suite of 34 privacy-first utility tools that run entirely in your web browser. None of your data, files, or sensitive information ever leaves your device."
  );
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || (trimmed ? 1 : 0) : 0;
    const paragraphs = trimmed ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const lines = text ? text.split("\n").length : 0;

    // Unique words & lexical density
    const cleanWords = words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean);
    const uniqueWords = new Set(cleanWords).size;
    const lexicalDensity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;

    // Flesch Reading Ease estimate
    const avgSentenceLength = sentences > 0 ? wordCount / sentences : 0;
    // rough syllable estimator
    const syllables = cleanWords.reduce((acc, word) => {
      const syl = word.match(/[aeiouy]{1,2}/g)?.length || 1;
      return acc + syl;
    }, 0);
    const avgSyllablesPerWord = wordCount > 0 ? syllables / wordCount : 1;
    let fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    fleschScore = Math.max(0, Math.min(100, Math.round(fleschScore)));

    let readingLevel = "Easy";
    if (fleschScore < 30) readingLevel = "Very Difficult / Academic";
    else if (fleschScore < 50) readingLevel = "Difficult / College";
    else if (fleschScore < 65) readingLevel = "Standard / High School";
    else if (fleschScore < 80) readingLevel = "Fairly Easy";
    else readingLevel = "Very Easy";

    // Top words frequency
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "are", "it", "that", "this", "your"]);
    cleanWords.forEach((w) => {
      if (w.length > 2 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w, count]) => ({ word: w, count }));

    return {
      wordCount,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      lines,
      uniqueWords,
      lexicalDensity,
      fleschScore,
      readingLevel,
      topWords,
      readMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      speakMinutes: Math.max(1, Math.ceil(wordCount / 130)),
    };
  }, [text]);

  const cleanWhitespace = () => {
    const cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    setText(cleaned);
    push("Extra whitespace removed", "success");
  };

  const removeEmptyLines = () => {
    const cleaned = text.split("\n").filter((l) => l.trim().length > 0).join("\n");
    setText(cleaned);
    push("Blank lines removed", "success");
  };

  const toSentenceCase = () => {
    const cleaned = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(cleaned);
    push("Converted to sentence case", "success");
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    push("Text copied to clipboard", "success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[var(--text-dim)] font-semibold uppercase tracking-wider text-[10px] mr-1">
              Utilities:
            </span>
            <button
              onClick={cleanWhitespace}
              className="press px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent-dim)] transition-all"
            >
              Trim Spaces
            </button>
            <button
              onClick={removeEmptyLines}
              className="press px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent-dim)] transition-all"
            >
              Strip Blank Lines
            </button>
            <button
              onClick={toSentenceCase}
              className="press px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent-dim)] transition-all"
            >
              Sentence Case
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setText("")} className="!px-2.5 !py-1 text-xs text-[var(--danger)]">
              <Trash2 size={13} /> Clear
            </Button>
            <Button variant="secondary" onClick={copyText} className="!px-3 !py-1 text-xs">
              {copied ? <Check size={13} className="text-[var(--success)]" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Main Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or start typing your text here…"
          rows={9}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-sm resize-y outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
        />

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="text-3xl font-bold font-mono text-[var(--accent-bright)]">
              {stats.wordCount.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mt-1">
              Words
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="text-3xl font-bold font-mono text-[var(--text)]">
              {stats.chars.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mt-1">
              Characters
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="text-3xl font-bold font-mono text-[var(--text)]">
              {stats.sentences.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mt-1">
              Sentences
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="text-3xl font-bold font-mono text-[var(--text)]">
              {stats.paragraphs.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mt-1">
              Paragraphs
            </div>
          </div>
        </div>

        {/* Secondary Detailed Metrics */}
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-dim)]">No Spaces Chars:</span>
            <span className="font-mono text-sm font-semibold">{stats.charsNoSpaces.toLocaleString()}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-dim)]">Unique Words:</span>
            <span className="font-mono text-sm font-semibold">{stats.uniqueWords.toLocaleString()} ({stats.lexicalDensity}%)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-dim)]">Total Lines:</span>
            <span className="font-mono text-sm font-semibold">{stats.lines}</span>
          </div>
        </div>

        {/* Reading & Speaking Times + Readability */}
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--text-dim)]">Reading Time</div>
              <div className="text-sm font-bold font-mono">{stats.readMinutes} min (200 wpm)</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] text-[var(--accent-2)] shrink-0">
              <Mic size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--text-dim)]">Speaking Time</div>
              <div className="text-sm font-bold font-mono">{stats.speakMinutes} min (130 wpm)</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--text-dim)]">Readability Ease</div>
              <div className="text-sm font-bold font-mono">{stats.fleschScore}/100 ({stats.readingLevel})</div>
            </div>
          </div>
        </div>

        {/* Top Keywords Frequency */}
        {stats.topWords.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-2.5">
              Top Keywords
            </span>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map((item) => (
                <div
                  key={item.word}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-2 text-xs"
                >
                  <span className="font-medium text-[var(--text)]">{item.word}</span>
                  <Badge variant="accent">{item.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
