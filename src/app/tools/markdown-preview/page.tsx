"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Quote,
  Code,
  Link,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Copy,
  Check,
  Download,
  Columns,
  Eye,
  Edit3,
} from "lucide-react";

const tool = findTool("markdown-preview")!;

const defaultMarkdown = `# Welcome to Workbench Markdown

A powerful, live in-browser **Markdown Editor & Previewer** designed for speed and clarity.

## Key Features
- **Real-time rendering** with instant feedback
- *Sensory rich formatting* with support for code blocks, tables, and task lists
- Export directly to HTML or download as a \`.md\` file

### Code Example
\`\`\`typescript
interface UserProfile {
  id: string;
  name: string;
  verified: boolean;
}
\`\`\`

### Task List
- [x] Write high performance code
- [x] Test across mobile viewports
- [ ] Deploy to production

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

| Feature | Support | Performance |
| :--- | :--- | :--- |
| Tables | Full GFM | Instant |
| Code Blocks | Syntax Highlight | 60 FPS |
`;

export default function Page() {
  const { push } = useToast();
  const [text, setText] = useState(defaultMarkdown);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const html = useMemo(() => {
    const raw = marked.parse(text, { async: false }) as string;
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(raw);
  }, [text]);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMinutes };
  }, [text]);

  const insertSnippet = (before: string, after = "") => {
    setText((prev) => prev + "\n" + before + after);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(text);
    push("Markdown copied to clipboard", "success");
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1500);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    push("Rendered HTML copied to clipboard", "success");
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 1500);
  };

  const downloadMd = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
    push("Downloaded document.md", "success");
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
          {/* Quick formatting tools */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { icon: Bold, label: "Bold", fn: () => insertSnippet("**bold text**") },
              { icon: Italic, label: "Italic", fn: () => insertSnippet("*italic text*") },
              { icon: Strikethrough, label: "Strike", fn: () => insertSnippet("~~strikethrough~~") },
              { icon: Heading1, label: "H1", fn: () => insertSnippet("# Heading 1\n") },
              { icon: Heading2, label: "H2", fn: () => insertSnippet("## Heading 2\n") },
              { icon: Quote, label: "Quote", fn: () => insertSnippet("> Quote here\n") },
              { icon: Code, label: "Code", fn: () => insertSnippet("```ts\n// Code here\n```\n") },
              { icon: Link, label: "Link", fn: () => insertSnippet("[Link Text](https://example.com)") },
              { icon: List, label: "Bullet List", fn: () => insertSnippet("- Item 1\n- Item 2\n") },
              { icon: ListOrdered, label: "Numbered List", fn: () => insertSnippet("1. Item 1\n2. Item 2\n") },
              { icon: CheckSquare, label: "Task List", fn: () => insertSnippet("- [ ] Todo task\n") },
              { icon: Table, label: "Table", fn: () => insertSnippet("| Col 1 | Col 2 |\n| --- | --- |\n| Data 1 | Data 2 |\n") },
            ].map((btn, i) => {
              const Icon = btn.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={btn.fn}
                  className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
                  title={btn.label}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden sm:flex px-2.5 py-1 rounded-lg font-semibold items-center gap-1 transition-all ${
                viewMode === "split" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
              }`}
            >
              <Columns size={13} /> Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                viewMode === "edit" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
              }`}
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                viewMode === "preview" ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-[var(--shadow-sm)]" : "text-[var(--text-dim)]"
              }`}
            >
              <Eye size={13} /> Preview
            </button>
          </div>
        </div>

        {/* Live Editors Container */}
        <div className="grid gap-4" style={{ gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr" }}>
          {(viewMode === "split" || viewMode === "edit") && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={18}
              spellCheck={false}
              placeholder="Write Markdown here…"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono outline-none focus:border-[var(--accent)] transition-all resize-y leading-relaxed"
            />
          )}

          {(viewMode === "split" || viewMode === "preview") && (
            <div
              className="prose-preview bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-5 py-4 overflow-y-auto max-h-[520px] text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        {/* Action & Stats Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] font-mono">
            <span>{stats.words} words</span> · <span>{stats.chars} chars</span> · <span>~{stats.readMinutes} min read</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={copyMarkdown} className="!px-3 !py-1.5 text-xs">
              {copiedMd ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
              {copiedMd ? "Copied" : "Copy Markdown"}
            </Button>
            <Button variant="ghost" onClick={copyHtml} className="!px-3 !py-1.5 text-xs">
              {copiedHtml ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
              {copiedHtml ? "Copied" : "Copy HTML"}
            </Button>
            <Button variant="secondary" onClick={downloadMd} className="!px-3 !py-1.5 text-xs">
              <Download size={14} /> Export .md
            </Button>
          </div>
        </div>

        <style jsx global>{`
          .prose-preview h1, .prose-preview h2, .prose-preview h3, .prose-preview h4 {
            font-weight: 700;
            margin: 0.8em 0 0.4em;
            color: var(--text);
          }
          .prose-preview h1 { font-size: 1.6em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
          .prose-preview h2 { font-size: 1.3em; border-bottom: 1px solid var(--border); padding-bottom: 0.2em; }
          .prose-preview h3 { font-size: 1.1em; }
          .prose-preview p { margin: 0.6em 0; color: var(--text); }
          .prose-preview a { color: var(--accent); text-decoration: underline; }
          .prose-preview code { background: var(--bg-card); padding: 0.15em 0.4em; border-radius: 6px; font-family: monospace; font-size: 0.85em; border: 1px solid var(--border); }
          .prose-preview pre { background: var(--bg-card); padding: 1em; border-radius: 12px; overflow-x: auto; border: 1px solid var(--border); margin: 0.8em 0; }
          .prose-preview pre code { background: transparent; padding: 0; border: none; }
          .prose-preview ul, .prose-preview ol { padding-left: 1.4em; margin: 0.6em 0; }
          .prose-preview blockquote { border-left: 3px solid var(--accent); padding-left: 1em; color: var(--text-dim); margin: 0.8em 0; font-style: italic; }
          .prose-preview table { width: 100%; border-collapse: collapse; margin: 0.8em 0; }
          .prose-preview th, .prose-preview td { border: 1px solid var(--border); padding: 0.4em 0.7em; text-align: left; }
          .prose-preview th { background: var(--bg-card); font-weight: 600; }
        `}</style>
      </Card>
    </ToolShell>
  );
}
