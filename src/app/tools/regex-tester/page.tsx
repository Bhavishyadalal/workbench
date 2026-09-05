"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass, Button, Badge, Tabs } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Check, Copy, Sparkles, BookOpen, Replace, Eye, ListFilter } from "lucide-react";

const tool = findTool("regex-tester")!;

const presets = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "g" },
  { name: "IPv4 Address", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
  { name: "Hex Color", pattern: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b", flags: "g" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])\\b", flags: "g" },
  { name: "HTML Tags", pattern: "<\\/?[a-zA-Z0-9]+(?:\\s+[^>]*)?>", flags: "g" },
  { name: "Words", pattern: "\\b[A-Z][a-z]+\\b", flags: "g" },
];

const flagsList = [
  { flag: "g", label: "Global", desc: "Don't return after first match" },
  { flag: "i", label: "Insensitive", desc: "Case-insensitive matching" },
  { flag: "m", label: "Multiline", desc: "^ and $ match start/end of line" },
  { flag: "s", label: "DotAll", desc: ". matches newlines as well" },
  { flag: "u", label: "Unicode", desc: "Treat pattern as full Unicode" },
];

export default function Page() {
  const { push } = useToast();
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("Contact us at support@example.com or reach billing@workbench.dev for invoice queries.");
  const [replaceStr, setReplaceStr] = useState("[REDACTED]");
  const [tab, setTab] = useState<"match" | "replace">("match");
  const [copied, setCopied] = useState(false);

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
  };

  const { matches, detailedMatches, error, highlighted, replacedText } = useMemo(() => {
    try {
      if (!pattern) {
        return { matches: [], detailedMatches: [], error: "", highlighted: testStr, replacedText: testStr };
      }
      const activeFlags = flags.includes("g") ? flags : flags + "g";
      const re = new RegExp(pattern, activeFlags);
      const found: string[] = [];
      const details: { index: number; text: string; groups: string[] }[] = [];
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let m: RegExpExecArray | null;
      let count = 0;

      while ((m = re.exec(testStr)) !== null && count < 1000) {
        found.push(m[0]);
        details.push({
          index: m.index,
          text: m[0],
          groups: m.slice(1),
        });

        parts.push(testStr.slice(lastIndex, m.index));
        parts.push(
          <mark
            key={m.index}
            className="rounded px-1 font-semibold text-[var(--accent-ink)]"
            style={{ background: "var(--accent)" }}
          >
            {m[0]}
          </mark>
        );
        lastIndex = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
        count++;
      }
      parts.push(testStr.slice(lastIndex));

      // Replaced text
      const replaced = testStr.replace(new RegExp(pattern, activeFlags), replaceStr);

      return {
        matches: found,
        detailedMatches: details,
        error: "",
        highlighted: parts,
        replacedText: replaced,
      };
    } catch (e: any) {
      return {
        matches: [],
        detailedMatches: [],
        error: e?.message || "Invalid regular expression",
        highlighted: testStr,
        replacedText: testStr,
      };
    }
  }, [pattern, flags, testStr, replaceStr]);

  const copyReplaced = async () => {
    await navigator.clipboard.writeText(replacedText);
    push("Replaced string copied to clipboard", "success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Presets Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-xs font-semibold text-[var(--text-dim)] flex items-center gap-1 mr-1">
            <BookOpen size={13} className="text-[var(--accent)]" /> Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
              }}
              className="press px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Pattern & Flags Inputs */}
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <Field label="Regular Expression Pattern">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[var(--text-dim)] select-none">/</span>
              <input
                className={`${inputClass} font-mono !pl-7 !pr-7 !text-sm`}
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. [a-z0-9]+"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[var(--text-dim)] select-none">/{flags}</span>
            </div>
          </Field>

          {/* Flag Toggle Pills */}
          <div>
            <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-1.5">
              Flags
            </span>
            <div className="flex gap-1">
              {flagsList.map((f) => {
                const active = flags.includes(f.flag);
                return (
                  <button
                    key={f.flag}
                    type="button"
                    onClick={() => toggleFlag(f.flag)}
                    className={`press w-9 h-11 rounded-xl border text-xs font-mono font-bold transition-all ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-bright)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                    }`}
                    title={`${f.label} (${f.flag}): ${f.desc}`}
                  >
                    {f.flag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,var(--bg-elevated))] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] text-xs text-[var(--danger)] font-mono">
            {error}
          </div>
        )}

        {/* Test String Area */}
        <div className="mt-5">
          <Field label="Test String / Text to Match">
            <textarea
              value={testStr}
              onChange={(e) => setTestStr(e.target.value)}
              rows={4}
              spellCheck={false}
              className={`${inputClass} font-mono text-xs resize-y`}
              placeholder="Paste or type test text here…"
            />
          </Field>
        </div>

        {/* Tab switch between Match Inspector and Replacement */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "match", label: `Matches (${matches.length})`, icon: Eye },
              { value: "replace", label: "Replace / Substitute", icon: Replace },
            ]}
          />

          {tab === "match" ? (
            <div className="mt-4 space-y-4">
              {/* Highlighted Match Box */}
              <div>
                <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-2">
                  Match Preview
                </span>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {highlighted}
                </div>
              </div>

              {/* Detailed Matches Table */}
              {detailedMatches.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-2">
                    Detailed Captures
                  </span>
                  <div className="border border-[var(--border)] rounded-2xl overflow-hidden text-xs font-mono max-h-56 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-dim)] text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Match</th>
                          <th className="p-2.5">Index</th>
                          <th className="p-2.5">Groups</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-elevated)]">
                        {detailedMatches.map((m, idx) => (
                          <tr key={idx} className="hover:bg-[var(--bg-card)] transition-colors">
                            <td className="p-2.5 text-[var(--text-dim)]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-[var(--accent-bright)] break-all">{m.text}</td>
                            <td className="p-2.5 text-[var(--text-dim)]">{m.index}</td>
                            <td className="p-2.5 text-[var(--text-dim)]">
                              {m.groups.length > 0 ? m.groups.join(", ") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <Field label="Replacement String">
                <input
                  className={`${inputClass} font-mono text-xs`}
                  value={replaceStr}
                  onChange={(e) => setReplaceStr(e.target.value)}
                  placeholder="e.g. $1 or [REDACTED]"
                />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                    Replacement Output
                  </span>
                  <Button variant="ghost" onClick={copyReplaced} className="!px-2.5 !py-1 text-xs">
                    {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Output"}
                  </Button>
                </div>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto text-[var(--text)]">
                  {replacedText}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </ToolShell>
  );
}
