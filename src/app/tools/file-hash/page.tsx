"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Dropzone, Skeleton, Button, Badge, Tabs, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, ShieldCheck, ShieldAlert, FileText, Hash, Download, CheckCircle2, XCircle } from "lucide-react";

const tool = findTool("file-hash")!;

const algos: { label: string; algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" }[] = [
  { label: "SHA-256 (Standard)", algo: "SHA-256" },
  { label: "SHA-512 (Ultra Secure)", algo: "SHA-512" },
  { label: "SHA-384", algo: "SHA-384" },
  { label: "SHA-1 (Legacy)", algo: "SHA-1" },
];

function bufferToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Page() {
  const { push } = useToast();
  const [mode, setMode] = useState<"file" | "text">("file");

  // File hashing state
  const [file, setFile] = useState<File | null>(null);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Text hashing state
  const [textInput, setTextInput] = useState("Hello, Workbench!");
  const [textHashes, setTextHashes] = useState<Record<string, string>>({});

  // Checksum verification
  const [verifyInput, setVerifyInput] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hashBuffer = async (buf: ArrayBuffer): Promise<Record<string, string>> => {
    const results: Record<string, string> = {};
    for (const { label, algo } of algos) {
      const digest = await crypto.subtle.digest(algo, buf);
      results[label] = bufferToHex(digest);
    }
    return results;
  };

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setBusy(true);
    setFileHashes({});
    try {
      const buf = await f.arrayBuffer();
      const results = await hashBuffer(buf);
      setFileHashes(results);
      push(`Calculated hashes for ${f.name}`, "success");
    } finally {
      setBusy(false);
    }
  };

  const handleTextChange = async (val: string) => {
    setTextInput(val);
    if (!val) {
      setTextHashes({});
      return;
    }
    const encoder = new TextEncoder();
    const buf = encoder.encode(val).buffer;
    const results = await hashBuffer(buf);
    setTextHashes(results);
  };

  const activeHashes = mode === "file" ? fileHashes : textHashes;

  // Checksum comparison
  const verificationMatch = (() => {
    const clean = verifyInput.trim().toLowerCase();
    if (!clean) return null;
    for (const [label, hash] of Object.entries(activeHashes)) {
      if (hash.toLowerCase() === clean) {
        return { match: true, algo: label };
      }
    }
    return { match: false };
  })();

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    push(`Copied ${key}`, "success");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  const exportReport = () => {
    const lines = [
      `Workbench Checksum Report`,
      `Date: ${new Date().toISOString()}`,
      mode === "file" && file ? `Target: File (${file.name}, ${file.size} bytes)` : `Target: Text Input`,
      `----------------------------------------`,
      ...Object.entries(activeHashes).map(([k, v]) => `${k}: ${v}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hashes-${mode === "file" && file ? file.name : "text"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    push("Downloaded checksum report", "success");
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Mode Switcher */}
        <div className="mb-6">
          <Tabs
            value={mode}
            onChange={(m) => {
              setMode(m);
              if (m === "text" && !Object.keys(textHashes).length) {
                handleTextChange(textInput);
              }
            }}
            options={[
              { value: "file", label: "File Checksum", icon: FileText },
              { value: "text", label: "Text / String Hash", icon: Hash },
            ]}
          />
        </div>

        {mode === "file" ? (
          <div>
            <Dropzone
              onFiles={handleFile}
              accept="*"
              file={file}
              onClear={() => {
                setFile(null);
                setFileHashes({});
              }}
              hint="Any file type — runs completely client-side in your browser"
            />

            {file && (
              <div className="mt-4 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono grid sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase block font-sans">File Name</span>
                  <span className="font-bold truncate block">{file.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase block font-sans">File Size</span>
                  <span className="font-bold">{(file.size / 1024).toFixed(1)} KB ({file.size.toLocaleString()} bytes)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase block font-sans">MIME Type</span>
                  <span className="font-bold">{file.type || "application/octet-stream"}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Field label="Text Input to Hash">
              <textarea
                value={textInput}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={4}
                placeholder="Type or paste text to compute hashes in real time…"
                className={`${inputClass} font-mono text-xs resize-y`}
              />
            </Field>
          </div>
        )}

        {/* Loading Skeletons */}
        {busy && (
          <div className="space-y-2 mt-5">
            {algos.map(({ label }) => (
              <Skeleton key={label} className="h-14 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Generated Hashes List */}
        {!busy && Object.keys(activeHashes).length > 0 && (
          <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Cryptographic Hashes
              </span>
              <Button variant="ghost" onClick={exportReport} className="!px-2.5 !py-1 text-xs">
                <Download size={13} /> Export Report
              </Button>
            </div>

            <div className="space-y-2">
              {algos.map(({ label }) => {
                const hashVal = activeHashes[label];
                if (!hashVal) return null;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => copy(label, hashVal)}
                    className="press w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-dim)] transition-all text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                        {label}
                      </div>
                      <div className="text-xs font-mono font-medium text-[var(--text)] truncate mt-0.5 group-hover:text-[var(--accent-bright)]">
                        {hashVal}
                      </div>
                    </div>
                    <div className="shrink-0 p-1 text-[var(--text-dim)] group-hover:text-[var(--accent)]">
                      {copiedKey === label ? (
                        <Check size={16} className="text-[var(--success)]" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Checksum Verifier Box */}
            <div className="mt-6 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5 mb-2">
                <ShieldCheck size={14} className="text-[var(--accent)]" /> Verify Against Expected Checksum
              </span>
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="Paste expected SHA-256 or SHA-1 hash to verify…"
                className={`${inputClass} font-mono text-xs`}
              />

              {verificationMatch && (
                <div className="mt-3">
                  {verificationMatch.match ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--success)_12%,var(--bg-card))] border border-[color-mix(in_srgb,var(--success)_30%,transparent)] text-xs text-[var(--success)] font-bold">
                      <CheckCircle2 size={16} /> Checksum MATCHES ({verificationMatch.algo})! File integrity verified.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,var(--bg-card))] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] text-xs text-[var(--danger)] font-bold">
                      <XCircle size={16} /> Checksum MISMATCH. Does not match any calculated hash.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
