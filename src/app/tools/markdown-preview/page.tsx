"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ToolShell from "@/components/ToolShell";
import { Card } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("markdown-preview")!;

const defaultText = `# Heading

Some **bold** text, some *italic* text, and a [link](https://example.com).

- List item one
- List item two

\`\`\`
code block
\`\`\`
`;

export default function Page() {
  const [text, setText] = useState(defaultText);

  const html = useMemo(() => {
    const raw = marked.parse(text, { async: false }) as string;
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(raw);
  }, [text]);

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid lg:grid-cols-2 gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setText("");
            }}
            rows={16}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y"
          />
          <div
            className="prose-preview bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 overflow-auto text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <p className="hidden sm:block text-xs text-[var(--text-dim)] mt-2">
          <kbd>Esc</kbd> (while editing) to clear
        </p>
        <style jsx global>{`
          .prose-preview h1, .prose-preview h2, .prose-preview h3 {
            font-family: var(--font-display);
            font-weight: 600;
            margin: 0.6em 0 0.3em;
          }
          .prose-preview h1 { font-size: 1.6em; }
          .prose-preview h2 { font-size: 1.3em; }
          .prose-preview p { margin: 0.5em 0; }
          .prose-preview a { color: var(--accent); }
          .prose-preview code { background: var(--bg-elevated); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.85em; }
          .prose-preview pre { background: var(--bg-elevated); padding: 0.8em; border-radius: 8px; overflow-x: auto; }
          .prose-preview ul, .prose-preview ol { padding-left: 1.4em; margin: 0.5em 0; }
          .prose-preview blockquote { border-left: 2px solid var(--accent); padding-left: 1em; color: var(--text-dim); }
        `}</style>
      </Card>
    </ToolShell>
  );
}
